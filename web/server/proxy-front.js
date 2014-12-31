var ProxyFront,ProxySide;

var frontClients = [];
var sideClients = [];

var http = Npm.require('http');

Meteor.startup(function() {
   var reqFront = http.get("http://172.30.105.140:8081/");
   reqFront.on('response',function(rep) {
      ProxyFront = rep;

      ProxyFront.setEncoding('binary');
      ProxyFront.on('data', function(chunk) {
         _.each(frontClients,function(c) {
            c.write(chunk, 'binary');
         });
      });
   })

   var reqSide = http.get("http://172.30.105.140:8082/");
   reqSide.on('response',function(rep) {
      ProxySide = rep;

      ProxySide.setEncoding('binary');
      ProxySide.on('data', function(chunk) {
         _.each(sideClients,function(c) {
            c.write(chunk, 'binary');
         });
      });
   })

   /*
   if(typeof(Proxy) == 'undefined') {
      console.log("Cannot start proxies without proxy package");
      return;
   }

   console.log("Starting Front camera proxy");
   ProxyFront = new Proxy("http://admin:admin@172.30.105.215/media/?action=stream",{
      port: 5080
   });

   console.log("Starting Side camera proxy");
   ProxySide = new Proxy("http://admin:admin@172.30.105.219/media/?action=stream",{
      port: 5081
   });
   */
});

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
