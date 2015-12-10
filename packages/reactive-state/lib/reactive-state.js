// Retrieve all the property names of an object. Mising in Meteor's underscore.
_.allKeys = function(obj) {
  if (!_.isObject(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (hasEnumBug) collectNonEnumProps(obj, keys);
  return keys;
};
// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');

MeteorFlux.ReactiveState = class ReactiveState {
  constructor() {
    let self = this;

    // Value to retrieve if a key is not set yet.
    self._NOTSET = undefined;

    // Object to store all the values.
    self._obj = {};

    // Object to store all the dependencies.
    self._deps = { children: {}, dep: new Tracker.Dependency() };

    // Function to check if something is an object but not an array.
    self._isObject = Match.Where(obj => {
      return (obj && typeof obj === 'object' &&
        obj.constructor.toString().indexOf('Array') === -1);
    });
  }

  // This function gets a keypath and checks if its a string like "author.name"
  // or if it is an array. In any case, it will return the corresponding array
  // value. For example: 'a.b' returns ['a', 'b'].
  _checkKeyPath(keyPath) {
    if (Match.test(keyPath, String)){
      keyPath = keyPath.split('.');
    } else if (!Match.test(keyPath, Array)) {
      throw new Error('Invalid keypath');
    }
    return keyPath;
  }

  // This function gets a keyPath (array) and generates a new keyPath in
  // string format. For example: ['a', 'b'] returns 'a.b'.
  _keyPathToString(keyPath) {
    if (Match.test(keyPath, Array)) {
      return _.reduce(keyPath, function(memo, string) {
        if (memo === '')
          return string;
        else
          return memo + '.' + string;
      }, '');
    } else if (Match.test(keyPath, String)) {
      return keyPath;
    } else {
      throw new Error('keyPath must be an Array or a String.');
    }

  }

  // This function gets a keyPath (array) and returns the value stored in
  // AppState for it. If is not set yet, it will return the _NOTSET value.
  _getValueInPath(keyPath) {
    let self = this;
    let node = self._obj;
    for (let i = 0; i < keyPath.length; i++) {
      if ((Match.test(node, Object)) && (keyPath[i] in node)) {
        node = node[keyPath[i]];
      } else {
        return self._NOTSET;
      }
    }
    return node;
  }

  // This function gets a keyPath (array) and a new value and stores it in
  // AppState.
  _setValue(keyPath, newValue) {
    let self = this;
    let oldValue = self._getValueInPath(keyPath);
    if (oldValue !== newValue) {
      self._setValueOnPath(keyPath, newValue);
      self._changeDep(keyPath);
    }
  }

  // This function gets a keyPath (array) and a value and creates a new object
  // with the proper structure from the keyPath and the value stored in its
  // correct place. For example:
  // ['a', 'b'] and 'data' returns { a: { b: 'data' } }
  _createObjFromValue(keyPath, value) {
    let self = this;
    let obj = {};
    let currentNode = obj;
    let nextNode = null;
    for (let i = 0; i < keyPath.length; i++) {
      nextNode = currentNode[keyPath[i]] = currentNode[keyPath[i]] || {};
      if (i === (keyPath.length - 1)) {
        currentNode[keyPath[i]] = value;
      } else {
        currentNode = nextNode;
      }
    }
    return obj;
  }

  // This function takes keyPath (array) and returns the same node in the
  // dependency object. If it doesn't exist, it will create it.
  _getDepNode(keyPath) {
    let self = this;
    let currentNode = self._deps;
    let nextNode = null;
    for (let i = 0; i < keyPath.length; i++) {
      nextNode = currentNode.children[keyPath[i]] =
        currentNode.children[keyPath[i]] ||
        { children: {}, dep: new Tracker.Dependency() };
      currentNode = nextNode;
    }
    return currentNode.dep;
  }

  // This function adds a dependency for the keyPath (array). This means that
  // if a Tracker computation is running, it will create the reactive
  // dependency.
  _addDep(keyPath){
    let self = this;
    let dep = self._getDepNode(keyPath);
    dep.depend();
  }

  // This function triggers a dependency for a value which has changed. The
  // Tracker computations dependent will be invalidated.
  _changeDep(keyPath) {
    let self = this;
    let dep = self._getDepNode(keyPath);
    dep.changed();
  }

  // This function gets the old object tree, a new one (created with
  // _createObjFromValue) and a keyPath (array) and merges both together.
  // The result is the new state.
  _changeObj(oldObj, newObj, rootKeyPath = []) {
    let self = this;

    _.each(_.without(_.allKeys(newObj), 'constructor'), key => {
      // We need to clone the array so we don't modify the rootKeyPath and
      // it is still valid in the next for iteration.
      let keyPath = [...rootKeyPath, key];

      // In the case that there is a previous object and the new value is
      // undefined instead of an object, do nothing.
      if ((newObj === undefined) && Match.test(oldObj, self._isObject)) {
        return;
      } else if (!_.isEqual(oldObj[key], newObj[key])) {

        // If they are not equal, the first thing to do it to mark this
        // keyPath as changed to trigger all the Tracker.autoruns.
        self._changeDep(keyPath);

        // Check if it is an object
        if (Match.test(newObj[key], self._isObject)) {

          // If oldObj is not an object, make a new one so we can merge both.
          if (!Match.test(oldObj[key], self._isObject)) {
            oldObj[key] = {};
          }

          // Now both are objects, use _changeObj again.
          self._changeObj(oldObj[key], newObj[key], keyPath);

        } else if ((newObj[key] === undefined) &&
                   (Match.test(oldObj[key], self._isObject))) {
          // If it's undefined and the old value is a an object, do nothing
          // because maybe it's a function not returning.
          return;
        } else if (Match.test(newObj[key], Function)) {
          // If the newObj is a function, we bind it to the newObj
          oldObj[key] = _.bind(newObj[key], newObj);
        } else {
          // If it's not that case, we just overwrite the value.
          oldObj[key] = newObj[key];
        }
      }
    });
  }

  // This function takes a path (string) and registers it as a Blaze helper.
  _registerHelper(path) {
    let self = this;
    Template.registerHelper(path, () => {
      return self.get(path);
    });
  }

  // This function gets a keyPath (array) and a function and puts it in a
  // Tracker computation. The function will be executed and the result will be
  // stored in the AppState. This means we don't store function, we store the
  // resulting objects. If the function is reactive and something inside it
  // changes, this Tracker computation will be run again and AppState will
  // be updated with the correct values.
  _setFunction(keyPath, func) {
    let self = this;
    Tracker.autorun(() => {
      let oldValue = self._getValueInPath(keyPath);
      let result = func(oldValue);
      // check if it's a Mongo Cursor and run fetch.
      if ((result) && (typeof result === 'object') &&
          (result.fetch !== undefined)) {
        self._setObject(keyPath, result.fetch());
      } else {
        self._setObject(keyPath, result);
      }
    });
  }

  // This funciton gets a keyPath (array) and a new value and it creates a new
  // object with the value and merges it with the old object tree. Then it
  // registers the Blaze helper.
  _setObject(keyPath, newValue) {
    let self = this;
    let newObjFromValue = self._createObjFromValue(keyPath, newValue);
    self._changeObj(self._obj, newObjFromValue);
    self._registerHelper(keyPath[0]);
  }

  // This public method gets a keyPath (string or array) and a new value and
  // stores it in the AppState object tree.
  set(keyPath, newValue) {
    let self = this;
    keyPath = self._checkKeyPath(keyPath);

    if (Match.test(newValue, Function)) {
      self._setFunction(keyPath, newValue);
    } else {
      self._setObject(keyPath, newValue);
    }
  }

  // This public method gets a keyPath (string or array) and a new value and
  // stores it in the AppState object tree.
  modify(keyPath, modifier) {
    let self = this;

    if (Match.test(modifier, Function)) {
      keyPath = self._checkKeyPath(keyPath);
      self._setFunction(keyPath, modifier);
    } else {
      throw new Error('Invalid modifier function');
    }
  }

  // This public method gets a keyPath (string or array) and returns the
  // correct value of the object tree. If a Tracker computation is currently
  // active it will add a dependency.
  get(keyPath) {
    let self = this;
    keyPath = self._checkKeyPath(keyPath);

    let value = self._getValueInPath(keyPath);

    if ((Match.test(value, self._isObject)) && (value.array)) {
      oldValue = value;
      value = value.array;
      _.extend(value, _.omit(oldValue, 'array'));
    }

    if (Match.test(value, Function))
      value = value();

    if (Tracker.active) {
      self._addDep(keyPath, value);
    }

    return value;
  }
};

// Creates a new instance to be exported.
ReactiveState = MeteorFlux.ReactiveState;
