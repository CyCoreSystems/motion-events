var cameraMap = {
   1: 'front',
   2: 'side'
};

Router.map(function() {
   this.route('eventHandler', {
      path: '/event',
      where: 'server',
      action: function() {
         var req;

         if(this.request.method !== 'POST') {
            this.response.writeHead(400);
            this.response.end("Unhandled method");
         }

         try {
            req = JSON.decode(this.request.body);
         } catch(err) {
            this.response.writeHead(400);
            this.response.end("Bad Request");
            return;
         }

         // Find the camera to which this event is associated
         var camera = cameraMap[parseInt(req.camera)];

         switch(req.event) {
            case 'start':
               // Add an event record
               var eventId = Events.insert({
                  _id: eventId,
                  camera: camera,
                  timestamp: new Date()
               });

               // Add a temporary map
               EventMaps.insert({
                  eventId: eventId,
                  number: req.number
               });
               break;
            case 'image':
               // Find the eventId from the eventMap
               var eventId = EventMaps.findOne({number: req.number}).eventId
               if(!eventId) {
                  console.error("Unable to locate eventId from event number");
                  break;
               }

               // Update the event record with the image location
               Events.update(eventId,{
                  $set: {
                     imageFile: req.imagefile
                  }
               });
               break;
            case 'video':
               // Find the eventId from the eventMap
               var eventId = EventMaps.findOne({number: req.number}).eventId
               if(!eventId) {
                  console.error("Unable to locate eventId from event number");
                  break;
               }

               // Update the event record with the video location
               Events.update(eventId,{
                  $set: {
                     videoFile: req.videofile
                  }
               });
               break;
            default:
               console.error("Unhandled event:",req.event);
               this.response.writeHead(400);
               this.response.end("Unhandled event");
         }
         this.response.writeHead(200);
         this.response.end("OK");
      }
   });
});
