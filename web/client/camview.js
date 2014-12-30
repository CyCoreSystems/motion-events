var cameraUrls = {
   'front': "http://localhost:5080",
   'side': "http://localhost:5081"
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

Template.camview.helpers({
   'cameraFeedUrl': function() {
      return cameraUrls[Session.get('camera')];
   }
   });
