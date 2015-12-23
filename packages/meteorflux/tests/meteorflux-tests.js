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
  MF = new MeteorFlux.MF();

  Register = MF.Register.bind(MF);
  AfterAction = MF.AfterAction.bind(MF);

  Dispatch = MF.Dispatch.bind(MF);
  Dispatch.isDispatching = MF.isDispatching.bind(MF);
  Dispatch.filter = MF.filter.bind(MF);
  Action = MF.Action;

  callbackA = mockCallback("A");
  callbackB = mockCallback("B");
};

Tinytest.add('MeteorFlux - Test mock callback functions',
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

Tinytest.add('MeteorFlux - Register function should be executed and should',
  function (test) {
    beforeEach();

    let payload = {};
    Register(() => {
      callbackA(payload);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], payload);
  }
);

Tinytest.add('MeteorFlux - Register function should not be reactive',
  function (test) {
    beforeEach();

    let payload = { flag: false };
    let react = new ReactiveVar(false);

    Register(() => {
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

Tinytest.add('MeteorFlux - Should queue a dispatch if is dispatch',
  function (test) {
    beforeEach();

    let text = '';

    Register(() => {
      if (Action.is('SOMETHING_HAPPENED')) {
        text = text + 'hi ';
        Dispatch('OTHER_THING_HAPPENED');
      }
    });

    Register(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'john!';
    });

    Dispatch('SOMETHING_HAPPENED');
    Tracker.flush();

    test.equal(text, 'hi john!');
  }
);

Tinytest.add('MeteorFlux - Should get action type inside Register',
  function (test) {
    beforeEach();

    Register(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('MeteorFlux - Should compare action inside Register',
  function (test) {
    beforeEach();

    Register(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        callbackA();
    });

    Register(() => {
      if (Action.is('OTHER_THING_HAPPENED'))
        callbackB();
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackB.calls.length, 0);
  }
);

Tinytest.add('MeteorFlux - Should get action payload directly',
  function (test) {
    beforeEach();

    Register(() => {
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

Tinytest.add('MeteorFlux - Should get action payload with helper',
  function (test) {
    beforeEach();

    Register(() => {
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

Tinytest.add('MeteorFlux - Should get type in Register, but not be reactive',
  function (test) {
    beforeEach();

    Register(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');

    MF._actionType = 'OTHER_THING_HAPPENED';

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('MeteorFlux - Should register and execute autorun functions',
  function (test) {
    beforeEach();

    Tracker.autorun(() => {
      let type = Action.type();
      callbackA(type);
    });

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'INIT');
  }
);

Tinytest.add('MeteorFlux - Should execute autorun functions with Dispatch',
  function (test) {
    beforeEach();

    Tracker.autorun(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 2);
    test.equal(callbackA.calls[1], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('MeteorFlux - Should execute autorun functions reactively',
  function (test) {
    beforeEach();

    let react = new ReactiveVar('Register run');

    Tracker.autorun(() => {
      if(Action.is('SOMETHING_HAPPENED')) {
        callbackA(react.get());
      }
    });

    Tracker.flush();
    test.equal(callbackA.calls.length, 0);

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'Register run');

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

Tinytest.add('MeteorFlux - Should trigger different autorun functions',
  function (test) {
    beforeEach();

    let react = new ReactiveVar(false);

    Tracker.autorun(() => {
      callbackA();
      if((Action.is('SOMETHING_HAPPENED')) && (react.get() === true)) {
        callbackB(true);
      }
    });

    Tracker.autorun(() => {
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

Tinytest.add('MeteorFlux - Should execute AfterAction functions',
  function (test) {
    beforeEach();

    AfterAction(() => {
      let type = Action.type();
      callbackA(type);
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'SOMETHING_HAPPENED');
  }
);

Tinytest.add('MeteorFlux - Should execute AfterAction without reactivity',
  function (test) {
    beforeEach();

    let react = new ReactiveVar('Register run');

    AfterAction(() => {
      if(Action.is('SOMETHING_HAPPENED'))
        callbackA(react.get());
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
    test.equal(callbackA.calls[0], 'Register run');

    react.set('Second run');

    Tracker.flush();
    test.equal(callbackA.calls.length, 1);
  }
);

Tinytest.add('MeteorFlux - Should execute all in order',
  function (test) {
    beforeEach();

    let text = '';

    Register(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'Register, ';
    });

    Tracker.autorun(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'Reactive, ';
    });

    AfterAction(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        text = text + 'AfterAction!';
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(text, 'Register, Reactive, AfterAction!');
  }
);

Tinytest.add('MeteorFlux - Should execute all in order with reactivity',
  function (test) {
    beforeEach();

    let text = '';
    let react = new ReactiveVar(false);

    Register(() => {
      switch (Action.type()) {
        case 'SOMETHING_HAPPENED':
          text = text + 'Register, ';
          break;
        default:

      }
    });

    Tracker.autorun(() => {
      if ((Action.is('SOMETHING_HAPPENED')) && (react.get() === true))
        text = text + 'Reactive, ';
    });

    Tracker.autorun(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        react.set(true);
    });

    AfterAction(() => {
      if ((Action.is('SOMETHING_HAPPENED')) && (react.get() === true))
        text = text + 'AfterAction!';
    });

    Dispatch('SOMETHING_HAPPENED');

    Tracker.flush();
    test.equal(text, 'Register, Reactive, AfterAction!');
  }
);

Tinytest.add('MeteorFlux - State is working',
  function (test) {
    beforeEach();

    test.instanceOf(State, MeteorFlux.ReactiveState);
    State.set('something', true);
    test.isTrue(State.get('something'));
  }
);

Tinytest.add('MeteorFlux - Dispatcher is dispatching',
  function (test) {
    beforeEach();

    Register(() => {
      test.equal(Dispatch.isDispatching(), true);
    });

    test.equal(Dispatch.isDispatching(), false);

    Dispatch('SOMETHING_HAPPENED');
  }
);

Tinytest.add('MeteorFlux - Dispatcher should queue actions with after',
  function (test) {
    beforeEach();

    let text = '';

    Register(() => {
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

Tinytest.add('MeteorFlux - Empty payload should return empty object',
  function (test) {
    beforeEach();

    let emptyPayload = null;

    Register(() => {
      emptyPayload = Action.payload();
    });

    Dispatch('SOMETHING_HAPPENED');

    test.equal(emptyPayload, {});
  }
);

Tinytest.add('MeteorFlux - Dispatching same action twice should work',
  function (test) {
    beforeEach();

    let counter1 = 0;
    let counter2 = 0;

    Register(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        counter1++;
    });

    Tracker.autorun(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        counter2++;
    });

    Dispatch('SOMETHING_HAPPENED')
       .then('SOMETHING_HAPPENED');
    Tracker.flush();

    test.equal(counter1, 2);
    test.equal(counter2, 2);
  }
);

Tinytest.add('MeteorFlux - Should redirect using filters',
  function (test) {
    beforeEach();

    Dispatch.filter(payload => {
      if (payload.type === 'SOMETHING_HAPPENED')
        payload.type = 'OTHER_THING_HAPPENED';

      return payload;
    });

    let counter1 = 0;
    let counter2 = 0;

    Register(() => {
      if (Action.is('OTHER_THING_HAPPENED'))
        counter1++;
    });

    Tracker.autorun(() => {
      if (Action.is('OTHER_THING_HAPPENED'))
        counter2++;
    });

    Dispatch('SOMETHING_HAPPENED');
    Tracker.flush();

    test.equal(counter1, 1);
    test.equal(counter2, 1);
  }
);

Tinytest.add('MeteorFlux - Should cancel dispatch if filter returns false',
  function (test) {
    beforeEach();

    Dispatch.filter(payload => {
      return (payload.type === 'OTHER_THING_HAPPENED') ? false : payload;
    });

    let counter1 = 0;
    let counter2 = 0;

    Register(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        counter1++;
    });

    Tracker.autorun(() => {
      if (Action.is('SOMETHING_HAPPENED'))
        counter1++;
    });

    Register(() => {
      if (Action.is('OTHER_THING_HAPPENED'))
        counter2++;
    });

    Tracker.autorun(() => {
      if (Action.is('OTHER_THING_HAPPENED'))
        counter2++;
    });

    Dispatch('SOMETHING_HAPPENED')
      .then('OTHER_THING_HAPPENED');
    Tracker.flush();

    test.equal(counter1, 2);
    test.equal(counter2, 0);
  }
);
