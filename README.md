# express-lisplate
LisplateJS bindings for HapiJS

## Installation
```sh
npm install hapi-lisplate
```

## Example Use
```js
var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(require('vision'), function(err) {
  if (err) {
    throw err;
  }

  server.views({
    engines: {
      ltml: require('hapi-lisplate')({
        viewModelDirectory: 'viewmodels',
        stringsDirectory: 'strings'
      })
    },
    relativeTo: __dirname,
    path: 'views'
  });
});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply.view('helloworld');
  }
});

server.start(function(err) {
    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
```
