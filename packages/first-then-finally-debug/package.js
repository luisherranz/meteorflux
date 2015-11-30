Package.describe({
  name: 'meteorflux:first-then-finally-debug',
  version: '1.0.2',
  summary: 'DEPRECATED - Use MeteorFlux instead',
  git: 'https://github.com/worona/meteorflux/',
  documentation: null,
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('meteorflux:first-then-finally@1.2.5');
  api.addFiles('debug.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
});
