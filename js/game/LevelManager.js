define(function(require) {
  var utils = require('js/utils.js');

  var LevelManager = function (settings) {
    var fn = function Empty() {},
        defaultSettings = {
          start: fn,
          end: fn,
          levelStart: fn,
          levelEnd: fn
    };
    this.settings = utils.extend(defaultSettings, settings || {});
    this.setup();
  };

  LevelManager.prototype.setup = function () {
    this.currentLevel = 0;
  };

  LevelManager.prototype.start = function () {
    this.settings.start(this);
  };

  LevelManager.prototype.end = function (status) {
    this.settings.end(status);
    this.currentLevel = 0;
  };

  LevelManager.prototype.startLevel = function () {
    this.settings.levelStart(this);
  };

  LevelManager.prototype.nextLevel = function () {
    if (++this.currentLevel < this.settings.max) {
      this.startLevel();
    } else {
      this.currentLevel--;
      this.end(true);
    }
  };

  LevelManager.prototype.prevLevel = function () {
    if (--this.currentLevel <= 0) {
      this.currentLevel = 0;
    }
    this.startLevel();
  };

  LevelManager.prototype.restartLevel = function () {
    this.startLevel();
  };

  LevelManager.prototype.endLevel = function () {
    this.settings.levelEnd(this);
  };

  LevelManager.prototype.levelInfo = function () {
    return null;
  };

  LevelManager.prototype.results = function () {
    return {};
  };

  return LevelManager;
})
