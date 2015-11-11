First(() => {
  console.log("==> \"" + Action.type() + "\"");
  console.log(_.omit(Action, _.functions(Action)));
});
