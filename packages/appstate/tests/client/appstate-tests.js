let beforeEach = () => {
  Dispatcher.reset();
  Dispatcher.addDispatchFilter(Dispatcher._curatePayload);
  Dispatcher.addRegisterFilter(Dispatcher._curateCallback);
  AppState = new MeteorFlux.AppState();
  Blaze._globalHelpers = [];
};

Tinytest.add(
  'MeteorFlux - AppState - Set should trow.',
  function(test, onComplete) {
    beforeEach();

    test.throws(AppState.set, 'appstate-set-is-forbidden');
  }
);

Tinytest.addAsync(
  'MeteorFlux - AppState - Use modify to and get default value.',
  function(test, onComplete) {
    beforeEach();

    AppState.modify('string', function(action, state = false) {
      switch (action.type) {
        case 'SOMETHING_HAPPENED':
          state = 'I am a string';
          return state;
        case 'OTHER_THING_HAPPENED':
          state = false;
          return state;
        default:
          return state;
      }
    });

    Meteor.defer(function() {
      test.equal(AppState.get('string'), false);
        onComplete();
    });
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Use modify to set a normal value.',
  function(test) {
    beforeEach();

    AppState.modify('string', function(action, state = false) {
      switch (action.type) {
        case 'SOMETHING_HAPPENED':
          state = 'I am a string';
          return state;
        case 'OTHER_THING_HAPPENED':
          state = false;
          return state;
        default:
          return state;
      }
    });

    Dispatcher.dispatch('SOMETHING_HAPPENED');
    test.equal(AppState.get('string'), 'I am a string');
    test.equal(Blaze.toHTML(Template.appstate_stringTemplate),
      'I am a string inside a template.');

    Dispatcher.dispatch('OTHER_THING_HAPPENED');
    test.isFalse(AppState.get('string'));
    test.equal(Blaze.toHTML(Template.appstate_stringTemplate), '');

  }
);

Tinytest.add(
  'MeteorFlux - AppState - Wait for another modify.',
  function(test) {
    beforeEach();

    AppState.modify('text', (action, state) => {
      let number = AppState.get('number');
      return 'Number is ' + number;
    });

    AppState.modify('number', (action, state) => {
      return action.number || 0;
    });

    Dispatcher.dispatch('NUMBER_CHANGED', { number: 1 });
    test.equal(AppState.get('text'), 'Number is 1');
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Wait for two different modifies.',
  function(test) {
    beforeEach();

    AppState.modify('user.fullName', (action, state = '') => {
      let firstName = AppState.get('user.firstName');
      let lastName  = AppState.get('user.lastName');
      return 'You know nothing, ' + firstName + ' ' + lastName;
    });

    AppState.modify('user.firstName', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.firstName;
      else
        return state;
    });

    AppState.modify('user.lastName', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.lastName;
      else
        return state;
    });

    Dispatcher.dispatch('PROFILE_CHANGED',
      { firstName: 'John', lastName: 'Snow' });

    test.equal(AppState.get('user.fullName'), 'You know nothing, John Snow');
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Wait for a nested modify.',
  function(test) {
    beforeEach();

    AppState.modify('user.fullName', (action, state = '') => {
      let user = AppState.get('user');
      return 'You know nothing, ' + user.firstName + ' ' + user.lastName;
    });

    AppState.modify('user', (action, state = {}) => {
      if (action.type === 'PROFILE_CHANGED')
        return {
          firstName: action.firstName,
          lastName: action.lastName
        };
      else
        return state;
    });

    Dispatcher.dispatch('PROFILE_CHANGED',
      { firstName: 'John', lastName: 'Snow' });

    test.equal(AppState.get('user.fullName'), 'You know nothing, John Snow');
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Wait for two different modifies with same object.',
  function(test) {
    beforeEach();

    AppState.modify('user.fullName', (action, state = '') => {
      let user = AppState.get('user');
      return 'You know nothing, ' + user.firstName + ' ' + user.lastName;
    });

    AppState.modify('user.firstName', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.firstName;
      else
        return state;
    });

    AppState.modify('user.lastName', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.lastName;
      else
        return state;
    });

    Dispatcher.dispatch('PROFILE_CHANGED',
      { firstName: 'John', lastName: 'Snow' });

    test.equal(AppState.get('user.fullName'), 'You know nothing, John Snow');
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Wait for two modifies with same object, v2.',
  function(test) {
    beforeEach();

    AppState.modify('user.fullName', (action, state = '') => {
      let user = AppState.get('user');
      return 'You know nothing, ' + user.firstName + ' ' + user.lastName;
    });

    AppState.modify('user', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return { firstName: action.firstName };
      else
        return state;
    });

    AppState.modify('user.lastName', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.lastName;
      else
        return state;
    });

    Dispatcher.dispatch('PROFILE_CHANGED',
      { firstName: 'John', lastName: 'Snow' });

    test.equal(AppState.get('user.fullName'), 'You know nothing, John Snow');
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Wait for two modifies with same object, v3.',
  function(test) {
    beforeEach();

    AppState.modify('user.fullName', (action, state = '') => {
      let user = AppState.get('user');
      return 'You know nothing, ' + user.firstName + ' ' + user.lastName;
    });

    AppState.modify('user', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return { firstName: action.firstName };
      else
        return state;
    });

    AppState.modify('user', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return { lastName: action.lastName };
      else
        return state;
    });

    Dispatcher.dispatch('PROFILE_CHANGED',
      { firstName: 'John', lastName: 'Snow' });

    test.equal(AppState.get('user.fullName'), 'You know nothing, John Snow');
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Add deeper modifies.',
  function(test) {
    beforeEach();

    AppState.modify('user.paths.imageUrl', (action, state = '') => {
      let image = AppState.get('user.image');
      return 'http://domain.com/images/' + image;
    });

    AppState.modify('user.paths', (action, state = '') => {
      let user = AppState.get('user');
      return {
        personalUrl: 'http://domain.com/user/' +
          user.firstName + '/' + user.lastName
      };
    });

    AppState.modify('user', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return { firstName: action.firstName };
      else
        return state;
    });

    AppState.modify('user.lastName', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.lastName;
      else
        return state;
    });

    AppState.modify('user.image', (action, state = '') => {
      if (action.type === 'PROFILE_CHANGED')
        return action.image;
      else
        return state;
    });

    Dispatcher.dispatch('PROFILE_CHANGED',
      { firstName: 'John', lastName: 'Snow', image: 'johnsnow.jpg' });

    test.equal(AppState.get('user.paths.personalUrl'),
      'http://domain.com/user/John/Snow');

    test.equal(AppState.get('user.paths.imageUrl'),
      'http://domain.com/images/johnsnow.jpg');
  }
);
