Package.describe({
  name: 'meteorflux:blaze-utils',
  version: '1.0.0',
  summary: 'Blaze helpers for both MeteorFlux and ReactiveState',
  git: 'https://github.com/worona/meteorflux',
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');
  api.use('underscore');
  api.use('meteorflux:namespace@1.0.0');
  api.use('meteorflux:meteorflux@1.2.0');
  api.use('blaze-html-templates');
  api.addFiles('lib/meteorflux-blaze-events.js', 'client');
  api.addFiles('lib/reactive-state-blaze-helpers.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('ecmascript');
  api.use('check');
  api.use('tracker');
  api.use('reactive-var');
  api.use('blaze-html-templates');
  api.use('mongo');
  api.use('meteorflux:meteorflux@1.2.0');
  api.use('meteorflux:reactive-state@1.4.0');
  api.use('meteorflux:blaze-utils', 'client');
  api.addFiles('tests/reactive-state-blaze-helpers-tests.js', 'client');
  api.addFiles('tests/reactive-state-blaze-helpers-tests.html', 'client');
});
