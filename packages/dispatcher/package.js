Package.describe({
  name: 'meteorflux:dispatcher',
  version: '1.2.1',
  summary: 'A Flux Dispatcher for Meteor, based on Facebook\'s Dispatcher',
  git: 'https://github.com/worona/meteorflux',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('meteorflux:namespace@1.0.0');
  api.imply('meteorflux:namespace@1.0.0');
  api.addFiles('lib/dispatcher.js');
  api.export('Dispatcher');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('blaze-html-templates');
  api.use('meteorflux:dispatcher');
  api.addFiles('tests/dispatcher-tests.js');
});
