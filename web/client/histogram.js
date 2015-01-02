// Event histogram
var eventTimes = [];
var data = undefined;
var x = undefined;
var y = undefined;
svg = undefined;
var slots = 24*1;

var width = 640;
var height = 80;

Meteor.autorun(function() {
   // Set defaults
   var thisMorning = moment(0,"HH");
   Session.setDefault('startTime',thisMorning.valueOf());
});

Template.histogram.rendered = function() {
   var that = this;

   var thisMorning = moment(0,"HH");
   Session.set('startTime',thisMorning.valueOf());

   // Update the event times
   updateEventTimes();
   
   svg = d3.select("div#histogram")
      .append("svg")
         .attr("width", width)
         .attr("height", height)

   drawHistogram();
}

drawHistogram = function() {
   var formatCount = d3.format(",.0f");

   // Update the event times
   updateEventTimes();

   // Set x-scale
   x = d3.scale.linear()
      .domain([0,moment.duration(1,'d')])
      .range([0,width]);

   // Update data
   data = d3.layout.histogram()
      .value(function(d) { return d.value; })
      .range([0,moment.duration(1,'d')])
      //.bins(x.ticks(slots))(eventTimes);
      .bins(24)(eventTimes);

   // Set y-scale
   y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) { return d.y; })])
      .range([height-20,0]);

   // Create x axis
   xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
   svg.selectAll('x_axis')
      .data(data)
      .enter().append("g")
         .attr("class", "x_axis")
         .attr("transform", "translate(0,"+ height +")")
         .call(xAxis);

   // Create histogram bars
   var bar = svg.selectAll(".bar")
      .data(data)
   bar.enter()
      .append("rect")
         .attr("class", "bar")
         .attr("x", function(d) { return x(d.x); })
         .attr("width", function(d) { return x(d.dx); })
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
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return (height - 20) - y(d.y); })
      .attr("id", function(d) {
         if( d.length < 1 ) { return ""; }
         return d[0].id;
      })
      .attr("name", function(d) {
         if( d.length < 1 ) { return ""; }
         return d[Math.floor(d.length / 2)].label;
      })
   bar.exit().remove();
   
   // Create histogram labels
   var label = svg.selectAll(".hour")
      .data(data)
   label.enter()
      .append("text")
         .attr("class", "hour")
         .attr("dy", ".75em")
         .attr("y", height - 18)
         .attr("x", function(d) { return x(d.x) + x(d.dx) / 2; })
         .attr("text-anchor", "middle")
         .text(function(d,i) {
            var theHour = moment(Session.get('startTime')).add(i,'h').format('H');
            var amPm = i < 13 ? 'a' : 'p';
            return theHour;
         });
   label.exit().remove();
}

updateEventTimes = function() {
   var camera = Session.get('camera');
   var start = Session.get('startTime');
   eventTimes.length = 0; // Empty eventTimes array
   _.each(Events.find({
      camera: camera,
      timestamp: { 
         $gte: new Date(start),
         $lt: moment(start).add(1,'d').toDate()
      }
   },{ sort: ['timestamp'] }).fetch(),function(e) {
      // Value needs to be zero-based for graphing
      eventTimes.push({
         id: e._id,
         label: moment(e.timestamp).format("ha"),
         value: moment(e.timestamp).valueOf() - start
      });
   });

   console.log("eTimes count:",eventTimes.length);
}

// Update the array of event times
Tracker.autorun( function() {
   var camera = Session.get('camera');
   var start = Session.get('startTime');
   if( Events.find().count() < 1 ) {
      return;
   }
   if( !svg) { return; }
   drawHistogram();
});

