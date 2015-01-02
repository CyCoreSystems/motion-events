var cameraUrls = {
   'front': Meteor.absoluteUrl("stream/front"),
   'side': Meteor.absoluteUrl("stream/side")
};

Template.camview.rendered = function() {
   Session.setDefault('mode','live');
   Session.setDefault('camera','front');

   /*
   $('#timepickercontrols').noUiSlider({
      start: [ 1440, 8640 ],
      range: {
         'min': 0,
         'max': 10080
      },
      step: 360,
      orientation: 'horizontal',
      direction: 'ltr'
   });
   */
}

Template.camview.events({
   'click a[name=live]': function(e) { e.preventDefault(); Session.set('mode','live'); },
   'click a[name=recorded]': function(e) { e.preventDefault(); Session.set('mode','recorded'); },
   'click a[name=front]': function(e) { e.preventDefault(); Session.set('camera','front'); },
   'click a[name=side]': function(e) { e.preventDefault(); Session.set('camera','side'); },
   'click div#play': function() {
      Session.set('playback',true);
   },
   'ended video': function(e) { Session.set('playback',false); },
   'click div#prevDay': function(e) {
      Session.set('startTime',moment(Session.get('startTime')).subtract(1,'d').valueOf())
   },
   'click div#nextDay': function(e) {
      Session.set('startTime',moment(Session.get('startTime')).add(1,'d').valueOf())
   },
   'click div#forward': function() {
      var current = Events.findOne(Session.get('currentEvent'));
      if(!current) { return; }
      var next = Events.findOne({
         camera: Session.get('camera'),
         timestamp: { $gt: current.timestamp }
      },{ sort: { timestamp: 1 } })
      if(!next) { return; }
      Session.set('currentEvent',next._id);
   },
   'click div#back': function() {
      var current = Events.findOne(Session.get('currentEvent'));
      if(!current) { return; }
      var next = Events.findOne({
         camera: Session.get('camera'),
         timestamp: { $lt: current.timestamp }
      },{ sort: { timestamp: -1} })
      if(!next) { return; }
      Session.set('currentEvent',next._id);
   }
})

// NOTE:  we show/hide the separate images rather
// than swapping out the source because Chrome (at least)
// gets confused and fails to properly stream when
// only the source is changed.
// This way creates two constant streams, but they are
// reliable.
Template.camview.helpers({
   'showHideMode': function(mode) {
      if( !Session.equals('mode',mode) ) {
         return 'hide';
      }
   },
   'isMode': function(mode) {
      return Session.equals('mode',mode);
   },
   'showHide': function(cam) {
      if( !Session.equals('camera',cam) || Session.equals('mode','recorded') ) {
         return 'hide';
      }
   },
   'showRecorded': function() {
      return Session.equals('mode','recorded');
   },
   'showImage': function() {
      if( Session.equals('playback',true) )
         return 'hide'
   },
   'showVideo': function() {
      return Session.equals('playback',true);
   },
   'eventTime': function() {
      var currentEvent = Session.get('currentEvent');
      var hoveredEvent = Session.get('hoveredEvent');
      if(hoveredEvent) {
         return moment(Events.findOne(hoveredEvent).timestamp).format("MM/DD h:mma").toLocaleString();
      }
      if(currentEvent) {
         return moment(Events.findOne(currentEvent).timestamp).format("MM/DD h:mma").toLocaleString();
      }
      return;
   },
   'currentDate': function() {
      return moment(Session.get('startTime')).format("ddd, D MMM")
   },
   'imageUrl': function() {
      var currentEvent = Session.get('currentEvent');
      var hoveredEvent = Session.get('hoveredEvent');
      if(hoveredEvent) {
         return Events.findOne(hoveredEvent).imageFile;
      }
      if(currentEvent) {
         return Events.findOne(currentEvent).imageFile;
      }
      return;
   },
   'videoUrl': function() {
      var currentEvent = Session.get('currentEvent');
      if(!currentEvent) { return; }
      return Events.findOne(currentEvent).webVideoFile;
   },
   'cameraUrl': function(cam) {
      return Meteor.absoluteUrl("stream/"+cam);
   },
   'activeCamera': function(cam) {
      if( Session.equals('camera',cam) ) {
         return 'active';
      }
   },
   'activeMode': function(mode) {
      if( Session.equals('mode',mode) ) {
         return 'active';
      }
   },
   });
