MeteorFlux.MF = class MF {
  constructor() {
    let self = this;

    // Can be 'Idle', 'Register', 'Reactive' or 'AfterAction'
    self._phase = 'Idle';

    self._isDispatching = false;
    self._registerFuncs = [];
    self._afterActionFuncs = [];
    self._filterFuncs = [];
    self._queuedActions = [];

    // INIT is the initial action type. Only reactive functions (State.modify,
    // Tracker.autorun, Template helpers...) will be executed. This is not a
    // decision, it's how reactive functions work normally on Meteor.
    self._actionType = 'INIT';
    self._actionDep = new Tracker.Dependency();

    // Create the Action object and bind it.
    self.Action = {};
    self.Action.type = self._ActionType.bind(self);
    self.Action.is = self._ActionIs.bind(self);
    self.Action.payload = self._ActionPayload.bind(self);
  }

  _populatePayload(payload = {}) {
    let self = this;
    check(payload, Object);

    let actionFuncNames = ['type', 'is', 'payload'];

    // Empty the Action object. We do this instead of creating a new object
    // because we don't want to lose the binding when used in its own global.
    // For example, Action = MF.Action;.
    _.each(self.Action, (v, k) => {
      if (_.indexOf(actionFuncNames, k) === -1)
        delete self.Action[k];
      });

    // Then extend it but without type, is or payload, which are the functions
    // used for reactivity binded in the constructor.
    _.extend(self.Action, _.omit(payload, actionFuncNames));
  }

  _ActionType() {
    let self = this;
    self._actionDep.depend();
    return self._actionType;
  }

  _ActionIs(actionType) {
    let self = this;
    check(actionType, String);
    self._actionDep.depend();
    return (actionType === self._actionType);
  }

  _ActionPayload() {
    let self = this;
    return _.omit(self.Action, _.functions(self.Action));
  }

  Register(func) {
    check(func, Function);
    let self = this;
    self._registerFuncs.push(func);
  }

  AfterAction(func) {
    check(func, Function);
    let self = this;
    self._afterActionFuncs.push(func);
  }

  Dispatch(/*arguments*/) {
    check(arguments, Array(Match.OneOf(String, Object)), Object);
    let self = this;
    let payload = null;

    // Throw if it's already dispatching.
    if (self.isDispatching()) {
      self._queuedActions.push(arguments);
    } else {
      // Populate payload.
      if (Match.test(arguments[0], String)) {
        payload = arguments[1] || {};
        payload.type = arguments[0];
      } else {
        payload = arguments[0] || {};
      }

      // Filter the dispatch.
      _.each(self._filterFuncs, func => {
        if (payload !== false) {
          Tracker.nonreactive(() => {
            payload = func(payload);
          });
        }
      });

      // Cancel dispatch if payload is false.
      if (payload === false)
        return self;

      // Populate action.
      self._actionType = payload.type;
      self._populatePayload(payload);

      // Start Dispatching
      self._isDispatching = true;

      // First, do the Register functions.
      self._phase = 'Register';
      _.each(self._registerFuncs, func => {
        Tracker.nonreactive(func);
      });

      // Then, do the reactive functions. Just set the Dependency to changed so
      // they are invalidated by Tracker.
      self._phase = 'Reactive';
      self._actionDep.changed();

      // Finally, do the AfterAction functions. Use a Tracker.afterFlush so they
      // are executed after the reactive functions.
      Tracker.afterFlush(() => {
        self._phase = 'AfterAction';
        _.each(self._afterActionFuncs, func => {
          Tracker.nonreactive(func);
        });

        // End dispatching
        self._isDispatching = false;
        self._phase = 'Idle';

        // See if there are queueded actions
        if (self._queuedActions.length > 0) {
          let args = self._queuedActions[0];
          self._queuedActions.shift();
          self.Dispatch.apply(self, args);
        }
      });
    }
    return self;
  }

  then(/*arguments*/) {
    let self = this;
    self._queuedActions.push(arguments);
    return self;
  }

  isDispatching() {
    let self = this;
    return self._isDispatching;
  }

  filter(func) {
    check(func, Function);
    let self = this;
    self._filterFuncs.push(func);
  }
};

// Create instance and assign it to global objects
let MF = new MeteorFlux.MF();
Action = MF.Action;
Dispatch = MF.Dispatch.bind(MF);
Dispatch.isDispatching = MF.isDispatching.bind(MF);
Dispatch.filter = MF.filter.bind(MF);
Register = MF.Register.bind(MF);
State = new MeteorFlux.ReactiveState();
AfterAction = MF.AfterAction.bind(MF);
