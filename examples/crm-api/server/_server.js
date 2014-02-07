var express = require('express'),
	app = express();

app.use(express.logger());
app.use(express.basicAuth('John', 'Doe'));
app.use(express.bodyParser());

app.get('/rest/customers', function(req, res) {
    res.header('X-Application-Version', 'v0.4');
    res.header('X-Application-API-Version', 'v0.1');
    res.send([
        {id: 1, name: 'John Doe', tags: ["picky"]},
        {id: 2, name: 'Jean Doe', tags: ["nice", "sexy"]}
	]);
});

app.post('/rest/customers', function(req, res) {
    res.header('X-Application-Version', 'v0.4');
    res.header('X-Application-API-Version', 'v0.1');
	res.send({id: 1, name: 'John Doe', tags: ["picky"]});
});

app.put('/rest/customers/:id', function(req, res) {
    var i = parseInt(req.params.id, 10);
    res.header('X-Application-Version', 'v0.4');
    res.header('X-Application-API-Version', 'v0.1');
    res.send({id: i, name: req.body.name, tags: req.body.tags});
});

app.del('/rest/customers/:id', function(req, res) {
    var i = parseInt(req.params.id, 10);
    res.header('X-Application-Version', 'v0.4');
    res.header('X-Application-API-Version', 'v0.1');
    res.send(200);
});

app.listen(3007);

console.log('Mock server listening at port 3007');
