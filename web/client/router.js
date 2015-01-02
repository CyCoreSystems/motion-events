Router.map(function(){
   this.route('camview',{
      waitOn: function() {
         return Meteor.subscribe('events');
      },
      layoutTemplate: 'mainlayout',
      path: '/'
   });

});
