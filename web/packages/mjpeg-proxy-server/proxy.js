var http = Npm.require('http');

//
//  Motion-JPEG proxy code ripped straight from
//  github.com/philrene/node-mjpeg-proxy
//
Proxy = function (srcURL, options) {
  if (!srcURL) throw new Error("Please provide a source feed URL");

  var audienceServer = options.audienceServer || http.createServer();
  var audienceServerPort = options.port || 5080;
  var audienceClients = [];

  // Starting the stream on from the source
  var request = http.get(srcURL);
  request.on('response', function (srcResponse) {
    /** Setup Audience server listener **/
    audienceServer.on('request', function (req, res) {
      /** Replicate the header from the source **/
      res.writeHead(200, srcResponse.headers);
      /** Push the client into the client list **/
      audienceClients.push(res);
      /** Clean up connections when they're dead **/
      res.socket.on('close', function () {
        audienceClients.splice(audienceClients.indexOf(res), 1);
      });
    });
    audienceServer.listen(audienceServerPort);
    console.log('node-mjpeg-proxy server started on port '+ audienceServerPort);

    /** Send data to relevant clients **/
    srcResponse.setEncoding('binary');
    srcResponse.on('data', function (chunk) {
      var i;
      for (i = audienceClients.length; i--;) {
        audienceClients[i].write(chunk, 'binary');
      }
    });
  });
};
