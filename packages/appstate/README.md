# MeteorFlux - AppState

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

**This package is currently under development. Please open issues if you find bugs, want to discuss the principles or want to suggest new features.**

## What is it?

**AppState** is a reactive object tree for Meteor to create "Redux-like" apps.

The concept behind it is to have all the state of your app in a single place, accessible from any part of your app and directly from your templates.

That state, can only be changed when a Flux action is dispatched, with a few exceptions.

It is integrated with the [MeteorFlux Dispatcher](https://github.com/worona/meteorflux/tree/devel/packages/dispatcher) and should be used in conjunction with it.

## What is Redux?

Redux is a new way to think about a Flux app which simplify some of the concepts.

In a Redux app, you don't deal with **Stores**, you deal with **State**. Each time a new Flux action is dispatched, the **State** of you app may change, depending on what happened.

More info can be found in its documentation:
http://rackt.org/redux/

## Current API

First add it to your Meteor project:

```
$ meteor add meteorflux:appstate
```

This package and API is currently under development but if you want to use it these are a few examples of what is capable of. Better documentation will come in the future.

#### AppState.modify(path, function(action, state = default) {...} );


Whenever you want to change the **State** of your app, you can use this syntax:

```javascript
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
```

The state `string` will change when those actions are dispatched:

```javascript
Dispatcher.dispatch('SOMETHING_HAPPENED');
// => AppState.get('string') and {{string}} will be invalidated with
//    the new 'I am string' value.
```

Inside **AppState** you can store pretty much anything:

```javascript
// save plain state, which will become reactive automatically
AppState.modify('isVideoPlaying', function(action, state = false){
  if (action.type === 'PLAY_VIDEO')
    return true;
  else if (action.type === 'STOP_VIDEO')
    return false;
  else
    return state;
});
```

You can then use it reactively in Blaze:
```html
{{#if isVideoPlaying}}
  <span>Video is playing!</span>
{{/if}}
```
or reactively in your template helpers:
```javascript
Template.video.helpers({
  playerClass: function() {
    if (AppState.get('isVideoPlaying')) {
      return 'play';
    } else {
      return 'stop';
    }
  }
});
```

You don't need to use switch. It works with any logic:


```javascript
// save some state from the database
Meteor.subscribe('videos', () => Dispatcher.dispatch('VIDEO_SUBSCRIPTION_READY'));
AppState.modify('videoList.items', function(action, state = []) {
  if (action.type === 'VIDEO_SUBSCRIPTION_READY')
    return Videos.find({});
  else
    return state;
});
```

You can get other state inside modify and it will be smart enough to execute first the other modifies.

```javascript
// mix new nested state with already defined states
AppState.modify('user', function(action, state = {}) {
  if (action.type === 'USER_SUBSCRIPTION_READY')
    return Meteor.user.findOne();
  else
    return state;
});
AppState.modify('user.fullName', function(action, state = false) {
  let user = AppState.get('user');
  if (user)
    return user.firstName + ' ' + user.lastName;
  else
    return state;
});
```



```javascript
// save complex objects
AppState.set('videoAuthor', {
  name: 'Peter'
  image: {
    url: 'http://www.yourserver.com/images/peter.jpg',
    width: 300,
    height: 200
  }
});

// mix it with other objects
AppState.set('videoAuthor', {
  publishedVideos: 12
}
// or
AppState.set('videoAuthor.publishedVideos', 12);

// and so on...
```

If the state changes, only the minimum amount of invalidations will occur. For example:

```javascript
AppState.set('videoAuthor', {
  image: {
    url: 'http://www.yourserver.com/images/peter2.jpg'
  }
});
// or the equivalent...
AppState.set('videoAuthor.image.url', 'http://www.yourserver.com/images/peter2.jpg');
```

**AppState** is reactive, but you shouldn't rely on

You should always return state if the action dispatched has nothing to do with your state.

For example:
```javascript
AppState.modify('isVideoPlaying', function(action, state = false){
  if (action.type === 'PLAY_VIDEO')
    return true;
  else if (action.type === 'STOP_VIDEO')
    return false;
});
```
this will return undefined if an action different than 'PLAY_VIDEO' or

You have access to that state with Blaze helpers and `AppState.get` as usual.


#### AppState.get(path)

You can set and get pretty much anything and it is smart enough to mix everything together and invalidate only what has changed, even with objects, arrays, MiniMongo cursors, or functions returning objects, arrays and MiniMongo cursors.

You can do stuff like this:



It won't invalidate things like `videoAuthor.name` or `videoAuthor.image.width`.

#### AppState.get(path)

You can retrieve any value using `AppState.get`.

```javascript
AppState.get('videoList.items');
// => [{ id: 1, title: 'Video1' }, { id: 2, title: 'Video 2' }];

AppState.get('videoList.isReady'); // => true or false  

AppState.get('videoAuthor'); // => { name: 'Peter', image: { url... }, publishedVideos: 12 }

AppState.get('videoAuthor.image.width') // => 300
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
## Isn't this like Session?

No, it's not. Session was not designed for this purpose. If you store complex objects in it, it will erase the previous object (instead of merging it) and it will invalidate everything and cause a lot of re-renders. Besides, you can't store functions or Mongo cursors.

## Possible improvements

This are some ideas to improve **AppState**. PRs are welcomed.

* [x] **Redux-style:** restrict changes to Flux action like Redux does.
* [ ] **Hooks:** to modify state before and after set/get.
* [ ] **Hot Code push:** survive to hot code pushes.
* [ ] **Store offline:** so the next time the user comes back to your app everything is exactly as it was.
* [ ] **Store in the url:** some of the values only. Good if the users shares the url with somebody and your app should now some of the user state.
* [ ] **Time Machine:** undo/redo changes in development. Probably using [Constellation](https://atmospherejs.com/babrahams/constellation) for the UI. Pretty much like the Time Machine of Redux.
* [ ] **React support:** more than react support, maybe get rid of Blaze helpers if the app doesn't use Blaze.

Ideas welcomed as well. Open issues to discuss. ;)

## License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
