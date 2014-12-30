var ProxyFront,ProxySide;

Meteor.startup(function() {
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
});
