MeteorFlux.FirstThenFinally = class FirstThenFinally {
  constructor() {
    let self = this;

    self._isDispatching = false;
    self._phase = 'idle'; // Can be 'idle', 'first', 'then' or 'finally'

    self._firstFuncs = [];
    self._finallyFuncs = [];
    self._actionType = 'INIT';
    self._reactiveDict = new ReactiveDict();
    self._reactiveDict.set('type', self._actionType);

    self.Action = {};
    self._populatePayload();
  }

  _populatePayload(payload = {}) {
    let self = this;
    check(payload, Object);

    _.each(self.Action, (v, k) => delete self.Action[k]);
    _.extend(self.Action, payload);

    self.Action.type = self._ActionType.bind(self);
    self.Action.is = self._ActionIs.bind(self);
    self.Action.payload = self._ActionPayload.bind(self);
  }

  _ActionType() {
    let self = this;
    if (self._phase === 'first') {
      return self._actionType;
    } else {
      return self._reactiveDict.get('type');
    }
  }

  _ActionIs(actionType) {
    check(actionType, String);
    let self = this;
    if (self._phase === 'first') {
      return (actionType === self._actionType);
    } else {
      return self._reactiveDict.equals('type', actionType);
    }
  }

  _ActionPayload() {
    let self = this;
    return _.omit(self.Action, _.functions(self.Action));
  }

  First(func) {
    check(func, Function);
    let self = this;
    self._firstFuncs.push(func);
  }

  Then(func) {
    check(func, Function);
    Tracker.autorun(c => {
      func();
    });
  }

  Finally(func) {
    check(func, Function);
    let self = this;
    self._finallyFuncs.push(func);
  }

  Dispatch(/*arguments*/) {
    check(arguments, Array(Match.OneOf(String, Object)), Object);
    let self = this;
    let payload = null;

    if (self.isDispatching())
      throw new Error('cant-dispatch-while-dispatching');

    // Start Dispatching
    self._isDispatching = true;

    // Populate action
    if (Match.test(arguments[0], String)) {
      self._actionType = arguments[0];
      self._populatePayload(arguments[1]);
    } else if (Match.test(arguments[0], Object)) {
      self._actionType = arguments[0].type;
      self._populatePayload(_.omit(arguments[0], 'type'));
    }

    // First, do the First functions.
    self._phase = 'first';
    _.each(self._firstFuncs, func => {
      Tracker.nonreactive(func);
    });

    // Then, do the Then functions. Just set the Dependency to changed so they
    // are invalidated by Tracker.
    self._phase = 'then';
    self._reactiveDict.set('type', self._actionType);

    // Finally, do the Finally functions. Use a Tracker.afterFlush so they are
    // executed after the Then functions.
    Tracker.afterFlush(() => {
      self._phase = 'finally';
      _.each(self._finallyFuncs, func => {
        Tracker.nonreactive(func);
      });

      // End dispatching
      self._isDispatching = false;
      self._phase = 'idle';
    });
  }

  isDispatching() {
    let self = this;
    return self._isDispatching;
  }
};

// Create instance and assign it to global objects
let ftf = new MeteorFlux.FirstThenFinally();
First = ftf.First.bind(ftf);
Then = ftf.Then.bind(ftf);
Finally = ftf.Finally.bind(ftf);
Dispatch = ftf.Dispatch.bind(ftf);
Dispatch.isDispatching = ftf.isDispatching.bind(ftf);
Action = ftf.Action;
State = new MeteorFlux.ReactiveState();
