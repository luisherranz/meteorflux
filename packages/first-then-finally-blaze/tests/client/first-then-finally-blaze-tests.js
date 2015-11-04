var beforeEach = function() {
  FirstThenFinallyBlaze = new MeteorFlux.FirstThenFinallyBlaze();
};

Tinytest.add(
  'FirstThenFinallyBlaze - _dispatch tests',
  function(test) {
    beforeEach();

    // Data going in.
    var that = { someData: 'data' };
    var event = {
      preventDefault: function() {},
      stopImmediatePropagation: function() {},
      currentTarget: {
        getAttribute: function() { return 'SOMETHING_HAPPENED'; },
        dataset: {
          id: '1234',
          userName: 'John'
        }
    }};
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
    var type = null;
    First(function(){
      type = Action.type();
      result = Action.payload();
    });

    FirstThenFinallyBlaze._dispatch.call(that, event, template);

    test.isTrue(result, action);
  }
);
