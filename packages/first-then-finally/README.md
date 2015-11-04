# MeteorFlux - First, Then, Finally!

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

**This package is currently under development. Please open issues if you find bugs, want to discuss the principles or want to suggest new features.**

## What is it?

**First, Then, Finally! (FTF)** is a Flux framework for extensible Meteor applications.

## Installation

Just add it to your Meteor project using:

```
$ meteor add meteorflux:first-then-finally
```

## The idea behind it

Flux is a great way to know what is really happening in your app and decouple your logic from your views, but it is **Action Driven**. Meteor is a great framework to write complex apps, but it is **Data Driven**.

To join both worlds and get the best from them, you can use this flow:

- When an **Action** is dispatched, **First** callbacks are triggered before anything else. Use them to write to the database, for example. These functions will be called only once.
- After that, all the reactive functions are triggered. These are the **Then** callbacks or any typical **State** function. These functions will be called as many times as they need if their reactive sources are invalidated not only by **Action** but by other reactivity.
- Once all the reactivity has finished and **State** is stable again, the **Finally** callbacks are triggered. Use them when you need to do staff with the updated **State** which can't be triggered more than once, like for example analytics or logging.

## If you are new to Flux

First, you need to understand Flux. Go here for details:
https://github.com/worona/meteorflux/tree/devel/packages/dispatcher

Then, you probably want to understand Meteor's reactivity. You can start here:
http://docs.meteor.com/#/full/reactivity

And finally, learn to use **First, Then, Finally!**:

### Dispatch

Just like any Flux dispatcher, use **Dispatch** when user does something or an async operation finishes:

```javascript
Dispatch({ type: 'SOMETHING_HAPPENED', data: 'some data' });
// or
Dispatch('SOMETHING_HAPPENED', { data: 'some data' });
```

### Action

After the **Dispatch**, you have access to the action payload using the **Action** object inside any of the callback functions (**First**, **Then** and **Finally**).

#### Action.type()

```javascript
// Inside First, Then or Finally
switch (Action.type()) {
  case 'SOMETHING_HAPPENED':
    doSomething();
    break;
  default:
    doDefault();
}
// or maybe...
let type = Action.type();
if (type.startsWith === 'SHOW_') {
  doSomething();
}
```

It is reactive inside **Then** callbacks, but not in **First** or **Finally**.

#### Action.is()

```javascript
// Inside First, Then or Finally
if (Action.is('NEW_POST_ADDED')) {
  doSomething();
}
```

Like `Action.type()`, it is reactive inside **Then** callbacks, but not in **First** or **Finally**.

#### Action.payload()

It gives you access to the payload of the **Action**:

```javascript
// From your Templates
Dispatch('NEW_POST_ADDED', { title: 'New post', slug: '/new-post' })

// Inside First, Then or Finally
if (Action.is('NEW_POST_ADDED')) {
  let payload = Action.payload();
  addPost(payload.title, payload.slug);
}
```

#### Action.payload

You can access the payload values directly from Action as well.

```javascript
// From your Templates
Dispatch('NEW_POST_ADDED', { title: 'New post', slug: '/new-post' })

// Inside First, Then or Finally
if (Action.is('NEW_POST_ADDED')) {
  addPost(Action.title, Action.slug);
}
```

Be aware that `Action.payload()` is **NOT REACTIVE**. Only `Action.type()` and `Action.is()` are.

### First

The **First** callbacks will be called first when action is dispatched. They are **NOT REACTIVE** and are called only once.

```javascript
First(() => {
  if (Action.is('SOMETHING_HAPPENED')) {
    doSomething(Action.data);
  }
});
```

You can access **State**, but it won't be updated with any changes yet. **State** is updated in the **Then** callbacks.

**First** callbacks are only **RUN ONCE** when the action is dispatched.

They are usually used for tasks which need to be run only once and have direct relation to the **Action**. For example, writing to the database.

```javascript
First(() => {
  switch (Action.type()) {
    case 'NEW_POST_ADDED':
      let title = Action.title;
      let slug = Action.slug;
      Meteor.call('addPost', { title, slug });
      break;
    case 'POST_DELETED':
      Meteor.call('deletePost', Action.id);
      break;
  }
});
```

### Then

Meteor Reactivity is great, but it comes with a price: **unstable state**.

If you think of this typical example:

```javascript
let city = new ReactiveVar('Madrid');
let weather = new ReactiveVar('sunny');

Tracker.autorun(() => {
  console.log('It is ' + weather.get() + ' in ' + city.get() + '.');
});
```

When you want to say weather is cloudy in London, you do:
```javascript
weather.set('cloudy');
city.set('London');
```

And two things are printed in console:
```
=> 'It is cloudy in Madrid' // unstable, incorrect
=> 'It is cloudy in London' // final, correct
```

`It is cloudy in Madrid` is what we call **unstable state**.

**Then** callbacks are **REACTIVE** and this means they can be called several times until they are stable and **State** values are final.

```javascript
Then(() => {
  if (Action.is('NEW_POST_ADDED')) {
    let payload = Action.payload();
    addPost(payload.title, payload.slug);
  }
});
```

You shouldn't trust **Then** callbacks for tasks which may be called only once. For that purpose, use either **First** or **Finally**.

## State

You have access to a global **State** object to store all the state of your application. We have used MeteorFlux ReactiveState for that, so you can learn more about it here:
https://github.com/worona/meteorflux/tree/devel/packages/reactive-state

Typically, you may want to use `State.set` instead of **Then** when you want to change some State. They will be invalidated in the **Then** phase as well.

```javascript
State.set('selectedPost', (state = false) => {
  switch(Action.type()) {
    case 'NEW_POST_SELECTED':
      return Action._id;
    case 'POST_DELETED':
      return false;
    default:
      return state;
  }
});
```

You don't need to use **Action** if you don't want to. For example, this works just fine:

```javascript
State.set('posts.items', (state = []) => {
  return Posts.find();
});
```

```javascript
let handle = Meteor.subscribe('posts');
State.set('posts.isReady', (state = false) => {
  return !!handle && handle.ready();
});
```

## Finally

**Finally** callbacks are used for logs, analytics or other calls to 3rd party services which only have to be called once, but after you know all the **State** is final.

They are **NOT REACTIVE** and called only once, after all **Then** callbacks and invalidations.

```javascript
Finally(() => {
  switch (Action.type()) {
    case 'SHOW_POST':
      let postTitle = State.get('post.title');
      analytics.track('Post visited: ' + postTitle);
      break;
    case 'POST_DELETED':
      let postId = State.get('post.id');
      analytics.track('Post deleted: ' + postId);
      break;
  }
});
```

## Use everything together

If you understand the flow of this example, then you are probably good to go!

```javascript
let text = '';

First(() => {
  switch (Action.type()) {
    case 'SOMETHING_HAPPENED':
      text = text + 'First, ';
      break;
    default:

  }
});

Then(() => {
  if ((Action.is('SOMETHING_HAPPENED')) && (State.get('something') === true))
    text = text + 'Then, ';
});

Then(() => {
  if (Action.is('SOMETHING_HAPPENED'))
    State.set('something', true);
});

Finally(() => {
  if ((Action.is('SOMETHING_HAPPENED')) && (react.get() === true))
    text = text + 'Finally!';
    console.log(text);
});

Dispatch('SOMETHING_HAPPENED');

// it should print:
// => 'First, Then, Finally!'
```

First, the **First** callback is run and it adds `'First, '` to the `text` variable. That's easy.

Then, the **Then** callbacks are run. Even though the first **Then** is called first than the second one, `State.get('something')` is still `false` so it does nothing. When the second **Then** is called, it sets `State.set('something')` to `true`. That triggers a new call of the first **Then**, which now adds `'Then, '` to the `text` variable.

Finally, once **State** is stable and all **Then** callbacks are finished, the **Finally** callback is run with the final text and `console.log`.

For any doubt, use the [Github issues](https://github.com/worona/meteorflux/issues).

## Isn't this like MeteorFlux Dispatcher?

The concepts behind it are similar, like **Avoid dispathing in the middle of a dispatch** or **One way data flow** but this dispatcher is using Meteor's reactivity and it's been built to have three different phases: **First**, **Then** and **Finally**.

## Changelog

### 1.2.3:

- Update **ReactiveState** to 1.1.1.

### 1.2.2:

- Update README.

### 1.2.1:

- Update **ReactiveState** to 1.1.0.

### 1.2.0:

- Add `Dispatch.after()` to queue actions.

### 1.1.0:

- Add `Dispatch.isDispatching()`.

### 1.0.0:

- First version.

## License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
