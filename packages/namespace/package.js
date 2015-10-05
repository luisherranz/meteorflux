Package.describe({
  name: 'meteorflux:namespace',
  version: '1.0.0',
  summary: 'Just a common package for namespacing MeteorFlux',
  git: 'https://github.com/worona/meteorflux',
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('meteorflux.js');
  api.export('MeteorFlux');
});
