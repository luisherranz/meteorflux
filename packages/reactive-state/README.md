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
var state = new ReactiveState();
```


#### state.set(path, value)

You can set and get pretty much anything and it is smart enough to mix everything together and invalidate only what has changed, even with objects, arrays, MiniMongo cursors, or functions returning objects, arrays and MiniMongo cursors.

You can do stuff like this:

```javascript
// save plain state, which will become reactive automatically
state.set('isVideoPlaying', false);

// save some state from the database
state.set('videoList.items', function() {
  return Videos.find({});
});

// mix new nested state with already defined states
state.set('videoList.isReady', false);
Meteor.subscribe('videos', function(err){
  if (!err) {
    state.set('videoList.isReady', true);
  }
});
// or using a reactive function
var handle = Meteor.subscribe('videos');
state.set('videoList.isReady', function(){
  return !handle.ready();
});

// save complex objects
state.set('videoAuthor', {
  name: 'Peter'
  image: {
    url: 'http://www.yourserver.com/images/peter.jpg',
    width: 300,
    height: 200
  }
});

// mix it with other objects
state.set('videoAuthor', {
  publishedVideos: 12
}
// or
state.set('videoAuthor.publishedVideos', 12);

// and so on...
```

If the state changes, only the minimum amount of invalidations will occur. For example:

```javascript
state.set('videoAuthor', {
  image: {
    url: 'http://www.yourserver.com/images/peter2.jpg'
  }
});
// or the equivalent...
state.set('videoAuthor.image.url', 'http://www.yourserver.com/images/peter2.jpg');
```

It won't invalidate things like `videoAuthor.name` or `videoAuthor.image.width`.

#### state.get(path)

You can retrieve any value using `state.get`.

```javascript
state.get('videoList.items');
// => [{ id: 1, title: 'Video1' }, { id: 2, title: 'Video 2' }];

state.get('videoList.isReady'); // => true or false  

state.get('videoAuthor'); // => { name: 'Peter', image: { url... }, publishedVideos: 12 }

state.get('videoAuthor.image.width') // => 300
```

#### Blaze Global Helpers

You can retrieve any value from any Blaze template.

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
var state1 = new ReactiveState();
var state2 = new ReactiveState();

state1.set('something', 1);
state2.set('something', 2);
```

```html
<span>{{something}}</span>
```
The value `something` in Blaze will get the value added in the last place, in this case, `2`.

You can namespace ReactiveStates like this:
```javascript
var state1 = new ReactiveState();
var state2 = new ReactiveState();

state1.set('state1.something', 1);
state2.set('state2.something', 2);
```

```html
<span>{{state1.something}}</span>
<span>{{state2.something}}</span>
```

## Isn't this like Session?

No, it's not. Session was not designed for this purpose. If you store complex objects in it, it will erase the previous object (instead of merging it) and it will invalidate everything and cause a lot of re-renders. Besides, you can't store functions or Mongo cursors.

## Possible improvements

This are some ideas to improve **AppState**. PRs are welcomed.

* [ ] **Hot Code push:** survive to hot code pushes.
* [ ] **Store offline:** so the next time the user comes back to your app everything is exactly as it was.
* [ ] **Store in the url:** some of the values only. Good if the users shares the url with somebody and your app should now some of the user state.
* [ ] **Time Machine:** undo/redo changes in development. Probably using [Constellation](https://atmospherejs.com/babrahams/constellation) for the UI. Pretty much like the Time Machine of Redux.
* [ ] **React support:** more than react support, maybe get rid of Blaze helpers if the app doesn't use Blaze.

Ideas welcomed as well. Open issues to discuss. ;)

## License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
