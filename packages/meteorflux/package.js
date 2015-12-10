Package.describe({
  name: 'meteorflux:meteorflux',
  version: '1.1.4',
  summary: 'A Flux framework for extensible Meteor applications',
  git: 'https://github.com/worona/meteorflux',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');

  api.use('reactive-dict');
  api.use('check');
  api.use('tracker');
  api.use('underscore');
  api.use('ecmascript');

  api.use('meteorflux:meteorflux-debug@1.0.0'); // debugOnly
  api.use('meteorflux:namespace@1.0.0');
  api.imply('meteorflux:namespace@1.0.0'); // Exports MeteorFlux
  api.use('meteorflux:reactive-state@1.2.1');
  api.addFiles('lib/client/meteorflux.js', 'client');
  api.addFiles('lib/client/blaze.js', 'client');

  api.export('Dispatch');
  api.export('Action');
  api.export('Register');
  api.export('State');
  api.export('AfterAction');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('ecmascript');
  api.use('reactive-var');
  api.use('tracker');
  api.use('blaze-html-templates');
  api.use('meteorflux:meteorflux');
  api.use('practicalmeteor:sinon@1.14.1_2');
  api.addFiles('tests/client/meteorflux-tests.js', 'client');
  api.addFiles('tests/client/blaze-tests.js', 'client');
});
