var fs = Npm.require('fs');

Router.map(function() {
   this.route('/target/:camera//:filename',{
      this.redirect('/target/'+this.params.camera+'/'+this.params.filename);
   });
   this.route('/target/:camera/:filename', function() {
      var req = this.request.body;
      var fn = this.params.filename

      // Find the camera to which this event is associated
      console.log("Got request for file:",this.url);

      // Find the content length
      var contentLength = 0;
      var fsStat;
      try {
         fsStat = fs.statSync(this.url);
      } catch(err) {
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
      if( this.url.match( /webm$/ ) ) {
         contentType = "video/webm";
      }

      // Send the header
      this.response.writeHead(200,{
         'Last-Modified': fsStat.mtime.toUTCString(),
         'Content-Type': contentType,
         'Content-Length': contentLength
      });

      if( this.request.method == "HEAD" ) {
         this.response.end();
         return;
      }
      // Send the file
      fStream.pipe(this.response);

   },{ where: 'server' });
});
