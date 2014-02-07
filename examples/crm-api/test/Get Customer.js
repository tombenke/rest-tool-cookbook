var request = require('superagent'),
	should = require('should'),
	mocha = require('mocha');

describe('Successfully retrieves one customer', function() {
	var agent = request.agent();

	it('should successfully Successfully retrieves one customer', function(done) {
		agent
			.get('http://localhost:3007/rest/customers/1')
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