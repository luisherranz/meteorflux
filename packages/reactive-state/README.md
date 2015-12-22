# MeteorFlux - ReactiveState

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

**This package is currently under development. Please open issues if you find bugs, want to discuss the principles or want to suggest new features.**

## What is it?

**ReactiveState** is a reactive object tree to save complex state in Meteor. It also exposes that state to Blaze.

## Installation

Just add it to your Meteor project using:

```
$ meteor add meteorflux:reactive-state
```

## Current API

This package and API is currently under development. These are a few examples of what is capable of. Better documentation will come in the future.

### Create a new instance

`ReactiveState` works like `ReactiveVar` or `ReactiveDict`. You first have to create a new instance:

```javascript
State = new ReactiveState();
```


#### State.set(path, value)

You can set and get pretty much anything and it is smart enough to mix everything together and invalidate only what has changed, even with objects, arrays, MiniMongo cursors, or functions returning objects, arrays and MiniMongo cursors.

You can do stuff like this:

```javascript
// save plain state, which will become reactive automatically
State.set('isVideoPlaying', false);

// save some state from the database
State.set('videoList.items', function() {
  return Videos.find({});
});

// mix new nested state with already defined states
State.set('videoList.isReady', false);
Meteor.subscribe('videos', function(err){
  if (!err) {
    State.set('videoList.isReady', true);
  }
});
// or using a reactive function
var handle = Meteor.subscribe('videos');
State.set('videoList.isReady', function(){
  return !handle.ready();
});

// save complex objects
State.set('videoAuthor', {
  name: 'Peter'
  image: {
    url: 'http://www.yourserver.com/images/peter.jpg',
    width: 300,
    height: 200
  }
});

// mix it with other objects
State.set('videoAuthor', {
  publishedVideos: 12
}
// or
State.set('videoAuthor.publishedVideos', 12);

// and so on...
```

If the state changes, only the minimum amount of invalidations will occur. For example:

```javascript
State.set('videoAuthor', {
  image: {
    url: 'http://www.yourserver.com/images/peter2.jpg'
  }
});
// or the equivalent...
State.set('videoAuthor.image.url', 'http://www.yourserver.com/images/peter2.jpg');
```

It won't invalidate things like `videoAuthor.name` or `videoAuthor.image.width`.

#### State.modify(path, modifier)

With `State.modify`, you can pass a modifier function which receives the old value as parameter and has to return the new value:

```javascript
State.modify('something', function(state = '') {
  var postId = FlowRouter.getParam(postId);
  if (postId)
    return postId;
  else
    return state; // don't change the state, return the same
});
```

This function is reactive. You can make state dependent on other state:

```javascript
State.modify('post.isPublished', function(state = false) {
  var selectedPost = State.get('selectedPost');
  var post = Posts.findOne(selectedPost);
  if ((!!post) && (post.published === true))
    return true;
  else
    return false;
});
```

Whenever you change `selectedPost`, `post.isPublished` will change as well.

You can use other classes:

```javascript
State.modify('user', function(state = {}) {
  let user = new User();
  user.name = 'john';
  return user;
});
```

#### State.get(path)

You can retrieve any value using `State.get`.

```javascript
State.get('videoList.items');
// => [{ id: 1, title: 'Video1' }, { id: 2, title: 'Video 2' }];

State.get('videoList.isReady'); // => true or false  

State.get('videoAuthor'); // => { name: 'Peter', image: { url... }, publishedVideos: 12 }

State.get('videoAuthor.image.width') // => 300

State.get('user.greet') // => hi john!
```

#### Blaze Global Helpers

If you want to use the global helpers you can add this hook to your ReactiveState instances:


```javascript
State = new ReactiveState();
State.afterChange((keyPath) => {
  Template.registerHelper(keyPath[0], () => {
    return this.get.bind(this, keyPath[0]);
  });
});
```

Then you can retrieve any value from any Blaze template.

```html
<template name='VideoPlayerList'>
  {{#if videoList.isReady}}
    {{#each videoList.items}}
      {{> VideoPlayer}}
    {{/each}}
  {{/if}}
</template>

<template name='VideoAuthor'>
  Author name is {{videoAuthor.name}} and has published {{videoAuthor.publishedVideos}} videos.
</template>

<!-- or... -->

<template name='VideoAuthor'>
  {{#with videoAuthor}}
    Author name is {{name}} and has published {{publishedVideos}} videos.
  {{/with}}
</template>
```

Be aware that if you create different ReactiveState objects, you have to namespace them or they will collide in Blaze. For example:

```javascript
state1.set('something', 1);
state2.set('something', 2);
```

```html
<span>{{something}}</span>
```
The value `something` in Blaze will get the value added in the last place, in this case, `2`.

You can namespace ReactiveStates like this:
```javascript
state1.set('state1.something', 1);
state2.set('state2.something', 2);
```

```html
<span>{{state1.something}}</span>
<span>{{state2.something}}</span>
```

## beforeChange and afterChange hooks

You can use `State.beforeChange(func)` and `State.afterChange(func)` to add callbacks when something is changed in State. The callback has two parameters, a keyPath (in array format) and the new value.

```javascript
State.beforeChange((keyPath, newValue) => {
  if (keyPath[0].startsWith('int'))
    return parseInt(newValue);
});

State.afterChange((keyPath, newValue) => {
  console.log(keyPath.join(', ') + ' has changed to ', newValue);
});
```

## Isn't this like Session?

No, it's not. Session was not designed for this purpose. If you store complex objects in it, it will erase the previous object (instead of merging it) and it will invalidate everything and cause a lot of re-renders. Besides, you can't store functions or Mongo cursors.

## Possible improvements

This are some ideas to improve **ReactiveState**. PRs are welcomed.

* [ ] **Hot Code push:** survive to hot code pushes.
* [ ] **Store offline:** so the next time the user comes back to your app everything is exactly as it was.
* [ ] **Store in the url:** some of the values only. Good if the users shares the url with somebody and your app should now some of the user state.
* [ ] **Time Machine:** undo/redo changes in development. Probably using [Constellation](https://atmospherejs.com/babrahams/constellation) for the UI. Pretty much like the Time Machine of Redux.
* [x] Get rid of Blaze helpers if the app doesn't use Blaze.

Ideas welcomed as well. Open issues to discuss. ;)

## Changelog

### 1.4.0:

- Remove Blaze dependency and add hooks.

### 1.3.7:

- Make Blaze a weak dependency.

### 1.3.5:

- Solved some bugs retrieving complex values with non-plain objects.

### 1.3.4:

- Allowing non-plain objects and storing them as they are, without messing with their functions. Then, doing some logic on retrieval.

### 1.3.3:

- Another approach to support non-plain objects.

### 1.3.2:

- Fix problem with object.hasOwnProperties. Now using the better `_.allKeys()`;

### 1.3.0:

- More improvements on non-plain-objects. Now it works with things like Astronomy and you can even use functions from Blaze.

### 1.2.1:

- Allow non-plain-objects to be used stored as well.

### 1.2.0:

- Add `State.modify()` for Redux-style apps.

### 1.1.2:

- Solve bug with functions returning undefined.

### 1.1.1:

- Update README.

### 1.1.0:

- `State.set` now has a state parameter.

### 1.0.1:

- `_keyPathToString` now accepts strings.

### 1.0.0:

- First version

## License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
