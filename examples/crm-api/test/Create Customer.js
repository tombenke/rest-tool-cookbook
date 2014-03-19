var request = require('superagent'),
	should = require('should'),
	mocha = require('mocha');

describe('Succesfully creates a new customer', function() {
	var agent = request.agent();

	it('should Succesfully creates a new customer', function(done) {
		var path = require('path');
		var body = require(path.resolve('services/customers', 'postCustomer-responseBody.json'));
		agent
			.post('http://localhost:3007/rest/customers')
			.auth('username', 'password')
			.send(body)
			.set('Accept', 'application/json')
			.end(function(err, res) {
				should.not.exist(err);
				res.should.have.status(200);
				res.should.have.property('body');
				// FIXME add further checks if appropriate
				
				var JaySchema = require('jayschema');
				var js = new JaySchema(JaySchema.loaders.http);
				var schema = require(path.resolve('services/customers', 'postCustomer-responseBody-validationSchema.json'));
				js.validate(res.body, schema, function(errs) {
					should.not.exist(errs);
					done();
				});
				
				
			});
	});
});