var getActionName = function(string) {
  string = string.replace('action', '');
  return string.charAt(0).toLowerCase() + string.slice(1);
};

MeteorFlux.DispatcherHelper = class DispatcherHelper {
  constructor() {
    let self = this;
    self._createGlobalEvents();
  }

  _createGlobalEvents() {
    let self = this;
    for (var t in Template) {
      if (Template.hasOwnProperty(t)) {
        var tmpl = Template[t];
        if (Blaze.isTemplate(tmpl)) {
          if (tmpl.viewName !== "body") {
            tmpl.events({
              'click a[data-action-type]': self._dispatch,
              'click button[data-action-type]': self._dispatch,
              'submit form[data-action-type]': self._dispatch
            });
          }
        }
      }
    }
  }

  _dispatch(event, tmpl) {
    let self = this;
    event.preventDefault();
    event.stopImmediatePropagation();
    let action = {
      context: this,
      template: tmpl,
      event: event
    };
    let dataset = action.event.currentTarget.dataset;
    for ( let key in dataset ) {
      if (key.startsWith('action')) {
        let name = getActionName(key);
        action[name] = dataset[key];
      }
    }
    Dispatcher.dispatch(action);
  }
};


Meteor.startup(function () {
  new MeteorFlux.DispatcherHelper();
});
