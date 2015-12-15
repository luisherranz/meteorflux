Package.describe({
  name: 'meteorflux:reactive-state',
  version: '1.3.3',
  summary: 'ReactiveState is a reactive object to save complex state data.',
  git: 'https://github.com/worona/meteorflux',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('meteorflux:namespace@1.0.0');
  api.imply('meteorflux:namespace');
  api.use('ecmascript');
  api.use('check');
  api.use('underscore');
  api.use('tracker');
  api.use('blaze-html-templates');
  api.addFiles('lib/reactive-state.js', 'client');
  api.export('ReactiveState', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('check');
  api.use('tracker');
  api.use('reactive-var');
  api.use('tinytest');
  api.use('blaze-html-templates');
  api.use('mongo');
  api.use('meteorflux:reactive-state', 'client');
  api.addFiles('tests/client/reactive-state-tests.js', 'client');
  api.addFiles('tests/client/reactive-state-tests.html', 'client');
});
