#!/usr/bin/env node
/* jshint node: true */
'use strict';

(function() {

    var request = require('superagent');
    var should = require('should');
    var agent = request.agent();

    describe('tests the proxy feature with several servers', function() {
        it('should forward service calls to different backends', function(done) {
            agent
                .get('http://localhost:3009/rest/monitoring/isAlive')
                .auth('username', 'password')
                .set('Accept', 'application/json')
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.have.status(200);
                    res.should.have.property('body');
                    // FIXME add further checks if appropriate
                    
                    done();
                });
        });

    });
})();
