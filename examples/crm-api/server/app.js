var fs = require( 'fs' );
var express = require( 'express' );
var request = require( 'request' );
// var diag = require( 'diag' );
var api = require('./api.js');
var services = require('restapi').services;
// var services = require('../../../services.js');

var httpProxy = require('http-proxy');

var proxy = new httpProxy.RoutingProxy();

function apiProxy(host, port) {
    return function (req, res, next) {
        // console.log('apiProxy called to ' + req.host + ' ' + req.ip);
        if ((req.url.match(new RegExp('^' + config.serviceUrlPrefix.replace(/\//gi, '\\/') + '\\/')) ||
            req.url.match(new RegExp('^' + config.hornetqUrlPrefix.replace(/\//gi, '\\/') + '\\/'))) &&
            config.useRemoteServices) {
            console.log('forwarding ' + req.method + ' ' + req.url + ' request to ' + req.method + ' ' + host + ':' + port + req.url + '  from '+ req.host + ' - ' + req.ip);
            var proxyBuffer = httpProxy.buffer(req);
            proxy.proxyRequest(req, res, {host: host, port: port, buffer: proxyBuffer});
        } else {
            next();
        }
    }
}

// Get configured
var config = {};
exports.config = config;
if( process.argv.length >= 3 ) {
    var baseConfig = require( './config.js' );
    config = baseConfig.setEnvironment( process.argv[2] );
} else {
    config = require( './config.js' ).parameters;
}
console.log( config );

var app = module.exports = express();
app.set('env', config.environment );

// Configure the middlewares
app.configure( function() {
        app.use( apiProxy(config.remoteHost, config.remotePort) );
        app.use( express.bodyParser() );
        app.use( express.methodOverride() );
        app.use( express.cookieParser() );
        app.use( express.session( {secret: 'keyboard cat'} ) );
        app.use( app.router );
        // app.use( '/data', express.static( __dirname + '/' + '../resources/data' ) );
        app.use( '/docs', express.static( __dirname + '/' + '../docs/build' ) );
        app.use( express.static( __dirname + '/' + config.documentRoot ) );
    });

app.configure( 'development', function() {
        app.use( express.errorHandler( {
                    dumpExceptions: true,
                    showStack: true
                }));
    });

app.configure( 'production', function() {
        app.use( express.errorHandler() );
    });

function restrict( req, res, next ) {
    next();
}

function accessLogger( req, res, next ) {
    console.log( req.method, req.url );
    next();
}

// Routes
app.all("*", accessLogger, restrict);

// Diagnostics service
// app.get( '/isAlive', diag.isAlive );

function writeHeader(response) {
    response.header( 'Content-Type', 'application/json' );
    response.header( 'X-CRM-Version', 'v0.1' );
    response.header( 'X-CRM-API-Version', 'v0.1' );
}
exports.writeHeader = writeHeader;

function writeResponse(response, content) {
    writeHeader(response);
    response.write( JSON.stringify(content, null, '  ') );
    response.end( '\n' );
}
exports.writeResponse = writeResponse;

var defaultServiceCall = function (request, response, serviceDesc) {
    response.header( 'Content-Type', 'application/json' );
    // TODO: Use Headers and Cookies from servoceDesc
    writeResponse(response, services.getMockResponseBody(request.method, serviceDesc ) || serviceDesc);
}

var reformatUrlPattern = function (urlPattern) {
    // TODO: Replace {parameter} to :parameter
    var resultPattern = urlPattern.replace(/{/gi, ":").replace(/}/gi, "").toString();
    console.log(resultPattern);
    return resultPattern;
}

// Setup the services for mocking
services.load(__dirname + '/' + config.servicesRoot, config.services);
var allServices = services.getServices();

function registerServiceMethod(serviceDesc, method) {
    console.log('register service ' + method + ' ' + serviceDesc.urlPattern);
    var methodDesc = serviceDesc.methods[method];
    var implementation = eval( serviceDesc.methods[method].implementation ) || defaultServiceCall;
    app[method.toLowerCase()](config.serviceUrlPrefix + reformatUrlPattern(serviceDesc.urlPattern), function(request, response) {
        implementation(request, response, serviceDesc);
    });
}

for ( service in allServices ) {
    if ( allServices.hasOwnProperty(service) ) {
        var serviceDesc = allServices[service];
        for ( method in allServices[service].methods ) {
            if ( serviceDesc.methods.hasOwnProperty(method) ) {
                registerServiceMethod(serviceDesc, method);
            }
        }
    }
}

// Start the server to listen
app.listen( config.port );
console.log( "Express server listening on port %d in %s mode",
    config.port, app.settings.env );
