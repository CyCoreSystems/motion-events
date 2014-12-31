var fs = Npm.require('fs');

Router.map(function() {
   this.route('/target/:camera/:filename', function() {
      var req = this.request.body;
      var fn = this.params.filename

      // Find the camera to which this event is associated
      console.log("Got request for file:",this.url);

      // Find the content length
      var contentLength = 0;
      var fsStat = fs.statSync(this.url);
      if( typeof(fsStat) == 'undefined' ) {
         this.response.writeHead(404);
         this.response.write("Not found");
         return
      }
      contentLength = fsStat.size;
      if( contentLength < 1 ) {
         this.response.writeHead(404);
         this.response.write("Empty file");
         return
      }

      var fStream = fs.createReadStream(this.url);

      // Find the content type
      var contentType = "";
      if( this.url.match( /avi$/ ) ) {
         contentType = "video/mp4";
      }
      if( this.url.match( /jpg$/ ) ) {
         contentType = "image/jpeg";
      }

      // Send the header
      this.response.writeHead(200,{
         'Content-Type': contentType,
         'Content-Length': contentLength
      });

      // Send the file
      fStream.pipe(this.response);

   },{ where: 'server' });
});
