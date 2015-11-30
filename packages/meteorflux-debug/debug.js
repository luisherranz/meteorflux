Meteor.startup(() => {
  if (typeof Register !== "undefined") {
    Register(() => {
      console.log("==> \"" + Action.type() + "\"");
      console.log(_.omit(Action, _.functions(Action)));
    });
  }
});
