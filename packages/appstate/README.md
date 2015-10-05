# MeteorFlux AppState

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

**This package is currently under development. Please open issues if you find bugs, want to discuss the principles or want to suggest new features.**

## What is it?

**AppState** is a reactive object tree for Meteor.

The concept behind it is to have all the state of your app in a single place, accesible from any part of your app and directly from your templates.

## Current API

First add it to your Meteor project:

```
$ meteor add meteorflux:appstate
```

This package and API is currently under development but if you want to use it this are a few examples of what is capable of. Better documentation will come in the future.

#### AppState.set(path, value)

You can set and get pretty much anything and it is smart enough to mix everything together and invalidate only what has changed, even with objects, arrays, MiniMongo cursors, or functions returning objects, arrays and MiniMongo cursors.

You can do stuff like this:

```javascript
// save plain state, which will become reactive automatically
AppState.set('isVideoPlaying', false);

// save some state from the database
AppState.set('videoList', function() {
  return Videos.find({});
});

// mix new nested state with already defined states
AppState.set('videoList.isReady', false);
Meteor.subscribe('videos', function(err){
  if (!err) {
    AppState.set('videoList.isReady', true);
  }
});

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

It won't invalidate things like `videoAuthor.name` or `videoAuthor.image.width`.

#### AppState.get(path)

You can retrieve any value using `AppState.get`.

```javascript
AppState.get('videoList');
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
    {{#each videoList}}
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

[ ] **Redux-style:** restrict changes to Flux action like Redux does.
[ ] **Hot Code push:** survive to hot code pushes.
[ ] **Store offline:** so the next time the user comes back to your app everything is exactly as it was.
[ ] **Store in the url:** some of the values only. Good if the users shares the url with somebody and your app should now some of the user state.
[ ] **Time Machine:** undo/redo changes in development. Probably using [Constellation](https://atmospherejs.com/babrahams/constellation) for the UI. Pretty much like the Time Machine of Redux.
[ ] **React support:** more than react support, maybe get rid of Blaze helpers if the app doesn't use Blaze.

Ideas welcomed as well. Open issues to discuss. ;)

## License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
