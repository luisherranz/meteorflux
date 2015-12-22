/* jshint -W106 */
var reactiveState;
var beforeEach = () => {
  reactiveState = new ReactiveState();
  reactiveState.afterChange(MeteorFlux.registerHelper.bind(reactiveState));
  Blaze._globalHelpers = [];
};



Tinytest.add(
  'Blaze Utils - If the state is undefined it returns undefined.',

  function(test) {
    beforeEach();
    test.equal(Blaze.toHTML(Template.reactiveState_undefinedTemplate),
      'Variable is false.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - If the state is undefined it is still reactive.',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = reactiveState.get('string');
    });

    reactiveState.set('string', 'hi from reactivity!');
    Tracker.flush();

    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate),
      'hi from reactivity! inside a template.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - If state is undefined returns undef even if nested',

  function(test) {
    beforeEach();
    test.equal(Blaze.toHTML(Template.reactiveState_nestedUndefinedTemplate),
      'Variable is false.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get strings',

  function(test) {
    beforeEach();
    reactiveState.set('string', 'I am a string');
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get nested strings',

  function(test) {
    beforeEach();
    reactiveState.set('nested.string', 'I am a nested string');
    test.equal(Blaze.toHTML(Template.reactiveState_nestedStringTemplate),
      'I am a nested string inside a template.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get strings reactively',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = reactiveState.get('string');
    });
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate), '');
    reactiveState.set('string', 'I am a string');
    Tracker.flush();
    test.equal(Blaze.toHTML(Template.reactiveState_stringTemplate),
      'I am a string inside a template.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get strings reactively only in template',

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
  'Blaze Utils - Set and get nested strings reactively',

  function(test) {
    beforeEach();
    var text = '';
    Tracker.autorun(function(){
      text = reactiveState.get('nested.string');
    });
    reactiveState.set('nested.string', 'I am a nested string');
    Tracker.flush();
    test.equal(Blaze.toHTML(Template.reactiveState_nestedStringTemplate),
      'I am a nested string inside a template.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get numbers',

  function(test) {
    beforeEach();
    reactiveState.set('number', 123);
    test.equal(Blaze.toHTML(Template.reactiveState_numberTemplate),
      'This is 123.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get numbers reactively',

  function(test) {
    beforeEach();
    var number = '';
    Tracker.autorun(function(){
      number = reactiveState.get('number');
    });
    reactiveState.set('number', 123);
    Tracker.flush();
    test.equal(Blaze.toHTML(Template.reactiveState_numberTemplate),
      'This is 123.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get booleans',

  function(test) {
    beforeEach();
    reactiveState.set('boolean', true);
    test.equal(Blaze.toHTML(Template.reactiveState_booleanTemplate),
      'This is true.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get booleans reactively',

  function(test) {
    beforeEach();
    var boolean = '';
    Tracker.autorun(function(){
      boolean = reactiveState.get('boolean');
    });
    reactiveState.set('boolean', true);
    Tracker.flush();
    test.equal(Blaze.toHTML(Template.reactiveState_booleanTemplate),
      'This is true.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get objects',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    var author = reactiveState.get('author');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get objects in nested templates',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    test.equal(Blaze.toHTML(Template.reactiveState_authorNestedTemplate),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get objects reactively',

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
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get functions',

  function(test) {
    beforeEach();
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    var author = reactiveState.get('author');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get functions reactively',

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
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate2),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get combined objects',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    reactiveState.set('author', { age: 12 });
    var author = reactiveState.get('author');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get combined objects reactively',

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
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get combined objects and data',

  function(test) {
    beforeEach();
    reactiveState.set('author', { name: 'John' });
    reactiveState.set('author.age', 12);
    var author = reactiveState.get('author');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get combined functions',

  function(test) {
    beforeEach();
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    reactiveState.set('author', function(){
      return { age: 12 };
    });
    var author = reactiveState.get('author');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get combined functions with data',

  function(test) {
    beforeEach();
    reactiveState.set('author', function(){
      return { name: 'John' };
    });
    reactiveState.set('author.age', 12);
    var author = reactiveState.get('author');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate3),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate4),
      'His name is John and his age is 12.'
    );
  }
);


Tinytest.add(
  'Blaze Utils - Set and get deep functions',

  function(test) {
    beforeEach();
    reactiveState.set('post.author', function(){
      return { name: 'John' };
    });
    var post = reactiveState.get('post');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate5),
      'His name is John.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate6),
      'His name is John.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get deep combined functions',

  function(test) {
    beforeEach();
    reactiveState.set('post', function(){
      return { author: { name: 'John' } };
    });
    reactiveState.set('post.author', function(){
      return { age: 12 };
    });
    var post = reactiveState.get('post');
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate7),
      'His name is John and his age is 12.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_authorTemplate8),
      'His name is John and his age is 12.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set and get arrays',

  function(test) {
    beforeEach();
    reactiveState.set('posts', [ { title: 'Post 1'}, { title: 'Post 2'} ]);
    var posts = reactiveState.get('posts');
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate1),
      'Post title is Post 1. Post title is Post 2. '
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set different fields on objects',

  function(test) {
    beforeEach();
    reactiveState.set('post', {
      title: 'Post 1',
      url: 'http://blog.com'
    });
    reactiveState.set('post.isReady', true);
    var post = reactiveState.get('post');
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate2),
      'Post title is Post 1 and url is http://blog.com.'
    );
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate3),
      'Post title is Post 1 and url is http://blog.com.'
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set different fields on cursors',

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
    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set different fields on cursors reactively',

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

    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'Blaze Utils - Set different fields on cursors reactively in ' +
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

    test.equal(Blaze.toHTML(Template.reactiveState_postTemplate4),
      'Post title is Post 1 and url is http://blog.com. ' +
      'Post title is Post 2 and url is http://blog2.com. '
    );
  }
);

Tinytest.add(
  'Blaze Utils -  Should accept other not plain objects.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.prop = 'prop!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate),
      'prop!');
  }
);

Tinytest.add(
  'Blaze Utils -  Should allow functions inside not plain objects.',
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

    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate3),
      'hi!');
  }
);

Tinytest.add(
  'Blaze Utils -  Should allow functions using this in not plain objects.',
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

    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate3),
      'hi john!');
  }
);

Tinytest.add(
  'Blaze Utils -  Should allow classes with several levels.',
  function(test) {
    beforeEach();

    var InternaClass = function(name) {
      this.name = name;
    };
    InternaClass.prototype.greet = function() {
      return 'hi ' + this.name + '!';
    };

    var SomeClass = function() {
      this.props = {
        name: 'john',
        wife: new InternaClass('marie')
      };
    };
    SomeClass.prototype.greet = function() {
      return 'hi ' + this.props.name + '!';
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate5),
      'john and marie');
    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate6),
      'hi john! and hi marie!');
  }
);

Tinytest.add(
  'Blaze Utils -  Should allow functions with args in templates.',
  function(test) {
    beforeEach();

    var SomeClass = function() {
      this.greeting = 'hi';
    };
    SomeClass.prototype.greet = function(name) {
      return (this.greeting + ' ' + name + '!');
    };

    reactiveState.modify('instance', (state = new SomeClass()) => {
      return state;
    });

    test.equal(Blaze.toHTML(Template.reactiveState_instanceTemplate4),
      'hi john!');
  }
);
