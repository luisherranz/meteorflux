let beforeEach = () => {
  AppState = new MeteorFlux.AppState();
  Blaze._globalHelpers = [];
};


Tinytest.add('MeteorFlux - AppState - Test internal _checkKeyPath function',
  function (test) {
    beforeEach();

    test.throws(AppState._checkKeyPath, undefined);

    test.equal(
      AppState._checkKeyPath('a'),
      ['a']
    );

    test.equal(
      AppState._checkKeyPath('a.b.c'),
      ['a', 'b', 'c']
    );

    test.equal(
      AppState._checkKeyPath(['a', 'b' , 'c']),
      ['a', 'b', 'c']
    );
  }
);

Tinytest.add('MeteorFlux - AppState - Test internal _getValueInPath function',
  function (test) {
    beforeEach();

    AppState._obj = { a: { b: { c: 'c', d: 'd' } }, e: { f: 'f' } };

    test.equal(
      AppState._getValueInPath([]),
      { a: { b: { c: 'c', d: 'd' } }, e: { f: 'f' } }
    );

    test.equal(
      AppState._getValueInPath(['a']),
      { b: { c: 'c', d: 'd' } }
    );

    test.equal(
      AppState._getValueInPath(['a', 'b', 'c']),
      'c'
    );

    test.equal(
      AppState._getValueInPath(['a', 'b', 'x']),
      AppState._NOTSET
    );

    test.equal(
      AppState._getValueInPath(['e']),
      { f: 'f' }
    );

    AppState._obj = { a: { b: undefined } };
    test.equal(
      AppState._getValueInPath(['a', 'b']),
      undefined
    );

    AppState._obj = { a: { b: null } };
    test.equal(
      AppState._getValueInPath(['a', 'b']),
      null
    );

    AppState._obj = {};
    test.equal(
      AppState._getValueInPath(['a']),
      AppState._NOTSET
    );
  }
);

Tinytest.add('MeteorFlux - AppState - Test internal _addDep function',
  function (test) {
    beforeEach();

    AppState._obj = { a: 'a' };
    AppState._deps = { children: {}, dep: new Tracker.Dependency() };
    AppState._addDep(['a']);
    test.isTrue(Match.test(AppState._deps,
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

Tinytest.add('MeteorFlux - AppState - Test internal _createObjFromValue func',
  function (test) {
    beforeEach();

    test.equal(AppState._createObjFromValue(
      ['a'], 'aa'),
      { a: 'aa' }
    );

    test.equal(AppState._createObjFromValue(
      ['a', 'b', 'c'], 'cc'),
      { a: { b: { c: 'cc' }}}
    );

    test.equal(AppState._createObjFromValue(
      ['a', 'b', 'c'], { d: 'dd' }),
      { a: { b: { c: { d: 'dd' }}}}
    );
  }
);


Tinytest.add('MeteorFlux - AppState - Set string',
  function (test) {
    beforeEach();

    AppState.set('a', 'I am a string');
    test.equal(AppState._obj, { a: 'I am a string' });
  }
);

Tinytest.add('MeteorFlux - AppState - Set nested string with array',
  function (test) {
    beforeEach();

    AppState.set(['a', 'b'], 'I am a string');
    test.equal(AppState._obj, { a: { b: 'I am a string' } });
  }
);

Tinytest.add('MeteorFlux - AppState - Set nested string with string',
  function (test) {
    beforeEach();

    AppState.set('a.b', 'I am a string');
    test.equal(AppState._obj, { a: { b: 'I am a string' } });
  }
);

Tinytest.add('MeteorFlux - AppState - Set two nested strings',
  function (test) {
    beforeEach();

    AppState.set('a.b', 'I am a string');
    AppState.set('a.c', 'I am another string');
    test.equal(
      AppState._obj,
      { a: { b: 'I am a string', c: 'I am another string' } }
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - If the state is undefined it returns undefined.',

  function(test) {
    beforeEach();
    test.equal(AppState.get('undefined'), AppState._NOTSET);
    test.equal(Blaze.toHTML(Template.undefinedTemplate),
      'Variable is false.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - If the state is undefined it is still reactive.',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = AppState.get('string');
    });

    AppState.set('string', 'hi from reactivity!');
    Tracker.flush();

    test.equal(text, 'hi from reactivity!');
    test.equal(Blaze.toHTML(Template.stringTemplate),
      'hi from reactivity! inside a template.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - If state is undefined returns undef even if nested',

  function(test) {
    beforeEach();
    test.equal(AppState.get('nested.undefined'), undefined);
    test.equal(Blaze.toHTML(Template.nestedUndefinedTemplate),
      'Variable is false.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get strings',

  function(test) {
    beforeEach();
    AppState.set('string', 'I am a string');
    test.equal(AppState.get('string'), 'I am a string');
    test.equal(Blaze.toHTML(Template.stringTemplate),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get nested strings',

  function(test) {
    beforeEach();
    AppState.set('nested.string', 'I am a nested string');
    test.equal(AppState.get('nested.string'), 'I am a nested string');
    test.equal(Blaze.toHTML(Template.nestedStringTemplate),
      'I am a nested string inside a template.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get strings reactively',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = AppState.get('string');
    });
    test.equal(Blaze.toHTML(Template.stringTemplate), '');
    AppState.set('string', 'I am a string');
    Tracker.flush();
    test.equal(text, 'I am a string');
    test.equal(Blaze.toHTML(Template.stringTemplate),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get strings reactively only in template',

  function(test) {
    beforeEach();
    console.log('string: ', AppState.get('string2'));
    test.equal(Blaze.toHTML(Template.stringTemplate2), '');
    AppState.set('string2', 'I am a string');
    Tracker.flush();
    test.equal(Blaze.toHTML(Template.stringTemplate2),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get nested strings reactively',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = AppState.get('nested.string');
    });
    AppState.set('nested.string', 'I am a nested string');
    Tracker.flush();
    test.equal(text, 'I am a nested string');
    test.equal(Blaze.toHTML(Template.nestedStringTemplate),
      'I am a nested string inside a template.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get numbers',

  function(test) {
    beforeEach();
    AppState.set('number', 123);
    test.equal(AppState.get('number'), 123);
    test.equal(Blaze.toHTML(Template.numberTemplate),
      'This is 123.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get numbers reactively',

  function(test) {
    beforeEach();
    var number = '';
    Tracker.autorun(function(){
      number = AppState.get('number');
    });
    AppState.set('number', 123);
    Tracker.flush();
    test.equal(number, 123);
    test.equal(Blaze.toHTML(Template.numberTemplate),
      'This is 123.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get booleans',

  function(test) {
    beforeEach();
    AppState.set('boolean', true);
    test.equal(AppState.get('boolean'), true);
    test.equal(Blaze.toHTML(Template.booleanTemplate),
      'This is true.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get booleans reactively',

  function(test) {
    beforeEach();
    var boolean = '';
    Tracker.autorun(function(){
      boolean = AppState.get('boolean');
    });
    AppState.set('boolean', true);
    Tracker.flush();
    test.equal(boolean, true);
    test.equal(Blaze.toHTML(Template.booleanTemplate),
      'This is true.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get objects',

  function(test) {
    beforeEach();
    AppState.set('author', { name: 'John' });
    var author = AppState.get('author');
    test.equal(author.name, 'John');
    test.equal(AppState.get('author.name'), 'John');
    test.equal(Blaze.toHTML(Template.authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get objects in nested templates',

  function(test) {
    beforeEach();
    AppState.set('author', { name: 'John' });
    test.equal(Blaze.toHTML(Template.authorNestedTemplate),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get objects reactively',

  function(test) {
    beforeEach();
    var author, authorName;
    Tracker.autorun(function(){
      author = AppState.get('author');
    });
    Tracker.autorun(function(){
      authorName = AppState.get('author.name');
    });
    AppState.set('author', { name: 'John' });
    Tracker.flush();
    test.equal(author.name, 'John');
    test.equal(authorName, 'John');
    test.equal(Blaze.toHTML(Template.authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get functions',

  function(test) {
    beforeEach();
    AppState.set('author', function(){
      return { name: 'John' };
    });
    var author = AppState.get('author');
    test.equal(author.name, 'John');
    test.equal(AppState.get('author.name'), 'John');
    test.equal(Blaze.toHTML(Template.authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get functions reactively',

  function(test) {
    beforeEach();
    var author, name;
    Tracker.autorun(function(){
      author = AppState.get('author');
    });
    Tracker.autorun(function(){
      name = AppState.get('author.name');
    });
    AppState.set('author', function(){
      return { name: 'John' };
    });
    Tracker.flush();
    test.equal(author.name, 'John');
    test.equal(AppState.get('author.name'), 'John');
    test.equal(Blaze.toHTML(Template.authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get combined objects',

  function(test) {
    beforeEach();
    AppState.set('author', { name: 'John' });
    AppState.set('author', { age: 12 });
    var author = AppState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(AppState.get('author.name'), 'John');
    test.equal(AppState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get combined objects reactively',

  function(test) {
    beforeEach();
    var author, age, name;
    Tracker.autorun(function(){
      author = AppState.get('author');
    });
    Tracker.autorun(function(){
      name = AppState.get('author.name');
    });
    Tracker.autorun(function(){
      age = AppState.get('author.age');
    });
    AppState.set('author', { name: 'John' });
    AppState.set('author', { age: 12 });
    Tracker.flush();
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(name, 'John');
    test.equal(age, 12);
    test.equal(AppState.get('author.name'), 'John');
    test.equal(AppState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get combined objects and data',

  function(test) {
    beforeEach();
    AppState.set('author', { name: 'John' });
    AppState.set('author.age', 12);
    var author = AppState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(AppState.get('author.name'), 'John');
    test.equal(AppState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get combined functions',

  function(test) {
    beforeEach();
    AppState.set('author', function(){
      return { name: 'John' };
    });
    AppState.set('author', function(){
      return { age: 12 };
    });
    var author = AppState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(AppState.get('author.name'), 'John');
    test.equal(AppState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get combined functions with data',

  function(test) {
    beforeEach();
    AppState.set('author', function(){
      return { name: 'John' };
    });
    AppState.set('author.age', 12);
    var author = AppState.get('author');
    test.equal(author.name, 'John');
    test.equal(author.age, 12);
    test.equal(AppState.get('author.name'), 'John');
    test.equal(AppState.get('author.age'), 12);
    test.equal(Blaze.toHTML(Template.authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);


Tinytest.add(
  'MeteorFlux - AppState - Set and get deep functions',

  function(test) {
    beforeEach();
    AppState.set('post.author', function(){
      return { name: 'John' };
    });
    var post = AppState.get('post');
    test.equal(post.author.name, 'John');
    test.equal(AppState.get('post.author.name'), 'John');
    test.equal(Blaze.toHTML(Template.authorTemplate5),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate6),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get deep combined functions',

  function(test) {
    beforeEach();
    AppState.set('post', function(){
      return { author: { name: 'John' } };
    });
    AppState.set('post.author', function(){
      return { age: 12 };
    });
    var post = AppState.get('post');
    test.equal(post.author.name, 'John');
    test.equal(post.author.age, 12);
    test.equal(AppState.get('post.author.name'), 'John');
    test.equal(AppState.get('post.author.age'), 12 );
    test.equal(Blaze.toHTML(Template.authorTemplate7),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.authorTemplate8),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set and get arrays',

  function(test) {
    beforeEach();
    AppState.set('posts', [ { title: 'Post 1'}, { title: 'Post 2'} ]);
    var posts = AppState.get('posts');
    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[1].title, 'Post 2');
    test.equal(Blaze.toHTML(Template.postTemplate1),
      'Post title is Post 1. Post title is Post 2. '
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set different fields on objects',

  function(test) {
    beforeEach();
    AppState.set('post', {
      title: 'Post 1',
      url: 'http://blog.com'
    });
    AppState.set('post.isReady', true);
    var post = AppState.get('post');
    test.equal(post.title, 'Post 1');
    test.equal(post.url, 'http://blog.com');
    test.equal(post.isReady, true);
    test.equal(Blaze.toHTML(Template.postTemplate2),
      'Post title is Post 1 and url is http://blog.com.'
    );
    test.equal(Blaze.toHTML(Template.postTemplate3),
      'Post title is Post 1 and url is http://blog.com.'
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set different fields on cursors',

  function(test) {
    beforeEach();

    Posts = new Mongo.Collection(null);
    Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    Posts.insert({ title: 'Post 2', url: 'http://blog2.com' });

    AppState.set('posts', () => {
      return Posts.find();
    });
    AppState.set('posts.isReady', true);

    var posts = AppState.get('posts');
    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[0].url, 'http://blog.com');
    test.equal(posts[1].title, 'Post 2');
    test.equal(posts[1].url, 'http://blog2.com');
    test.equal(AppState.get('posts.isReady'), true);
    test.equal(Blaze.toHTML(Template.postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set different fields on cursors reactively',

  function(test) {
    beforeEach();

    var posts;
    Tracker.autorun(() => {
      posts = AppState.get('posts');
    });

    Posts = new Mongo.Collection(null);
    Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    Posts.insert({ title: 'Post 2', url: 'http://blog2.com' });

    AppState.set('posts', () => {
      return Posts.find();
    });
    AppState.set('posts.isReady', true);
    Tracker.flush();

    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[0].url, 'http://blog.com');
    test.equal(posts[1].title, 'Post 2');
    test.equal(posts[1].url, 'http://blog2.com');
    test.equal(AppState.get('posts.isReady'), true);
    test.equal(Blaze.toHTML(Template.postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState - Set different fields on cursors reactively in ' +
  'inverse order',

  function(test) {
    beforeEach();

    var posts;
    Tracker.autorun(() => {
      posts = AppState.get('posts');
    });

    Posts = new Mongo.Collection(null);
    Posts.insert({ title: 'Post 1', url: 'http://blog.com' });
    Posts.insert({ title: 'Post 2', url: 'http://blog2.com' });

    AppState.set('posts.isReady', true);
    AppState.set('posts', () => {
      return Posts.find();
    });
    Tracker.flush();

    test.equal(posts[0].title, 'Post 1');
    test.equal(posts[0].url, 'http://blog.com');
    test.equal(posts[1].title, 'Post 2');
    test.equal(posts[1].url, 'http://blog2.com');
    test.equal(AppState.get('posts.isReady'), true);
    test.equal(Blaze.toHTML(Template.postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'MeteorFlux - AppState -  Throws if the keyPath is undefined',
  function(test) {
    beforeEach();

    test.throws(AppState.set.bind(AppState), 'Invalid keypath');
  }
);
