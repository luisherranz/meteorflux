Package.describe({
  name: 'meteorflux:first-then-finally-blaze',
  version: '1.0.1',
  summary: 'A Blaze tool to dispatch actions right from the html',
  git: 'https://github.com/worona/meteorflux',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');
  api.use('underscore');
  api.use('templating', 'client');
  api.use('meteorflux:namespace@1.0.0');
  api.imply('meteorflux:namespace@1.0.0');
  api.use('meteorflux:first-then-finally@1.2.4');
  api.addFiles('lib/first-then-finally-blaze.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteorflux:first-then-finally@1.2.2');
  api.use('meteorflux:first-then-finally-blaze');
  api.addFiles('tests/client/first-then-finally-blaze-tests.js', 'client');
});
