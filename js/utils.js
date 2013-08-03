define(function () {
  var extend = function (what, wit) {
    var ext = {}, name, u;

    for (name in wit) {
      if (wit.hasOwnProperty(name)) {
        ext[name] = wit[name];
      }
    }

    for (name in what) {
      if (what.hasOwnProperty(name)) {
        u = ext[name];
        ext[name] = (typeof u !== 'undefined') ? u : what[name];
      }
    }

    return ext;
  };

  return {
    extend: extend
  }
});
