MeteorFlux.AppState = class AppState extends ReactiveState {
  constructor() {
    // Call ReactiveState constructor.
    super();

    let self = this;

    // Create object to store dispatcher tokens.
    self._tokenIds = {};
    self._currentModify = false;
  }

  // Set cannot be used in AppState.
  set(keyPath, newValue) {
    throw Error('To change the state, use the \'modify\' method only.');
  }

  _waitFor(keyPath) {
    let self = this;
    if (Dispatcher.isDispatching()) {
      let currentKeyArray = [];
      for (let i = 0; i < keyPath.length; i++) {
        currentKeyArray = [...currentKeyArray, keyPath[i]];
        let stringKeyPath = super._keyPathToString(currentKeyArray);
        let tokenArray = self._tokenIds[stringKeyPath];
        if (tokenArray) {
          let ownTokens = self._tokenIds[self._currentModify];
          tokenArray = _.without(tokenArray, ...ownTokens);
          Dispatcher.waitFor(tokenArray);
        }
      }
    }
  }

  _addTokens(keyPath, tokenId) {
    let self = this;
    let currentKeyArray = [];
    for (let i = 0; i < keyPath.length; i++) {
      currentKeyArray = [...currentKeyArray, keyPath[i]];
      let stringKeyPath = super._keyPathToString(currentKeyArray);
      self._tokenIds[stringKeyPath] = self._tokenIds[stringKeyPath] || [];
      self._tokenIds[stringKeyPath].push(tokenId);
    }
  }

  // Private get to use inside modify and don't trigger waitFor circular
  // dependencies because this one doesn't call waitFor.
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
      if (!self._currentModify)
        self._currentModify = stringKeyPath;

      let state = self._get(keyPath);
      super.set(keyPath, func(action, state));

      if (self._currentModify === stringKeyPath)
        self._currentModify = false;
    };

    let tokenId = Dispatcher.register(funcWithState);

    self._addTokens(keyPath, tokenId);

    // Initializate but only when all modifies have been created.
    Meteor.defer(() => {
      funcWithState({});
    });

  }
};

// Creates a new instance to be exported.
AppState = new MeteorFlux.AppState();
