var request = require('superagent'),
	should = require('should'),
	mocha = require('mocha');

describe('Successfully retrieves all the customers', function() {
	var agent = request.agent();

	it('should Successfully retrieves all the customers', function(done) {
		agent
			.get('http://localhost:3007/rest/customers')
			.auth('username', 'password')
			.set('Accept', 'application/json')
			.end(function(err, res) {
				should.not.exist(err);
				res.should.have.status(200);
				res.should.have.property('body');
				// FIXME add further checks if appropriate
				
				var path = require('path');
				var JaySchema = require('jayschema');
				var js = new JaySchema(JaySchema.loaders.http);
				var schema = require(path.resolve('services/customers', 'getCustomers-responseBody-validationschema.json'));
				js.validate(res.body, schema, function(errs) {
					should.not.exist(errs);
					done();
				});
				
				
			});
	});
});