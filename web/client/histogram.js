// Event histogram
eventTimes = [];
data = undefined;
x = undefined;
y = undefined;
svg = undefined;
var slots = 24*1;

var width = 640;
var height = 80;

Meteor.autorun(function() {
   // Set defaults
   Session.setDefault('startTime',moment() - moment.duration(1,"days"));
   Session.setDefault('endTime', moment().valueOf());
});

Template.histogram.rendered = function() {
   var that = this;

   // Update the event times
   updateEventTimes();
   
   // Set x-scale
   updateScale()

   var xAxis = d3.svg
      .axis()
      .scale(x)
      .orient("bottom");

   svg = d3.select("div#histogram")
      .append("svg")
         .attr("width", width)
         .attr("height", height)

   /*
   svg.selectAll('x axis').
      append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,"+ height +")")
      .call(xAxis);
   */

   drawHistogram();
}

drawHistogram = function() {
   var formatCount = d3.format(",.0f");

   // Update the event times
   updateEventTimes();

   // Set x-scale
   updateScale()

   // Update data
   data = d3.layout.histogram()
      .value(function(d) { return d.value; })
      .bins(slots)(eventTimes);
      //.bins(x.ticks(slots))(eventTimes);

   // Set y-scale
   y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height,0]);

   var bar = svg.selectAll(".bar")
      .data(data,function(d,i) { return d.x || i; })
   bar.enter()
      .append("rect")
         .attr("class", "bar")
         .attr("x", function(d) { return x(d.x); })
         .attr("y", function(d) { return y(d.y); })
         .attr("width", function(d) { return x(d.dx); })
         .attr("height", function(d) { return height - y(d.y); })
         .attr("id", function(d) {
            if( d.length < 1 ) { return ""; }
            return d[0].id;
         })
         .attr("name", function(d) {
            if( d.length < 1 ) { return ""; }
            return d[Math.floor(d.length / 2)].label;
         })
         .on("click", function(d) {
            Session.set('currentEvent', this.id)
         })
         .on("mouseover", function(d) {
            Session.set('hoveredEvent', this.id)
         })
         .on("mouseout", function(d) {
            if( Session.equals('hoveredEvent', this.id) ) {
               Session.set('hoveredEvent', undefined);
            }
         });
   bar.transition().duration(1000)
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return x(d.dx); })
      .attr("height", function(d) { return height - y(d.y); })
      .attr("id", function(d) {
         if( d.length < 1 ) { return ""; }
         return d[0].id;
      })
      .attr("name", function(d) {
         if( d.length < 1 ) { return ""; }
         return d[Math.floor(d.length / 2)].label;
      })
   bar.exit().remove();
}

// Update the scale function based on
// time domain
updateScale = function() {
   // times need to be zero-based for the scaling
   // to work properly
   var end = Session.get('endTime') - Session.get('startTime');
   
   x = d3.scale.linear()
      .domain([0,end])
      .range([0,width]);
}

updateEventTimes = function() {
   var camera = Session.get('camera');
   var start = Session.get('startTime');
   eventTimes.length = 0; // Empty eventTimes array
   _.each(Events.find({
      camera: camera,
      timestamp: { 
         $gte: new Date(start),
         $lt: new Date(Session.get('endTime'))
      }
   },{ sort: ['timestamp'] }).fetch(),function(e) {
      // Value needs to be zero-based for graphing
      eventTimes.push({
         id: e._id,
         label: moment(e.timestamp).format("dd ha"),
         value: moment(e.timestamp).valueOf() - start
      });
   });

   console.log("eTimes count:",eventTimes.length);
}

// Update the array of event times
Tracker.autorun( function() {
   var camera = Session.get('camera');
   var start = Session.get('startTime');
   var end = Session.get('endTime');
   if( Events.find().count() < 1 ) {
      return;
   }
   if( !svg) { return; }
   drawHistogram();
});

