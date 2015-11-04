let mockCallback = function(name) {
    let funcs = {};
    funcs[name] = [];
    let func = function(payload) {
        funcs[name].push(payload);
    };
    func.calls = funcs[name];
    func.reset = function(){
        this.calls = [];
    };
    return func;
};

let beforeEach = () => {
  ftf = new MeteorFlux.FirstThenFinally();

  First = ftf.First.bind(ftf);
  Then = ftf.Then.bind(ftf);
  Finally = ftf.Finally.bind(ftf);

  Dispatch = ftf.Dispatch.bind(ftf);
  Dispatch.isDispatching = ftf.isDispatching.bind(ftf);
  Action = ftf.Action;

  callbackA = mockCallback("A");
  callbackB = mockCallback("B");
};

Tinytest.add('FirstThenFinally - Test mock callback functions',
  function (test) {
    beforeEach();

    test.equal( typeof callbackA, "function");
    test.equal( typeof callbackA.calls, "object");

    var payloadA = {};
    callbackA(payloadA);

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payloadA);

    var payloadB = {};
    callbackA(payloadB);

    Tracker.flush();
    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], payloadB);

    callbackA.reset();

    Tracker.flush();
    test.equal(callbackA.calls.length, 0);

  }
);

Tinytest.add('FirstThenFinally - First function should be executed and should',
  function (test) {
    beforeEach();

    let payload = {};
    First(() => {
      callbackA(payload);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);
  }
);

Tinytest.add('FirstThenFinally - First function should not be reactive',
  function (test) {
    beforeEach();

    let payload = { flag: false };
    let react = new ReactiveVar(false);

    First(() => {
      payload.flag = react.get();
      callbackA(payload);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0].flag, false);

    react.set(true);

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0].flag, false);
  }
);

Tinytest.add('FirstThenFinally - Should throw if dispatch while dispatching',
  function (test) {
    beforeEach();

    First(() => {
      Dispatch('OTHER_THING_HAPPENED');
    });

    test.throws(() => {
      Dispatch('SOMETHING_HAPPENED');
    }, 'cant-dispatch-while-dispatching');
  }
);

Tinytest.add('FirstThenFinally - Should get action type inside First',
  function (test) {
    beforeEach();

    First(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('FirstThenFinally - Should compare action inside First',
  function (test) {
    beforeEach();

    First(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        callbackA();
    });

    First(() => {
      if (Action.is('OTHER_THING_HAPPENED'))
        callbackB();
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackB.calls.length, 0);
  }
);

Tinytest.add('FirstThenFinally - Should get action payload directly',
  function (test) {
    beforeEach();

    First(() => {
      if (Action.is('SOMETHING_HAPPENED')) {
        callbackA(Action.flag);
      }
    });

    Dispatch('SOMETHING_HAPPENED', { flag: true });

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], true);
  }
);

Tinytest.add('FirstThenFinally - Should get action payload with helper',
  function (test) {
    beforeEach();

    First(() => {
      if (Action.is('SOMETHING_HAPPENED')) {
        let payload = Action.payload();
        callbackA(payload.flag);
      }
    });

    let payload = { flag: true };
    Dispatch('SOMETHING_HAPPENED', payload);

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], true);
  }
);

Tinytest.add('FirstThenFinally - Should get type in First, but not be reactive',
  function (test) {
    beforeEach();

    First(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');

    ftf._reactiveDict.set('type', 'OTHER_THING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('FirstThenFinally - Should register and execute Then functions',
  function (test) {
    beforeEach();

    Then(() => {
      let type = Action.type();
      callbackA(type);
    });

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'INIT');
  }
);

Tinytest.add('FirstThenFinally - Should execute Then functions with Dispatch',
  function (test) {
    beforeEach();

    Then(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('FirstThenFinally - Should execute Then functions reactively',
  function (test) {
    beforeEach();

    let react = new ReactiveVar('First run');

    Then(() => {
      if(Action.is('SOMETHING_HAPPENED')) {
        callbackA(react.get());
      }
    });

    Tracker.flush();
    test.equal(callbackA.calls.length, 0);

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'First run');

    react.set('Second run');

    Tracker.flush();
    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], 'Second run');

    Dispatch('OTHER_THING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 2);

    react.set('Third run');

    Tracker.flush();
    test.equal(callbackA.calls.length, 2);
  }
);

Tinytest.add('FirstThenFinally - Should trigger different Then functions',
  function (test) {
    beforeEach();

    let react = new ReactiveVar(false);

    Then(() => {
      callbackA();
      if((Action.is('SOMETHING_HAPPENED')) && (react.get() === true)) {
        callbackB(true);
      }
    });

    Then(() => {
      if(Action.is('SOMETHING_HAPPENED')) {
        react.set(true);
      }
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 3);
    test.equal(callbackB.calls.length, 1);
    test.equal(callbackB.calls[0], true);

  }
);

Tinytest.add('FirstThenFinally - Should execute Finally functions',
  function (test) {
    beforeEach();

    Finally(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('FirstThenFinally - Should execute Finally without reactivity',
  function (test) {
    beforeEach();

    let react = new ReactiveVar('First run');

    Finally(() => {
      if(Action.is('SOMETHING_HAPPENED'))
        callbackA(react.get());
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'First run');

    react.set('Second run');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
  }
);

Tinytest.add('FirstThenFinally - Should execute all in order',
  function (test) {
    beforeEach();

    let text = '';

    First(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'First, ';
    });

    Then(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'Then, ';
    });

    Finally(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'Finally!';
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(text, 'First, Then, Finally!');
  }
);

Tinytest.add('FirstThenFinally - Should execute all in order with reactivity',
  function (test) {
    beforeEach();

    let text = '';
    let react = new ReactiveVar(false);

    First(() => {
      switch (Action.type()) {
        case 'SOMETHING_HAPPENED':
          text = text + 'First, ';
          break;
        default:

      }
    });

    Then(() => {
      if ((Action.is('SOMETHING_HAPPENED')) && (react.get() === true))
        text = text + 'Then, ';
    });

    Then(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        react.set(true);
    });

    Finally(() => {
      if ((Action.is('SOMETHING_HAPPENED')) && (react.get() === true))
        text = text + 'Finally!';
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(text, 'First, Then, Finally!');
  }
);

Tinytest.add('FirstThenFinally - State is working',
  function (test) {
    beforeEach();

    test.instanceOf(State, MeteorFlux.ReactiveState);
    State.set('something', true);
    test.isTrue(State.get('something'));
  }
);

Tinytest.add('FirstThenFinally - Dispatcher is dispatching',
  function (test) {
    beforeEach();

    First(() => {
      test.equal(Dispatch.isDispatching(), true);
    });

    test.equal(Dispatch.isDispatching(), false);

    Dispatch('SOMETHING_HAPPENED');
  }
);

Tinytest.add('FirstThenFinally - Dispatcher should queue actions with after',
  function (test) {
    beforeEach();

    let text = '';

    First(() => {
      switch (Action.type()) {
        case 'SOMETHING_HAPPENED':
          text = text + '1, ';
          break;
        case 'ANOTHER_THING_HAPPENED':
          text = text + '2, ';
          break;
        case 'NOW_WITH_PAYLOAD':
          text = text + Action.data;
          break;
      }
    });

    Dispatch('SOMETHING_HAPPENED')
      .then('ANOTHER_THING_HAPPENED')
      .then('NOW_WITH_PAYLOAD', { data: '3!' });
    Tracker.flush();

    test.equal(text, '1, 2, 3!');
  }
);

Tinytest.add('FirstThenFinally - Empty payload should return empty object',
  function (test) {
    beforeEach();

    let emptyPayload = null;

    First(() => {
      emptyPayload = Action.payload();
    });

    Dispatch('SOMETHING_HAPPENED');

    test.equal(emptyPayload, {});
  }
);
