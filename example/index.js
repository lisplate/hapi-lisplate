var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(require('vision'), function(err) {
  if (err) {
    throw err;
  }

  var ltmlEngine = require('../')({
    viewModelDirectory: 'viewmodels',
    stringsDirectory: 'strings'
  });

  server.views({
    engines: { ltml: ltmlEngine },
    relativeTo: __dirname,
    path: 'views',
    context: require('../').localizationContext
  });
});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply.view('helloworld');
  }
});

server.route({
  method: 'GET',
  path: '/page',
  handler: function(request, reply) {
    reply.view('this-page', {
      subheading: 'testing'
    });
  }
});

server.start(function(err) {
    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
