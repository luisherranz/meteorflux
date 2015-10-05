# MeteorFlux Dispatcher Helper

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

If you want to dispatch Flux actions straight from Blaze, this is your
package!

## How to use it

First add it to your Meteor project:

```
$ meteor add meteorflux:dispatcher-helper
```

Then, in your HTML code, just add `data-action-type` to any `a`, `button` or `form`.

```html
<a href='#' data-action-type='SOMETHING_HAPPENED'>Something!</a>
<!-- or -->
<button data-action-type='BUTTON_PUSHED'>Something!</button>
<!-- or -->
<form data-action-type='FORM_SENT'>
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
    <button data-action-type='UNFAVORITE_THIS_POST'>Remove from favorites!</button>
  {{else}}
    <button data-action-type='FAVORITE_THIS_POST'>Add to favorites!</button>
  {{/if}}
{{/each}}
```

You will get the post `_id` inside `context`:

```javascript
Dispatcher.register(funciton(action) {
  switch(action.type) {
  case 'FAVORITE_THIS_POST':
    var postId = action.context._id;
    Posts.update(postId, { $set: { favorite: true } } );
    break;
  case 'UNFAVORITE_THIS_POST':
    var postId = action.context._id;
    Posts.update(postId, { $set: { favorite: false } } );
    break;
  }
});
```

If you dispatch the same action from javascript, remember you still have to use `context`, so it is compatible with the helper. For example:

```javascript

var post = Posts.findOne();

Dispatcher.dispatch({
  type: 'FAVORITE_THIS_POST',
  context: { _id: post._id }
});

```

If you don't like this behavior, pass the data you need instead.

## Passing other data

You can pass other data using the data attribute `data-action-key`, being key any key you want to add. For example:

```html
<span>Software Version: {{softwareVersion}}</span>
<button
  data-action-type='INCREASE_VERSION'
  data-action-version={{softwareVersion}}>
    Increase version
</button>
```

And it will be passed in the `data` key like this:

```javascript
{
  type: 'INCREASE_VERSION',
  version: 1.2.0 // the value of {{softwareVersion}}
  context: // the data context. Equivalent to 'this'.
  event: // the event which triggered the action.
  template: // the template in where the action was triggered.
}
```

*The key of `data-action-key` has to be different than `type`, `context`, `event` and `template`.*

If the key has hyphens, it will convert it to camelcase. For example, `data-action-user-name` will be converted to `userName`.

---

It's probably a good idea to pass the `_id` of the context whenever you can, instead of relaying on `context._id`.

The post example would be like this:

```html
{{#each posts}}
  <h1>{{title}}</h1>
  <p>{{content}}</p>
  {{#if favorite}}
    <button
      data-action-type='UNFAVORITE_THIS_POST'
      data-action-id={{_id}}>
      Remove from favorites!
    </button>
  {{else}}
  <button
    data-action-type='FAVORITE_THIS_POST'
    data-action-id={{_id}}>
    Add to favorites!
  </button>
  {{/if}}
{{/each}}
```

And the Store would be:

```javascript
Dispatcher.register(funciton(action) {
  switch(action.type) {
  case 'FAVORITE_THIS_POST':
    Posts.update(action.id, { $set: { favorite: true } } );
    break;
  case 'UNFAVORITE_THIS_POST':
    Posts.update(action.id, { $set: { favorite: false } } );
    break;
  }
});
```

This would make your actions more reusable.

## Template

Like in normal Meteor events, you can access the template using `action.template`.

## Event

Like in normal Meteor events, you can access the event which triggered the action with `action.event`.

## Form data

Like in normal Meteor events, you will get the form values in `event.currentTarget.name-of-the-input.value`.


# License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
