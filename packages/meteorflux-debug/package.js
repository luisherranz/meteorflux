Package.describe({
  name: 'meteorflux:meteorflux-debug',
  version: '1.0.0',
  summary: 'Debug MeteorFlux in the console.',
  git: 'https://github.com/worona/meteorflux/',
  documentation: null,
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.addFiles('debug.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
});
