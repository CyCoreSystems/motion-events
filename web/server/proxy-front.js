var ProxyFront,ProxySide;

var frontClients = [];
var sideClients = [];

var http = Npm.require('http');

Meteor.startup(function() {
   connectFront();
   connectSide();
});

connectFront = function() {
   var reqFront = http.get("http://172.30.105.140:8081/");
   reqFront.on('response',function(rep) {
      ProxyFront = rep;

      ProxyFront.setEncoding('binary');
      ProxyFront.on('data', function(chunk) {
         _.each(frontClients,function(c) {
            c.write(chunk, 'binary');
         });
      });
      ProxyFront.on('close', connectFront);
   })

}

connectSide = function() {
   var reqSide = http.get("http://172.30.105.140:8082/");
   reqSide.on('response',function(rep) {
      ProxySide = rep;

      ProxySide.setEncoding('binary');
      ProxySide.on('data', function(chunk) {
         _.each(sideClients,function(c) {
            c.write(chunk, 'binary');
         });
      });
      ProxySide.on('close', connectSide);
   })

}

Router.map(function() {
   this.route('frontProxy', {
      path: '/stream/front',
      where: 'server',
      action: function() {
         this.response.writeHead(200, ProxyFront.headers);
         frontClients.push(this.response);
         this.response.on('close',function() {
            frontClients.splice(frontClients.indexOf(this.response), 1);
         })
         
      }
   });
   this.route('sideProxy', {
      path: '/stream/side',
      where: 'server',
      action: function() {
         this.response.writeHead(200, ProxySide.headers);
         sideClients.push(this.response);
         this.response.on('close',function() {
            frontClients.splice(sideClients.indexOf(this.response), 1);
         })
      }
   })
});
