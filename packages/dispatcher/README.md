# MeteorFlux Dispatcher

*MeteorFlux is developed and maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona)*.

### What is Flux and why do I need it?

Most people using Meteor today come from creating *"server side"* or *"page based"* websites. The user asks for a url and the server returns the correct page. MVC is great with that.

But users don't want *"page based"* websites anymore. Users want apps. Things like [Trello](https://www.trello.com), [Slack](https://www.slack.com) or even [Medium](https://www.medium.com). Client side, state based, realtime apps.

Meteor is a great step forward in that direction and it gives us a lot of useful tools, but it doesn't have (or impose) any architecture. It doesn't tell us how we should organize our code. A lot of people is using Iron Router and it's great, but it feels like creating *page based* websites all over again.

**Flux** is a new architecture created by Facebook for their reactive apps. It is based in some principles to make it simpler and easier to reason about than MVC:

  - It decouples data/logic and views using an event bus (dispatcher).
  - The data/logic is organized by common domains (stores).
  - Views are not allowed to change the app state, only to dispatch actions.
  - It makes the data flow simpler (one-way only) and forbids cascading events.

Don't worry, more on that later.

### Flux official documentation

The first time Facebook talked about Flux was in the F8 conference. This [YouTube video](https://www.youtube.com/watch?list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v&t=621&v=nYkdrAPrdcw) became quite popular.

Then they released the [official documentation](https://facebook.github.io/flux).
It is probably not the best docs ever, but people have written dozens of good posts about Flux:

  - [Flux For Stupid People](http://blog.andrewray.me/flux-for-stupid-people/)
  - [What is Flux?](http://fluxxor.com/what-is-flux.html)
  - [Getting To Know Flux](https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture)
  - [What is the Flux
  Application Architecture?](https://medium.com/brigade-engineering/what-is-the-flux-application-architecture-b57ebca85b9e)
  - [Understanding Flux](https://medium.com/@garychambers108/understanding-flux-f93e9f650af7)


I am sure there are more since my research. Be aware that they all use JavaScript and React (don't expect Meteor).

### Can Flux be used in Meteor?

Yes it can. Flux is just an architecture, a set of principles. Actually, it can be a great idea if you are looking for a modern architecture to organize your code.

### And why Meteor and not only Flux?

Flux is the architecture Faceook designed for [React](https://facebook.github.io/react/) apps, but React is only a front end framework. Right now, Facebook is working on other parts with things like [Relay & GraphQL](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) or integrating libraries like [Baobab](https://github.com/Yomguithereal/baobab).

It looks like these new approaches are trying to solve the same issues that Meteor is already solving in such a great way. There are many other implementations from people or companies using Flux, but none of them have a framework as complete as Meteor.

### Do I need React?

No, you don't. [React](https://facebook.github.io/react/) is just a frontend framework and Flux is an architecture. You can use it if you like, but the Flux principles can be applied even if you use [Blaze](https://www.meteor.com/blaze), [Angular](https://angularjs.org/), [ViewModel](http://viewmodel.meteor.com/), [Blaze Components](http://components.meteor.com/), [Flow Components](https://github.com/meteorhacks/flow-components) or whatever comes out next month.

### Is Flux the best architecture for everything?

I don't think so. But it can be useful for sure. I find Flux apps easy to understand and reason about. A lot of Meteor apps lack architecture. Logic and state are spread among the different parts of the app and there is no way to know where is what. Debugging, scaling and testing becomes difficult.

When you choose an architecture you spend less time thinking "where do I put this" and more time just coding because it is clear where things belong. In the long run, it helps you make your app easier to understand, easier to test and easier to scale.

There are many different implementations of Flux, just like there are many different implementations of MVC. This is a good sign, and once you get the concept you can adapt Flux to your particular needs.

### Different Flux Implementations

There are dozens of implementations out there and even other big companies have open sourced their owns:

  - [Fluxible (Yahoo)](http://fluxible.io/)
  - [NuclearJS (Optimizely)](https://github.com/optimizely/nuclear-js)
  - [Redux](http://rackt.github.io/redux/)
  - [ReFlux](https://github.com/spoike/refluxjs)
  - [Alt](http://alt.js.org/)
  - [Flummox](http://acdlite.github.io/flummox)
  - [Marty](http://martyjs.org/)
  - [Fluxxor](http://fluxxor.com/)

All these implementations are good examples of what people is doing with the Flux principles. None of them include Meteor so far.

### What about this "MeteorFlux" implementation?

This **MeteorFlux** implementation is a port of the official Facebook's [Dispatcher](https://github.com/facebook/flux), which is the only code related to Flux Facebook has released so far.

Actually, it is the only required to create a Flux application. You can create all the other stuff with plain javascript using objects, prototypes, classes, modules. Whatever you feel comfortable with. You can create your own implementation on top of this **Dispatcher** if you want.

I will keep it in sync with the Facebook Dispatcher, but it seems pretty stable right now.

There is a more complex implementation in Meteor called [space-ui](https://github.com/CodeAdventure/space-ui).
I recommend to take a look and adopt it if you feel comfortable with its concepts, like commands or mediators.


# The MeteorFlux Dispatcher API

This **Dispatcher** is very simple. It only has two important methods:

### Dispatcher.dispatch():

Dispatches an **Action**:

```javascript
Dispatcher.dispatch( action );
```

Normally, the action contains an **action identifier**. The standard name is `type` but you can use whatever you want:

```javascript
Dispatcher.dispatch( { type: "SOMETHING_HAPPENED" } );
```

And of course, it can contain more data:

```javascript
Dispatcher.dispatch( { type: "SOMETHING_HAPPENED", usefulData: "some data" } );
```

Alternatively, you can pass the `type` in the first parameter:

```javascript
Dispatcher.dispatch( "SOMETHING_HAPPENED" );
// or
Dispatcher.dispatch( "SOMETHING_HAPPENED", { usefulData: "some data" } );
```

### Dispatcher.register():

Register a callback. Normally used by the **Stores**.

```javascript
Dispatcher.register(function(action){
   switch( action.type ){
       case "SOMETHING_HAPPENED":
           doSomething(action.usefulData);
           break;
       case "OTHER_THING_HAPPENED":
           doOtherThing(action.otherData);
           break;  
    }
});
```

Using `switch` to check the `type` may not be the most elegant solution but it works and it's very flexible. It is what Facebook people or Redux users use.

Alternatively you can pass the `type` as the first parameter:

```javascript
Dispatcher.register("SOMETHING_HAPPENED", function(action){
  doSomething(action.usefulData);
});
```



# Installing the Dispatcher

Just open the terminal and write:

```bash
meteor add meteorflux:dispatcher
```

Then you can use the `Dispatcher` object inside your Meteor app.

If you need to create an independent dispatcher (i.e. for testing purposes) you can do it with:

```javascript
var otherDispatcher = new MeteorFlux.Dispatcher();

```

# Flux concepts and principles

Flux is based on a **one way data flow**:

1. When the user interacts with the app (he clicks something for example) the **View** dispatches an **Action**. Flux decouples **Views** (Templates) from logic/data (**Stores**) using a message bus (**Dispatcher**).
- **Stores** callbacks receive those **Actions** and are the only ones which can have logic and modify the data (**App State**).
- The **App State** represents the only truth of the app. It should not be duplicated anywhere.
- **Views** are allowed to retrieve the **App State** when it changes.

![Meteor Flux](https://raw.githubusercontent.com/worona/meteorflux/devel/packages/dispatcher/images/MeteorFlux.jpg)

Normally, Flux diagrams don't include **App State** but we are using **Meteor** to store our **App State** in *Collections and Reactive Variables*, so I wanted to include it here.

### The One-way-data-flow

All external changes must dispatch an **Action**. Those changes are normally triggered by the **View**, when the user interacts with the app, but an API or a Cron Job can dispatch **Actions** as well.

**Views** (Templates in Meteor) can't have logic and can't change the **App State**. All they can do is dispatching an **Action** like this:

```javascript
Template.someView.events({
  'click .some-button': function(){
    Dispatcher.dispatch( { type: "SOMETHING_HAPPENED", data: "some data" );
  };
});
```

**Actions** must be declarative and not imperative. For example, use `SOMETHING_HAPPENED` or `USER_DID_SOMETHING` and not `SET_THAT_VARIABLE_TO_FALSE`.

**Stores** are in charge of logic and updating the **App State**. They are divided by *domain* and they register to the **Actions** they want to act upon. For example:

```javascript
// YourSomethingStore.js
var something = new ReactiveVar(null);

var changeSomething = function(newValue){
  something.set(newValue);
};

var changeOtherThing = function(newValue){
  SomeCollection.insert({value: newValue});
};

// Do stuff when actions happen
Dispatcher.register(function(action){
   switch( action.type ){
       case "SOMETHING_HAPPENED":
           changeSomething(action.data);
           break;
      case "OTHER_THING_HAPPENED":
           changeOtherThing(action.data);
           break;
    }
});

// We can use public methods to retrieve local data later on the View or other Stores
YourSomethingStore = {
  getSomething: function(){
    return something.get();
  },
  getSomeCollection: function(){
    return SomeCollection.find();
  }
}
```

**Stores** can't dispatch **Actions** in the middle of a dispatch, to avoid complex cascading of events. That means they must do whatever your app needs to do in response to the original action, without triggering anything else.

At first, this may appear very restrictive, but it is very useful. Coming from a [PureMVC](http://puremvc.org/content/view/67/178/) world (event based MVC) I know cascading events can be a hell to debug. So each time you want to use cascading events you have to think twice and come out with a simpler design.

**Stores** are the only ones which can modify the **App State** and they can  do it only in response to an **Action**. They don't have setters.

**Store** methods should be easily testable using unit tests. When they get complex they can (and should) use libraries to simplify their logic.

**App State** should not be duplicated. That means, all the state of your app must be in only one place. **Views** should not contain their own state. With one **App State** we should be able to render one final **View** consistently.

Finally, **Views** can retrieve data from the **App State**. We are in Meteor, so we can do that reactively:

```javascript
Template.someView.helpers({
  'something': function(){
    return YourSomethingStore.getSomething(); // reactive
  },
  'someData': function(){
    return YourSomethingStore.getSomeData(); // reactive
  }
});
```

Or you can access the **App State** directly if you prefer:

```javascript
Template.someView.helpers({
  'someData': function(){
    return SomeCollection.find({}); // reactive
  }
});

```

If we have done things right, we have followed the Flux one-way flow:

External Trigger (View) -> Action-> Dispatcher -> Store -> App State -> View.

I have done a more complex graph to show how a Meteor app can be used following the Flux principles:

![MeteorFluxGraph](https://raw.githubusercontent.com/worona/meteorflux/devel/packages/dispatcher/images/MeteorFluxGraph.jpg)

### Async Operations

The **one way data flow** of Flux is designed to be synchronous. If we want to use async operations we must create an **Action Creator** like this:

```javascript
UserActions = {
  logIn: function(user, password){
    Meteor.loginWithPassword(user, password, function(error){
      if (error) {
        Dispatcher.dispatch({ type: "LOGIN_FAILED" });
      } else {
        Dispatcher.dispatch({ type: "LOGIN_SUCCEED" });
      }
    });
  }
};
```

And dispatch the **Action** in your template like this:

```javascript
Template.LoginForm.events({
  'submit #login-form': function(event){
    event.preventDefault();
    UserActions.logIn(event.target.user.value, event.target.password.value);
  }
});
```

That way, **Stores** can listen to the `LOGIN_FAILED` and `LOGIN_SUCCEED` events and act accordingly.

### The third Dispatcher method: `waitFor()`

The original Facebook's Dispatcher has a third method called `waitFor()`. It can be used when a **Store** needs to wait until other **Store** has finished updating.

It looks like in Meteor (and in other implementations like [NuclearJS](https://github.com/optimizely/nuclear-js)) it is not needed anymore. Probably not needed when Facebook adopts some sort of reactive model like [Baobab](https://github.com/Yomguithereal/baobab) as well.

Facebook uses this simple example to show the use of `waitFor()`:

```javascript
// For example, consider this hypothetical flight destination form, which
// selects a default city when a country is selected:

// Keeps track of which country is selected
var CountryStore = {country: null};
// Keeps track of which city is selected
var CityStore = {city: null};
// Keeps track of the base flight price of the selected city
var FlightPriceStore = {price: null}


// When a user changes the selected city, we dispatch the payload:
Dispatcher.dispatch({
  type: 'city-update',
  selectedCity: 'paris'
});

// This payload is digested by `CityStore`:
Dispatcher.register(function(payload) {
  if (payload.type === 'city-update') {
    CityStore.city = payload.selectedCity;
  }
});

// When the user selects a country, we dispatch the payload:
Dispatcher.dispatch({
  type: 'country-update',
  selectedCountry: 'australia'
});

// This payload is digested by both stores:
CountryStore.dispatchToken = Dispatcher.register(function(payload) {
  if (payload.type === 'country-update') {
    CountryStore.country = payload.selectedCountry;
  }
});

// When the callback to update `CountryStore` is registered, we save a
// reference to the returned token. Using this token with `waitFor()`,
// we can guarantee that `CountryStore` is updated before the callback
// that updates `CityStore` needs to query its data.
CityStore.dispatchToken = Dispatcher.register(function(payload) {
  if (payload.type === 'country-update') {
    // `CountryStore.country` may not be updated.
    flightDispatcher.waitFor([CountryStore.dispatchToken]);
    // `CountryStore.country` is now guaranteed to be updated.

    // Select the default city for the new country
    CityStore.city = getDefaultCityForCountry(CountryStore.country);
  }
});
```

But in Meteor we can use reactivity like this:
```javascript
// Keeps track of what is selected, but we use reactive variables.
var CountryStore     = {country: new ReactiveVar(null)};
var CityStore        = {city:    new ReactiveVar(null)};
var FlightPriceStore = {price:   new ReactiveVar(null)}

// When the user selects a country, we dispatch the payload:
Dispatcher.dispatch({
  type: 'country-update',
  selectedCountry: 'australia'
});

// This payload is only digested by the country store:
Dispatcher.register(function(action) {
  if (action.type === 'country-update') {
    CountryStore.country.set(action.selectedCountry);
  }
});

// We don't need to listen for all the actions which may change the country,
// to keep our city in sync. We can just use reactivity.
Tracker.autorun(function(){
  var newCountry  = CountryStore.country.get();
  var defaultCity = getDefaultCityForCountry(newCountry);
  CityStore.city.set(defaultCity);
});
```

Anyway, the `waitFor()` method is part of this port, so you
feel free to use it if you want.

### Flux and routing

Of course, most apps created with Meteor still need to address urls:

  - People expect url changes when the layout/page changes.
  - People share urls when they want to show a website to other person.
  - People expect to hit the back button of the browser and go back to the last layout/page.

The best way I have found to integrate it is by dispatching actions with [FlowRouter](https://github.com/meteorhacks/flow-router), like this:

```javascript
FlowRouter.route("/", {
  action: function() {
    Dispatcher.dispatch({ type: "GOTO_HOME" });
  }
});
FlowRouter.route("/blog", {
  action: function() {
    Dispatcher.dispatch({ type: "GOTO_BLOG_HOME" });
  }
});
FlowRouter.route("/blog/:page", {
  action: function() {
    Dispatcher.dispatch({ type: "GOTO_BLOG_PAGE", page: params.page });
  }
});
```

This is so simple I'm sure it can be done with IronRouter as well, but I didn't check it yet.

If you want to control the layout you can do so with a special **Store** (or maybe more than one) and [FlowLayout](https://github.com/meteorhacks/flow-layout):

```javascript
// YourLayoutStore.js
Dispatcher.register(function(action){
  switch(action.type){
    case "GOTO_HOME":
      FlowLayout.render('MainLayout', { main: 'HomeView' });
      break;
    case "GOTO_BLOG_HOME":
    case "GOTO_BLOG_PAGE":
      FlowLayout.render('MainLayout', { main: 'BlogView' });
      break;
  }
});
```

### Flux and subscriptions

You can control your subscriptions in your templates or in your **Stores**. It is not clear yet, and I suppose it depends on your needs.

Facebook is working on a thing called [GraphQL](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) which allows React Components (equivalent to Meteor templates) to ask for the data they need (equivalent to Meteor subscriptions).
We'll see. I would avoid defining them in the router, anyway.

### Flux and testing

Testing in Flux is easy. All your logic should be in your **Stores** and it's independent of the rest of the app, so we can use simple unit tests like this:

```javascript
describe('CartStore', function() {

  beforeEach(function(){
    Dispatcher = new MeteorFlux.Dispatcher(); // resets the Dispatcher
    CartStore  = new CartStore();             // resets the Store
  });

  it('should add an item to the cart', function(){
    spyOn(CartCollection, 'insert');
    Dispatcher.dispatch({ type: "ADD_CART_ITEM", item: { _id: 123 } });
    expect(CartCollection.insert).toHaveBeenCalled();
  });

  it('should increse a cart item quantity', function(){
    spyOn(Meteor, 'call');
    Dispatcher.dispatch({ type: "INCREASE_CART_ITEM", item: { _id: 123 } });
    expect(Meteor.call).toHaveBeenCalledWith('CartStore.increaseCartItem', 123 );
  });
});
```

# Examples

I have created three examples:

1. Selected Post:
  - [MeteorPad](http://meteorpad.com/pad/36dwXz9ktQK3SJGgB/Selected%20Post%20Flux%20Example)
  - [GitHub](https://github.com/meteorflux/selected-post-example)
- TodoFlux:
  - [Demo](http://todoflux.meteor.com/)
  - [GitHub](https://github.com/meteorflux/todoflux)
- CartFlux:
  - [Demo](https://cartflux.scalingo.io/)
  - [GitHub](https://github.com/meteorflux/cartflux)
- MeteorFlux and React (by [@generalleger](https://github.com/generalleger))
  - [GitHub](https://github.com/generalleger/meteor-flux-react-example/)

CartFlux is the most complex. It has users accounts, pagination (with *look ahead* subscriptions), routing and testing. If you feel like reading more about it you can do so in [this  thread](https://forums.meteor.com/t/meteorflux-flow/920) of the Meteor forums. Be aware, it's a very long thread :)

# Changelog

### 1.2.1

- Now filters can stop the dispatch if they return false. (Thanks @jreinert!)

### 1.2.0

- Added filters for both dispatch and register. This is in testing mode yet. Probably not the final implementation.

# License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/meteorflux/meteorflux.
