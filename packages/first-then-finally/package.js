Package.describe({
  name: 'meteorflux:first-then-finally',
  version: '1.2.5',
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
  api.use('meteorflux:namespace@1.0.0');
  api.imply('meteorflux:namespace@1.0.0');
  api.use('meteorflux:reactive-state@1.1.2');
  api.addFiles('lib/first-then-finally.js', 'client');
  api.export('First');
  api.export('Then');
  api.export('Finally');
  api.export('Dispatch');
  api.export('Action');
  api.export('State');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('ecmascript');
  api.use('reactive-var');
  api.use('tracker');
  api.use('meteorflux:first-then-finally');
  api.addFiles('tests/first-then-finally-tests.js', 'client');
});
