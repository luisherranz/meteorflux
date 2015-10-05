var beforeEach = function() {
  DispatcherHelper = new MeteorFlux.DispatcherHelper();
};

Tinytest.add(
  'MeteorFlux - Dispatcher Blaze Helper - _dispatch tests',
  function(test) {
    beforeEach();

    // Data going in.
    var that = { someData: 'data' };
    var event = {
      preventDefault: function() {},
      stopImmediatePropagation: function() {},
      currentTarget: { dataset: {
        actionType: 'SOMETHING_HAPPENED',
        actionId: '1234',
        actionUserName: 'John'
    }}};
    var template = { someOtherData: 'otherData' };

    // Data coming out.
    var action = {
      type: 'SOMETHING_HAPPENED',
      context: that,
      template: template,
      event: event,
      id: '1234',
      userName: 'John'
    };

    var result = null;
    Dispatcher.register(function(payload){
      result = payload;
    });

    DispatcherHelper._dispatch.call(that, event, template);

    test.isTrue(_.isEqual(result, action));
  }
);
