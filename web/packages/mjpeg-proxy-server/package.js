Package.describe({
  name: 'mjpeg-proxy-server',
  summary: 'Motion JPEG proxy server',
  version: '0.0.1',
  git: 'bound'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.2.1');
  api.addFiles('proxy.js','server');
  api.export('Proxy', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('proxy');
  api.addFiles('proxy-tests.js');
});
