Package.describe({
  name: 'meteorflux:first-then-finally-debug',
  version: '1.0.1',
  summary: 'Debug FTF in console.',
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
