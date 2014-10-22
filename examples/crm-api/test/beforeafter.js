#!/usr/bin/env node
/* jshint node: true */
'use strict';

(function() {

    var async = require('async');
    var mocha = require('mocha');
    var spawn = require('child_process').spawn;
    var path = require('path');

    var serverPath = path.resolve(__dirname, '../server/server.js');
    var children = [];

    var makeReceiver = function(done) {
        return function(data) {
            var dataString = new String(data);
            // console.log('received: ' + dataString);

            var serverListenRegExp = new RegExp('^Express server listening on port.*');

            if (dataString.match(serverListenRegExp)) {
                console.log('Server is listening on port...');
                done();
            }
        };
    };

    var launchChild = function(opts, cb) {
        var receiver = makeReceiver(cb);
        console.log('Starting server...', serverPath);
        // Spawn the child
        var child = null;

        try {
             child = spawn(opts.path, opts.args);
        } catch(err) {
            console.log(err);
        }

        children.push(child);
        child.stdout.on('data', receiver);
        child.stderr.on('data', receiver);

        child.on('exit', function(code) {
            console.log('Child terminated with code: ' + code);
        });

        return child;
    };

    var stopChild = function(child) {
        child.kill();
        console.log('Child %d is stopped', children.indexOf(child));
        // children.splice(children.indexOf(child), 1);
        return;
    };

    var startServers = function(done) {
        // launchChild({path: 'node', args: [serverPath, 'development']}, done);
        async.each([
                {path: 'node', args: [serverPath, 'development']},
                {path: 'node', args: [serverPath, 'devProxy']},
                {path: 'node', args: [serverPath, 'production']}
            ], launchChild, function(err) {
                if (err) {
                    console.log('Something went wrong...');
                } else {
                    done();
                }
            });
    };

    var stopServers = function() {
        console.log('Stopping servers...');
        children.forEach(function(child) {
            stopChild(child);
        });
    };

    before(function(done) {
        startServers(done);
    });

    after(function() {
        stopServers();
    });
})();
