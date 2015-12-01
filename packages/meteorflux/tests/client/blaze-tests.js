var beforeEach = function() {
  BlazeEvents = new MeteorFlux.BlazeEvents(MF);
};

Tinytest.add(
  'BlazeEvents - _dispatch tests',
  sinon.test(function(test) {
    beforeEach();

    // Data going in.
    var that = { someData: 'data', dispatch: MF.Dispatch.bind(MF) };
    var event = {
      preventDefault: function() {},
      stopImmediatePropagation: function() {},
      currentTarget: [
        { type: 'submit', name: 'SubmitName', value: 'SubmitValue' },
        { type: 'text', name: 'TextName', value: 'TextValue' },
        { type: 'password', name: 'PasswordName', value: 'PasswordValue' },
        { type: 'checkbox', name: 'CheckboxName', checked: true }
      ]
    };
    event.currentTarget.getAttribute = function() {
      return 'SOMETHING_HAPPENED';
    };
    event.currentTarget.dataset = {
      id: '1234',
      userName: 'John'
    };
    var template = { someOtherData: 'otherData' };

    // Data coming out.
    var payload = {
      context: that,
      template: template,
      event: event,
      id: '1234',
      userName: 'John',
      CheckboxName: true,
      TextName: 'TextValue',
      PasswordName: 'PasswordValue',
    };

    var result = null;
    // get the inner dispatcher used
    var mf = BlazeEvents._dispatch.call(that, event, template);
    Tracker.flush();

    mf.Register(function() {
      result = mf.Action.payload();
    });

    BlazeEvents._dispatch.call(that, event, template);

    test.equal(result, payload);
  })
);
