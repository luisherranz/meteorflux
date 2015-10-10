Package.describe({
  name: 'meteorflux:dispatcher-helper',
  version: '1.0.1',
  summary: 'A helper to dispatch Flux actions directly from Blaze.',
  git: 'https://github.com/worona/meteorflux',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');
  api.use('templating', 'client');
  api.use('meteorflux:dispatcher@1.1.0');
  api.addFiles('client/dispatcher-helper.js', 'client');
  api.imply('meteorflux:dispatcher@1.1.0');
});


Package.onTest(function(api) {
  api.use('underscore');
  api.use('tinytest');
  api.use('meteorflux:dispatcher-helper', 'client');
  api.addFiles('tests/client/dispatcher-helper-tests.js', 'client');
});
