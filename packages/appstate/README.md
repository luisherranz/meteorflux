# MeteorFlux - AppState

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

**This package is currently under development. Please open issues if you find bugs, want to discuss the principles or want to suggest new features.**

## What is it?

**AppState** is a reactive object tree for Meteor to create "Redux-like" apps.

The concept behind it is to have all the state of your app in a single place, accessible from any part of your app or your templates.

That state can only be changed when a Flux action is dispatched, with a few exceptions, yet to be defined.

It is integrated with the [MeteorFlux Dispatcher](https://github.com/worona/meteorflux/tree/devel/packages/dispatcher) and should be used in conjunction with it.

## What is Redux?

Redux is a new way to reason about a Flux app. It simplifies the **State** and **Stores** concepts, merging them together.

In a Redux app, you don't deal with **Stores**, you deal with **State**. Each time a new Flux action is dispatched, the **State** of you app changes, depending on what happened.

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
      state = 'I am another string';
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

You can get other state inside modify and it will be smart enough to execute first the others. In this case for example, it will execute first `'user'` and then `'user.fullName'` even though `'user.fullName'` was defined first.

```javascript
AppState.modify('user.fullName', function(action, state = false) {
  let user = AppState.get('user'); // this will go and execute all the 'user' modifies first.
  if (user)
    return user.firstName + ' ' + user.lastName;
  else
    return state;
});

AppState.modify('user', function(action, state = {}) {
  if (action.type === 'USER_SUBSCRIPTION_READY')
    return Meteor.user.findOne();
  else
    return state;
});
```

You can save complex objects.

```javascript
// save complex objects
AppState.modify('videoAuthor', function(action, state = {}){
  return {
    name: 'Peter'
    image: {
      url: 'http://www.yourserver.com/images/peter.jpg',
      width: 300,
      height: 200
    }
  };
});
```


Mix them with other objects.

```javascript
AppState.modify('videoAuthor', function(action, state = {}){
  return { publishedVideos: 12 };
});
// or
AppState.modify('videoAuthor.publishedVideos', (action, state = 0) => {
  return 12;
});
// and so on...
```



If the state changes, only the minimum amount of invalidations will occur. For example:

```javascript
AppState.modify('videoAuthor', (action, state) => {
  return {
    image: {
      url: 'http://www.yourserver.com/images/peter2.jpg'
    }
  };
});
// or the equivalent...
AppState.modify('videoAuthor.image.url', (action, state)  => {
  return 'http://www.yourserver.com/images/peter2.jpg');
}
```

won't invalidate things like `videoAuthor.name` or `videoAuthor.image.width`.

Please note that these last examples are quite simplified to show you the things you can return. In your real world, you will want to return different things depending on different actions with conditionals like `switch` or `if`.

#### Always return state!

You should always `return state` if the action dispatched has nothing to do with your state. For example:

```javascript
AppState.modify('isVideoPlaying', function(action, state = false){
  if (action.type === 'PLAY_VIDEO')
    return true;
  else if (action.type === 'STOP_VIDEO')
    return false;
});
```
will `return undefined` if an action different than `'PLAY_VIDEO'` or `'STOP_VIDEO'`. This is because Javascript returns undefined if the function doesn't return.

To solve this, return `state` if the action has nothing to do with your state:

```javascript
AppState.modify('isVideoPlaying', function(action, state = false){
  if (action.type === 'PLAY_VIDEO')
    return true;
  else if (action.type === 'STOP_VIDEO')
    return false;
  else
    return state;
});
```

Most of the time, you will be using switches (like Flux Stores or Redux) so just remember to return state on default:
```javascript
AppState.modify('isVideoPlaying', function(action, state = false){
  switch (action.type) {
    case 'PLAY_VIDEO':
      return true;
    case 'STOP_VIDEO':
      return false;
    default:
      return state;    
  }
});
```

#### AppState.get(path)

AppState is reactive and smart enough to mix everything together and invalidate only what has changed, even with objects, arrays, MiniMongo cursors, or functions returning objects, arrays and MiniMongo cursors.

You can retrieve any value using `AppState.get`.

```javascript
AppState.get('videoList.items');
// => [{ id: 1, title: 'Video1' }, { id: 2, title: 'Video 2' }];

AppState.get('videoList.isReady'); // => true or false  

AppState.get('videoAuthor'); // => { name: 'Peter', image: { url... }, publishedVideos: 12 }

AppState.get('videoAuthor.image.width') // => 300
```


#### Blaze Global Helpers

You can retrieve any value from any Blaze template as well. You don't need to define them and they are available in any of your templates.

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

If you keep all your state in **AppState**, you shouldn't need any Template helper at all. Or at least, in most of the cases. This avoids having to write things like these helpers

```javascript
Template.videoItem.helpers({
  isVideoPlaying: function(){
    return Session.get('isVideoPlaying');
  }
});
```
over and over again.

## ReactiveState

AppState is using MeteorFlux's [ReactiveState](https://github.com/worona/meteorflux/tree/devel/packages/reactive-state) in the background, so you may want to take a look at it if you want to use something similar but you don't like the Redux approach.

## Possible improvements

This are some ideas to improve **AppState**. PRs are welcomed.

* [ ] **Hooks:** to modify state before and after set/get. Probably implemented in ReactiveState first.
* [ ] **Hot Code push:** survive to hot code pushes.
* [ ] **Store offline:** so the next time the user comes back to your app everything is exactly as it was.
* [ ] **Store in the url:** some of the values only. Good if the users shares the url with somebody and your app should now some of the user state.
* [ ] **Time Machine:** undo/redo changes in development. Probably using [Constellation](https://atmospherejs.com/babrahams/constellation) or [MeteorToys/ToyKit](https://github.com/MeteorToys/ToyKit) for the UI. Pretty much like the Time Machine of Redux.
* [ ] **React support:** more than react support, maybe get rid of Blaze helpers if the app doesn't use Blaze.

Ideas welcomed as well. Open issues to discuss. ;)

## License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
