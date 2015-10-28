MeteorFlux.AppState = class AppState extends ReactiveState {
  constructor() {
    // Call ReactiveState constructor.
    super();

    let self = this;

    // Store the tokenIds of each modify. We store here only the modifies which
    // are exactly the ones with the name passed. For example, for "user.name"
    // we store only the AppState.modify('user.name'...) ones.
    self._tokenSingleIds = {};

    // Store the tokenIds of all modifies below each one. For example, for
    // "user" we store all the AppState.modify('user'...) but also any
    // AppState.modify('user.name'...) or AppState.modify('user.image'...).
    self._tokenAllIds = {};

    // Store here the modifies which are be executed but are paused for any
    // waitFor, so we don't call them again and cause a circular recurrency.
    self._isPending = {};
  }

  // Set cannot be used in AppState. We only 'modify'.
  set(keyPath, newValue) {
    throw Error('appstate-set-is-forbidden');
  }

  // Internal function to do the waitFor logic.
  _waitFor(keyPath) {
    let self = this;
    if (Dispatcher.isDispatching()) {

      // Find out which are the tokenIds being dispatched so we don't cause
      // circular recurrencies.
      let ownTokens = _.chain(self._isPending).map(
        (isPending, keyPath) => {
          if (isPending)
            return self._tokenSingleIds[keyPath];
        }
      ).flatten().value();

      // Node for iteration.
      let currentKeyArray = [];

      for (let i = 0; i < keyPath.length; i++) {
        currentKeyArray = [...currentKeyArray, keyPath[i]];
        let stringKeyPath = super._keyPathToString(currentKeyArray);

        // We have to waitFor any modify in the path above the original. For
        // example, 'user.image.width' should waitFor 'user' and 'user.image'.
        let tokenArray = null;
        if (i !== (keyPath.length - 1)) {
          tokenArray = self._tokenSingleIds[stringKeyPath];
        } else {
          // We have to waitFor any modify in the path below the original. For
          // example, 'user.image' should waitFor things like 'user.image' and
          // 'user.image.url' or 'user.image.width'.
          tokenArray = self._tokenAllIds[stringKeyPath];
        }

        // If we have something to wait for, let's wait. But we remove our own
        // tokens first to avoid circular dependencies.
        if (tokenArray) {
          tokenArray = _.without(tokenArray, ...ownTokens);
          Dispatcher.waitFor(tokenArray);
        }
      }
    }
  }

  // This method will add all the necesary tokens to the objects.
  _addTokens(keyPath, tokenId) {
    let self = this;

    let stringKeyPath = super._keyPathToString(keyPath);

    self._tokenSingleIds[stringKeyPath] =
      self._tokenSingleIds[stringKeyPath] || [];
    self._tokenSingleIds[stringKeyPath].push(tokenId);

    let currentKeyArray = [];
    for (let i = 0; i < keyPath.length; i++) {
      currentKeyArray = [...currentKeyArray, keyPath[i]];
      stringKeyPath = super._keyPathToString(currentKeyArray);
      self._tokenAllIds[stringKeyPath] = self._tokenAllIds[stringKeyPath] || [];
      self._tokenAllIds[stringKeyPath].push(tokenId);
    }
  }

  // Private get to use inside modify and don't trigger waitFor circular
  // dependencies because this one doesn't call waitFor again.
  _get(keyPath) {
    return super.get(keyPath);
  }

  // This public method gets a keyPath (string or array) and returns the
  // correct value of the object tree. If a Tracker computation is currently
  // active it will add a dependency
  get(keyPath) {
    let self = this;
    keyPath = self._checkKeyPath(keyPath);
    self._waitFor(keyPath);
    return self._get(keyPath);
  }

  // This method is useful to modify a specific state depending on the
  // dispatched Flux actions. Very similar to how Redux
  // (http://rackt.github.io/redux/) works. Check the tests for an example.
  modify(keyPath, func) {
    let self = this;
    let stringKeyPath = self._keyPathToString(keyPath);
    keyPath = self._checkKeyPath(keyPath);

    // Create function with state in the closure.
    var funcWithState = function(action) {
      // Save current modify to discard it in the waitFor and avoid circular
      // dependencies. Save only if this is the parent modify.
      self._isPending[stringKeyPath] = true;

      let state = self._get(keyPath);
      super.set(keyPath, func(action, state));

      self._isPending[stringKeyPath] = false;
    };

    let tokenId = Dispatcher.register(funcWithState);

    self._addTokens(keyPath, tokenId);

    // Initializate but only when all modifies have been created.
    Meteor.defer(() => {
      funcWithState({ type: 'INIT' });
    });

  }
};

// Creates a new instance to be exported.
AppState = new MeteorFlux.AppState();
