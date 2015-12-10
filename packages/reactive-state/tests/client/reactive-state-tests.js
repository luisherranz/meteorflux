/* jshint -W106 */
let beforeEach = () => { reactiveState = new ReactiveState();
  Blaze._globalHelpers = [];
};


Tinytest.add('ReactiveState - Test internal _checkKeyPath function',
  function (test) {
    beforeEach();

    test.throws(reactiveState._checkKeyPath, undefined);
    test.equal(
      reactiveState._checkKeyPath('a'),
      ['a']
    );

    test.equal(
      reactiveState._checkKeyPath('a.b.c'),
      ['a', 'b', 'c']
    );

    test.equal(
      reactiveState._checkKeyPath(['a', 'b' , 'c']),
      ['a', 'b', 'c']
    );
  }
);

Tinytest.add('ReactiveState - Test internal _getValueInPath function',
  function (test) {
    beforeEach();

    reactiveState._obj = { a: { b: { c: 'c', d: 'd' } }, e: { f: 'f' } };

    test.equal(
      reactiveState._getValueInPath([]),
      { a: { b: { c: 'c', d: 'd' } }, e: { f: 'f' } }
    );

    test.equal(
      reactiveState._getValueInPath(['a']),
      { b: { c: 'c', d: 'd' } }
    );

    test.equal(
      reactiveState._getValueInPath(['a', 'b', 'c']),
      'c'
    );

    test.equal(
      reactiveState._getValueInPath(['a', 'b', 'x']),
      reactiveState._NOTSET
    );

    test.equal(
      reactiveState._getValueInPath(['e']),
      { f: 'f' }
    );

    reactiveState._obj = { a: { b: undefined } };
    test.equal(
      reactiveState._getValueInPath(['a', 'b']),
      undefined
    );

    reactiveState._obj = { a: { b: null } };
    test.equal(
      reactiveState._getValueInPath(['a', 'b']),
      null
    );

    reactiveState._obj = {};
    test.equal(
      reactiveState._getValueInPath(['a']),
      reactiveState._NOTSET
    );
  }
);

Tinytest.add('ReactiveState - Test internal _addDep function',
  function (test) {
    beforeEach();

    reactiveState._obj = { a: 'a' };
    reactiveState._deps = { children: {}, dep: new Tracker.Dependency() };
    reactiveState._addDep(['a']);
    test.isTrue(Match.test(reactiveState._deps,
      {
        children: { a: {
          children: {},
          dep: Tracker.Dependency
        }},
        dep: Tracker.Dependency
      }
    ));
  }
);

Tinytest.add('ReactiveState - Test internal _createObjFromValue func',
  function (test) {
    beforeEach();

    test.equal(reactiveState._createObjFromValue(
      ['a'], 'aa'),
      { a: 'aa' }
    );

    test.equal(reactiveState._createObjFromValue(
      ['a', 'b', 'c'], 'cc'),
      { a: { b: { c: 'cc' }}}
    );

    test.equal(reactiveState._createObjFromValue(
      ['a', 'b', 'c'], { d: 'dd' }),
      { a: { b: { c: { d: 'dd' }}}}
    );
  }
);

Tinytest.add('ReactiveState - Test internal _keyPathToString func',
  function (test) {
    beforeEach();

    test.equal(reactiveState._keyPathToString(['a']), 'a');
    test.equal(reactiveState._keyPathToString(['a', 'b']), 'a.b');
    test.equal(reactiveState._keyPathToString('a.b'), 'a.b');
    test.throws(reactiveState._keyPathToString, undefined);
  }
);


Tinytest.add('ReactiveState - Set string',
  function (test) {
    beforeEach();

    reactiveState.set('a', 'I am a string');
    test.equal(reactiveState._obj, { a: 'I am a string' });
  }
);

Tinytest.add('ReactiveState - Set nested string with array',
  function (test) {
    beforeEach();

    reactiveState.set(['a', 'b'], 'I am a string');
    test.equal(reactiveState._obj, { a: { b: 'I am a string' } });
  }
);

Tinytest.add('ReactiveState - Set nested string with string',
  function (test) {
    beforeEach();

    reactiveState.set('a.b', 'I am a string');
    test.equal(reactiveState._obj, { a: { b: 'I am a string' } });
  }
);

Tinytest.add('ReactiveState - Set two nested strings',
  function (test) {
    beforeEach();

    reactiveState.set('a.b', 'I am a string');
    reactiveState.set('a.c', 'I am another string');
    test.equal(
      reactiveState._obj,
      { a: { b: 'I am a string', c: 'I am another string' } }
    );
  }
);

Tinytest.add(
  'ReactiveState - If the state is undefined it returns undefined.',

  function(test) {
    beforeEach();
    test.equal(reactiveState.get('undefined'), reactiveState._NOTSET);
    test.equal(Blaze.toHTML(Template.reactiveState_undefinedTemplate),
      'Variable is false.'
    );
  }
);

Tinytest.add(
  'ReactiveState - If the state is undefined it is still reactive.',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = reactiveState.get('string');
    });

    reactiveState.set('string', 'hi from reactivity!');
    Tracker.flush();

    test.equal(text, 'hi from reactivity!');
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate),
      'hi from reactivity! inside a template.'
    );
  }
);

Tinytest.add(
  'ReactiveState - If state is undefined returns undef even if nested',

  function(test) {
    beforeEach();
    test.equal(reactiveState.get('nested.undefined'), undefined);
    test.equal(Blaze.toHTML(Template.reactiveState_nestedUndefinedTemplate),
      'Variable is false.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get strings',

  function(test) {
    beforeEach();
    reactiveState.set('string', 'I am a string');
    test.equal(reactiveState.get('string'), 'I am a string');
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get nested strings',

  function(test) {
    beforeEach();
    reactiveState.set('nested.string', 'I am a nested string');
    test.equal(reactiveState.get('nested.string'), 'I am a nested string');
    test.equal(Blaze.toHTML(Template.reactiveState_nestedStringTemplate),
      'I am a nested string inside a template.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get strings reactively',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = reactiveState.get('string');
    });
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate), '');
    reactiveState.set('string', 'I am a string');
    Tracker.flush();
    test.equal(text, 'I am a string');
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get strings reactively only in template',

  function(test) {
    beforeEach();
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate2), '');
    reactiveState.set('string2', 'I am a string');
    Tracker.flush();
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate2),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get nested strings reactively',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = reactiveState.get('nested.string');
    });
    reactiveState.set('nested.string', 'I am a nested string');
    Tracker.flush();
    test.equal(text, 'I am a nested string');
    test.equal(Blaze.toHTML(Template.reactiveState_nestedStringTemplate),
      'I am a nested string inside a template.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get numbers',

  function(test) {
    beforeEach();
    reactiveState.set('number', 123);
    test.equal(reactiveState.get('number'), 123);
    test.equal(Blaze.toHTML(Template.reactiveState_numberTemplate),
      'This is 123.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get numbers reactively',

  function(test) {
    beforeEach();
    var number = '';
    Tracker.autorun(function(){
      number = reactiveState.get('number');
    });
    reactiveState.set('number', 123);
    Tracker.flush();
    test.equal(number, 123);
    test.equal(Blaze.toHTML(Template.reactiveState_numberTemplate),
      'This is 123.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get booleans',

  function(test) {
    beforeEach();
    reactiveState.set('boolean', true);
    test.equal(reactiveState.get('boolean'), true);
    test.equal(Blaze.toHTML(Template.reactiveState_booleanTemplate),
      'This is true.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get booleans reactively',

  function(test) {
    beforeEach();
    var boolean = '';
    Tracker.autorun(function(){
      boolean = reactiveState.get('boolean');
    });
    reactiveState.set('boolean', true);
    Tracker.flush();
    test.equal(boolean, true);
    test.equal(Blaze.toHTML(Template.reactiveState_booleanTemplate),
      'This is true.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get objects',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    var author = reactiveState.get('author');
    test.equal(author.name, 'John');
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get objects in nested templates',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    test.equal(Blaze.toHTML(Template.reactiveState_authorNestedTemplate),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get objects reactively',

  function(test) {
    beforeEach();
    var author, authorName;
    Tracker.autorun(function(){
      author = reactiveState.get('author');
    });
    Tracker.autorun(function(){
      authorName = reactiveState.get('author.name');
    });
    reactiveState.set('author', { name: 'John' });
    Tracker.flush();
    test.equal(author.name, 'John');
    test.equal(authorName, 'John');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get functions',

  function(test) {
    beforeEach();
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    var author = reactiveState.get('author');
    test.equal(author.name, 'John');
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get functions reactively',

  function(test) {
    beforeEach();
    var author, name;
    Tracker.autorun(function(){
      author = reactiveState.get('author');
    });
    Tracker.autorun(function(){
      name = reactiveState.get('author.name');
    });
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    Tracker.flush();
    test.equal(author.name, 'John');
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get combined objects',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    reactiveState.set('author', { age: 12 });
    var author = reactiveState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(reactiveState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get combined objects reactively',

  function(test) {
    beforeEach();
    var author, age, name;
    Tracker.autorun(function(){
      author = reactiveState.get('author');
    });
    Tracker.autorun(function(){
      name = reactiveState.get('author.name');
    });
    Tracker.autorun(function(){
      age = reactiveState.get('author.age');
    });
    reactiveState.set('author', { name: 'John' });
    reactiveState.set('author', { age: 12 });
    Tracker.flush();
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(name, 'John');
    test.equal(age, 12);
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(reactiveState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get combined objects and data',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    reactiveState.set('author.age', 12);
    var author = reactiveState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(reactiveState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get combined functions',

  function(test) {
    beforeEach();
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    reactiveState.set('author', function(){
      return { age: 12 };
    });
    var author = reactiveState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(reactiveState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get combined functions with data',

  function(test) {
    beforeEach();
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    reactiveState.set('author.age', 12);
    var author = reactiveState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(reactiveState.get('author.name'), 'John');
    test.equal(reactiveState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);


Tinytest.add(
  'ReactiveState - Set and get deep functions',

  function(test) {
    beforeEach();
    reactiveState.set('post.author', function(){
      return { name: 'John' };
    });
    var post = reactiveState.get('post');
    test.equal(post.author.name, 'John');
    test.equal(reactiveState.get('post.author.name'), 'John');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate5),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate6),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get deep combined functions',

  function(test) {
    beforeEach();
    reactiveState.set('post', function(){
      return { author: { name: 'John' } };
    });
    reactiveState.set('post.author', function(){
      return { age: 12 };
    });
    var post = reactiveState.get('post');
    test.equal(post.author.name, 'John');
    test.equal(post.author.age, 12);
    test.equal(reactiveState.get('post.author.name'), 'John');
    test.equal(reactiveState.get('post.author.age'), 12 );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate7),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate8),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set and get arrays',

  function(test) {
    beforeEach();
    reactiveState.set('posts', [ { title: 'Post 1'}, { title: 'Post 2'} ]);
    var posts = reactiveState.get('posts');
    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[1].title, 'Post 2');
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate1),
      'Post title is Post 1. Post title is Post 2. '
    );
  }
);

Tinytest.add(
  'ReactiveState - Set different fields on objects',

  function(test) {
    beforeEach();
    reactiveState.set('post', {
      title: 'Post 1',
      url: 'http://blog.com'
    });
    reactiveState.set('post.isReady', true);
    var post = reactiveState.get('post');
    test.equal(post.title, 'Post 1');
    test.equal(post.url, 'http://blog.com');
    test.equal(post.isReady, true);
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate2),
      'Post title is Post 1 and url is http://blog.com.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate3),
      'Post title is Post 1 and url is http://blog.com.'
    );
  }
);

Tinytest.add(
  'ReactiveState - Set different fields on cursors',

  function(test) {
    beforeEach();

    Posts = new Mongo.Collection(null);
    Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    Posts.insert({ title: 'Post 2', url: 'http://blog2.com' });

    reactiveState.set('posts.items', () => {
      return Posts.find();
    });
    reactiveState.set('posts.isReady', true);

    var posts = reactiveState.get('posts.items');
    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[0].url, 'http://blog.com');
    test.equal(posts[1].title, 'Post 2');
    test.equal(posts[1].url, 'http://blog2.com');
    test.equal(reactiveState.get('posts.isReady'), true);
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'ReactiveState - Set different fields on cursors reactively',

  function(test) {
    beforeEach();

    var posts;
    Tracker.autorun(() => {
      posts = reactiveState.get('posts.items');
    });

    Posts = new Mongo.Collection(null);
    Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    Posts.insert({ title: 'Post 2', url: 'http://blog2.com' });

    reactiveState.set('posts.items', () => {
      return Posts.find();
    });
    reactiveState.set('posts.isReady', true);
    Tracker.flush();

    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[0].url, 'http://blog.com');
    test.equal(posts[1].title, 'Post 2');
    test.equal(posts[1].url, 'http://blog2.com');
    test.equal(reactiveState.get('posts.isReady'), true);
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'ReactiveState - Set different fields on cursors reactively in ' +
  'inverse order',

  function(test) {
    beforeEach();

    var posts;
    Tracker.autorun(() => {
      posts = reactiveState.get('posts.items');
    });

    Posts = new Mongo.Collection(null);
    Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    Posts.insert({ title: 'Post 2', url: 'http://blog2.com' });

    reactiveState.set('posts.isReady', true);
    reactiveState.set('posts.items', () => {
      return Posts.find();
    });
    Tracker.flush();

    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[0].url, 'http://blog.com');
    test.equal(posts[1].title, 'Post 2');
    test.equal(posts[1].url, 'http://blog2.com');
    test.equal(reactiveState.get('posts.isReady'), true);
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'ReactiveState -  Throws if the keyPath is undefined',
  function(test) {
    beforeEach();

    test.throws(reactiveState.set.bind(reactiveState), 'Invalid keypath');
  }
);


Tinytest.add(
  'ReactiveState -  Reactivity using nested objects.',
  function(test) {
    beforeEach();

    var flag = false;
    reactiveState.set('object', { a: 1, b: 1 });
    Tracker.autorun(function() { flag = reactiveState.get('object.b'); });
    test.equal(flag, 1);
    reactiveState.set('object', { a: 2, b: 2 });
    Tracker.flush();
    test.equal(flag, 2);
  }
);

Tinytest.add(
  'ReactiveState -  Object with array inside.',
  function(test) {
    beforeEach();

    reactiveState.set('object', { myArray: [] });
    test.equal(reactiveState.get('object.myArray'), []);

    reactiveState.set('object', { myArray: [] });
    test.equal(reactiveState.get('object'), { myArray: [] });
  }
);

Tinytest.add(
  'ReactiveState -  Should save a function returning null.',
  function(test) {
    beforeEach();

    reactiveState.set('a', function() {
      return null;
    });
    test.equal(reactiveState.get('a'), null);
  }
);

Tinytest.add(
  'ReactiveState -  Should get a paramter with state default.',
  function(test) {
    beforeEach();

    reactiveState.modify('a', function(state = 123) {
      return state;
    });
    test.equal(reactiveState.get('a'), 123);
  }
);

Tinytest.add(
  'ReactiveState -  Should get a paramter with old state value.',
  function(test) {
    beforeEach();

    var react = new ReactiveVar(false);

    reactiveState.modify('a', function(state = false) {
      if (react.get() === true)
        return true;
      else
        return state;
    });

    test.equal(reactiveState.get('a'), false); // return state (default = false)
    react.set(true);
    Tracker.flush();
    test.equal(reactiveState.get('a'), true); // return true
    react.set(false);
    Tracker.flush();
    test.equal(reactiveState.get('a'), true); // return state (previous state)
  }
);

Tinytest.add(
  'ReactiveState -  Should join a normal field with findOne.',
  function(test) {
    beforeEach();

    Posts = new Mongo.Collection(null);
    var id = Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    var react = new ReactiveVar('');

    reactiveState.modify('post.isReady', function(state = false) {
      if (react.get() === id)
        return true;
      else
        return state;
    });

    reactiveState.modify('post', function(state = {}) {
      return Posts.findOne(react.get());
    });

    test.equal(reactiveState.get('post.isReady'), false);
    test.equal(reactiveState.get('post.title'), undefined);

    react.set(id);
    Tracker.flush();

    test.equal(reactiveState.get('post.isReady'), true);
    test.equal(reactiveState.get('post.title'), 'Post 1');

  }
);

Tinytest.add(
  'ReactiveState -  Modify should throw if not function.',
  function(test) {
    beforeEach();

    test.throws(function() {
      reactiveState.modify('post.isReady', false);
    }, 'Invalid modifier function');
  }
);

Tinytest.add(
  'ReactiveState -  Should accept other not plain objects.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.prop = 'prop!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(reactiveState.get('instance').prop, 'prop!');
    test.equal(reactiveState.get('instance.prop'), 'prop!');
    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate),
      'prop!');
  }
);

Tinytest.add(
  'ReactiveState -  Should accept other not plain objects and mix them.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.prop = 'prop!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    reactiveState.modify('instance.otherProp', (state = 'other prop!') => {
      return state;
    });

    test.equal(reactiveState.get('instance').prop, 'prop!');
    test.equal(reactiveState.get('instance.prop'), 'prop!');
    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate),
      'prop!');

    test.equal(reactiveState.get('instance').otherProp, 'other prop!');
    test.equal(reactiveState.get('instance.otherProp'), 'other prop!');
    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate2),
      'other prop!');
  }
);

Tinytest.add(
  'ReactiveState -  Should allow functions inside not plain objects.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.prop = 'prop!';
    };
    SomeClass.prototype.greet = function() {
      return 'hi!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(reactiveState.get('instance').greet(), 'hi!');
    test.equal(reactiveState.get('instance.greet'), 'hi!');
    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate3),
      'hi!');
  }
);

Tinytest.add(
  'ReactiveState -  Should allow functions with params in not plain objects.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.prop = 'prop!';
    };
    SomeClass.prototype.greet = function(name) {
      return 'hi ' + name + '!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(reactiveState.get('instance').greet('john'), 'hi john!');
  }
);

Tinytest.add(
  'ReactiveState -  Should allow functions using this in not plain objects.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.name = 'john';
    };
    SomeClass.prototype.greet = function() {
      return 'hi ' + this.name + '!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(reactiveState.get('instance').greet(), 'hi john!');
    test.equal(reactiveState.get('instance.greet'), 'hi john!');
    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate3),
      'hi john!');
  }
);

// Won't fix for now, until we see if this is really important.
// Tinytest.add(
//   'ReactiveState -  Should stop a computation not used anymore.',
//   function(test) {
//     beforeEach();
//
//     var number = new ReactiveVar(0);
//     reactiveState.set('a', function() {
//       number.set(1);
//       return number.get();
//     });
//     number.set(2);
//     reactiveState.set('a', 2);
//     Tracker.flush();
//     test.equal(number.get(), 2);
//   }
// );
