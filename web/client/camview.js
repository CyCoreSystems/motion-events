var cameraUrls = {
   'front': Meteor.absoluteUrl("stream/front"),
   'side': Meteor.absoluteUrl("stream/side")
};

Template.camview.rendered = function() {
   Session.setDefault('mode','live');
   Session.setDefault('camera','front');

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
}

Template.camview.events({
   'click a[name=live]': function(e) { e.preventDefault(); Session.set('mode','live'); },
   'click a[name=recorded]': function(e) { e.preventDefault(); Session.set('mode','recorded'); },
   'click a[name=front]': function(e) { e.preventDefault(); Session.set('camera','front'); },
   'click a[name=side]': function(e) { e.preventDefault(); Session.set('camera','side'); }
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
      if( !Session.equals('camera',cam) ) {
         return 'hide';
      }
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
