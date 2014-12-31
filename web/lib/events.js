Events = new Mongo.Collection('events');

// EventMaps are temporary maps between GNU motion's
// event ids (enumerators) and MongoDB _ids.
// These are implemented so that subsequent calls
// adding images and videos can be properly mapped
// to the MongoDB _ids.
EventMaps = new Mongo.Collection('eventmaps');

if(Meteor.isServer) {
   Meteor.publish("events",function() {
      return Events.find({});
   });

   Meteor.publish("eventmaps",function() {
      return EventMaps.find({});
   });
}

