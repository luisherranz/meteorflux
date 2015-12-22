MeteorFlux.registerHelper = function(keyPath, value) {
  let self = this;
  Template.registerHelper(keyPath[0], () => {
    let func = self.get.bind(self, keyPath[0]);
    return func();
  });
};

if ((typeof State !== 'undefined') && (typeof Template !== 'undefined')) {
  State.afterChange(MeteorFlux.registerHelper.bind(State));
}
