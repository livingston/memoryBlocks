// Game settings

define(function () {
  var root_el = document.getElementById('board');

  return {
    root: root_el,
    blockSize: 50,
    minLevel: 3,
    maxLevel: 10,
    timeout: 5,
    showHints: true
  }
})
