var cameraMap = {
   1: 'front',
   2: 'side'
};

Router.map(function() {
   this.route('eventHandler', {
      path: '/event',
      where: 'server',
      action: function() {
         console.log("Received event from motion");
         var req;

         if(this.request.method !== 'POST') {
            this.response.writeHead(400);
            this.response.end("Unhandled method");
         }

         req = this.request.body;

         // Find the camera to which this event is associated
         var camera = cameraMap[parseInt(req.camera)];
         console.log("Camera by map:",req.camera,camera);

         switch(req.event) {
            case 'start':
               console.log("Start event");
               // Add an event record
               var eventId = Events.insert({
                  camera: camera,
                  timestamp: new Date()
               });

               // Add a temporary map
               console.log("Adding map:",eventId,req.number);
               EventMaps.insert({
                  eventId: eventId,
                  camera: camera,
                  number: req.number
               });
               break;
            case 'image':
               console.log("Image event:",req.imagefile)
               // Find the eventId from the eventMap
               var eventId = EventMaps.findOne({
                  number: req.number,
                  camera: req.camera
               }).eventId
               if(!eventId) {
                  console.error("Unable to locate eventId from event number");
                  break;
               }

               // Update the event record with the image location
               console.log("Updating eventId with image:",eventId,req.imagefile);
               Events.update(eventId,{
                  $set: {
                     imageFile: req.imagefile
                  }
               });
               break;
            case 'video':
               console.log("Video event:",req.videofile)
               // Find the eventId from the eventMap
               var eventId = EventMaps.findOne({
                  number: req.number,
                  camera: req.camera
               }).eventId
               if(!eventId) {
                  console.error("Unable to locate eventId from event number");
                  break;
               }

               // Update the event record with the video location
               console.log("Updating eventId with video:",eventId,req.videofile);
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
