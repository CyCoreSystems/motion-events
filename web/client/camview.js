var cameraUrls = {
   'front': Meteor.absoluteUrl("stream/front"),
   'side': Meteor.absoluteUrl("stream/side")
};

Template.camview.rendered = function() {
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
   'click a[name=front]': function() { Session.set('camera','front'); },
   'click a[name=side]': function() { Session.set('camera','side'); }
})

// NOTE:  we show/hide the separate images rather
// than swapping out the source because Chrome (at least)
// gets confused and fails to properly stream when
// only the source is changed.
// This way creates two constant streams, but they are
// reliable.
Template.camview.helpers({
   'showHide': function(cam) {
      if( !Session.equals('camera',cam) ) {
         return 'hide';
      }
   },
   'cameraUrl': function(cam) {
      return Meteor.absoluteUrl("stream/"+cam);
   },
   });
