# MeteorFlux - FTF Blaze Helper

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

If you want to dispatch Flux actions straight from Blaze, this is your
package!

## How to use it

First add it to your Meteor project:

```
$ meteor add meteorflux:first-then-finally-blaze
```

Then, in your HTML code, just add `dispatch` to any `a`, `button` or `form`.

```html
<a href='#' dispatch='SOMETHING_HAPPENED'>Something!</a>
<!-- or -->
<button dispatch='BUTTON_PUSHED'>Something!</button>
<!-- or -->
<form dispatch='FORM_SENT'>
  <input type="text" name="username">
  <input type="submit" name="Send!">
</form>
```

And the helper will send a Flux action with a payload like this:

```javascript
{
  type: 'SOMETHING_HAPPENED',
  context: // the data context. Equivalent to 'this'.
  event: // the event which triggered the action.
  template: // the template in where the action was triggered.
}
```

## Data context

If you use it inside a `{{#with}}` or a `{{#each}}` block, you will get the data context in `context`. For example:

```html
{{#each posts}}
  <h1>{{title}}</h1>
  <p>{{content}}</p>
  {{#if favorite}}
    <button dispatch='UNFAVORITE_THIS_POST'>Remove from favorites!</button>
  {{else}}
    <button dispatch='FAVORITE_THIS_POST'>Add to favorites!</button>
  {{/if}}
{{/each}}
```

You will get the post `_id` inside `context`:

```javascript
First(funciton() {
  switch(Action.type()) {
  case 'FAVORITE_THIS_POST':
    var postId = Action.context._id;
    Posts.update(postId, { $set: { favorite: true } } );
    break;
  case 'UNFAVORITE_THIS_POST':
    var postId = Action.context._id;
    Posts.update(postId, { $set: { favorite: false } } );
    break;
  }
});
```

If you dispatch the same action from javascript, remember you still have to use `context`, so it is compatible with the helper. For example:

```javascript

var post = Posts.findOne();

Dispatch('FAVORITE_THIS_POST', { context: { _id: post._id } });

```

If you don't like this behavior, pass the data you need instead.

## Passing other data

You can pass other data using the data attribute `data-key`, being key any key you want to add. For example:

```html
<span>Software Version: {{softwareVersion}}</span>
<button dispatch='INCREASE_VERSION' data-version={{softwareVersion}}>
    Increase version
</button>
```

And it will be passed in the `payload` like this:

```javascript
{
  type: 'INCREASE_VERSION',
  version: 1.2.0 // the value of {{softwareVersion}}
  context: // the data context. Equivalent to 'this'.
  event: // the event which triggered the action.
  template: // the template in where the action was triggered.
}
```

*The key of `data-key` has to be different than `type`, `context`, `event` and `template`.*

If the key has hyphens, it will convert it to camelcase. For example, `data-user-name` will be converted to `userName`.

---

It's probably a good idea to pass the `_id` of the context whenever you can, instead of relaying on `context._id`.

For example:

```html
{{#each posts}}
  <h1>{{title}}</h1>
  <p>{{content}}</p>
  {{#if favorite}}
    <button
      dispatch='UNFAVORITE_THIS_POST'
      data-id={{_id}}>
      Remove from favorites!
    </button>
  {{else}}
  <button
    dispatch='FAVORITE_THIS_POST'
    data-id={{_id}}>
    Add to favorites!
  </button>
  {{/if}}
{{/each}}
```

And your callback would be:

```javascript
First(funciton() {
  switch(Action.type()) {
  case 'FAVORITE_THIS_POST':
    Posts.update(Action.id, { $set: { favorite: true } } );
    break;
  case 'UNFAVORITE_THIS_POST':
    Posts.update(Action.id, { $set: { favorite: false } } );
    break;
  }
});
```

This would make your actions more reusable.

## Template

Like in normal Meteor events, you can access the template using `Action.template`.

## Event

Like in normal Meteor events, you can access the event which triggered the action with `Action.event`.

## Form data

Like in normal Meteor events, you can get the form values in `event.currentTarget.name-of-the-input.value`.

But you can access them as well in the `payload`. For example, a form like this:
```html
<body>
  <form dispatch='SOMETHING_HAPPENED'>
    <input type="text" name="text" value="Text Example">
    <input type="submit" name="submit" value="Submit">
    <input type="checkbox" name="vehicle1" value="Bike">I have a bike<br>
    <input type="checkbox" name="vehicle2" value="Car" checked> I have a car<br>
    <input type="radio" name="gender" value="Male"><br>
    <input type="radio" name="gender" value="Female" checked><br>
  </form>
</body>
```
Will have this `payload`:
```javascript
{
  type: 'INCREASE_VERSION',
  text: 'Text Example', // Value for input with name 'text'
  vehicle1: false, // Checked for checkbox with name 'vehicle1'
  vehicle2: true, // Checked for checkbox with name 'vehicle2'
  gender: 'Female' // Value for checked radio with name 'gender'
  context: {...}, // the data context. Equivalent to 'this'.
  event: {...}, // the event which triggered the action.
  template: {...} // the template in where the action was triggered.
}
```


## Changelog

### 1.1.1:

- Update to FTF 1.2.5

### 1.1.0:

- Improve form values. Now they don't use value anymore.

### 1.0.1:

- Update to FTF 1.2.4

### 1.0.0:

- First release


# License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
