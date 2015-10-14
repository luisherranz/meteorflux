Package.describe({
  name: 'meteorflux:appstate',
  version: '1.1.0',
  summary: 'AppState is a reactive object tree for Meteor',
  git: 'https://github.com/worona/meteorflux',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('meteorflux:namespace@1.0.0');
  api.imply('meteorflux:namespace');
  api.use('meteorflux:dispatcher@1.1.0');
  api.imply('meteorflux:dispatcher');
  api.use('ecmascript');
  api.use('check');
  api.use('underscore');
  api.use('tracker');
  api.use('blaze-html-templates');
  api.addFiles('lib/client/appstate.js', 'client');
  api.export('AppState', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('check');
  api.use('tracker');
  api.use('tinytest');
  api.use('blaze-html-templates');
  api.use('mongo');
  api.use('meteorflux:appstate', 'client');
  api.addFiles('tests/client/appstate-tests.js', 'client');
  api.addFiles('tests/client/appstate-tests.html', 'client');
});
