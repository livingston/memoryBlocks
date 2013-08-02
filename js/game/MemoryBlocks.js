define(function (require) {
  var utils = require('js/utils.js');
  var LevelManager = require('js/game/LevelManager.js');

  var body = document.body,
      splice = Array.prototype.splice,
      drawImage = CanvasRenderingContext2D.prototype.drawImage;

  var MemoryBlocks = function (options) {
    var defaults = {
      root: document.body,
      timeout: 60,
      minLevel: 3,
      maxLevel: 10,
      blockSize: 100,
      gridRatio: '1:1',
      showHints: false
    };
    options = utils.extend(defaults, options);

    this.options = options;

    if( options.minLevel > options.maxLevel) throw('Min Level cannot be larger than Max Level');

    this.calculateMetrics();
    this.setup();
  };

  MemoryBlocks.prototype.setupStatus = function () {
    var statusElem = document.createElement('div');

    statusElem.id = 'MB_status';
    statusElem.className = 'mb_hidden';
    this.statusElem = statusElem;
    this.options.root.parentNode.appendChild(statusElem);
  };

  MemoryBlocks.prototype.addControls = function () {
    var frag = document.createElement('div'),
        startBtn = document.createElement('button'),
        stopBtn = startBtn.cloneNode(false),
        self = this;

    frag.id = 'MB_CONTROLS';
    startBtn.id = 'MB_START';
    startBtn.innerHTML = 'Start';

    stopBtn.id = 'MB_STOP';
    stopBtn.className = 'mb_hidden';
    stopBtn.innerHTML = 'Stop';

    frag.appendChild(startBtn);
    frag.appendChild(stopBtn);

    this.options.root.appendChild(frag);

    this.controls = { start: startBtn, stop: stopBtn, holder: frag };

    startBtn.addEventListener('click', function () {
      self.levels.startLevel();
      this.className = 'mb_hidden';
      stopBtn.className = '';
    }, false);

    stopBtn.addEventListener('click', function () {
      self.stop();
      this.className = 'mb_hidden';
      startBtn.className = '';
    }, false);
  };

  MemoryBlocks.prototype.setupSprites = function () {
    var sprite = document.createElement('canvas'),
        ctx = sprite.getContext('2d'),
        size = this.options.blockSize,
        itemsInSprite = 4, space = 10,
        deg = Math.PI / 180,
        createGradient = function (color1, color2) {
          var g = (size * 50 / size),
              gradient = ctx.createRadialGradient(g, g, size / 2, g, g, size);

          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);

          return gradient;
        },
        setBoxSprite = function (x, y, style) {
          ctx.save();
          ctx.translate(x, y);

          ctx.moveTo(0, 0);
          ctx.fillStyle = style;
          ctx.fillRect(0, 0, size, size);

          ctx.restore();
        }, step = size + 10, tdata;

    sprite.width = (size + space) * itemsInSprite;
    sprite.height = size;
    sprite.id = 'MB_SPRITES';

    setBoxSprite(0, 0, createGradient('#f0262a', '#aa1a1e'));
    setBoxSprite(step, 0, createGradient('#e7e7e7', '#a1a1a1'));
    setBoxSprite(step * 3, 0, createGradient('rgba(240, 38, 42, 0.3)', 'rgba(170, 26, 30, 0.3)'));

    tdata = ctx.getImageData(step, 0, size, size);
    ctx.putImageData(tdata, step * 2, 0);

    ctx.save();
    ctx.translate(step * 2 + size / 6, size / 10);
    ctx.rotate(45 * deg);
    ctx.moveTo(0, 0);
    ctx.fillStyle = createGradient('#f0262a', '#aa1a1e');
    ctx.fillRect(0, 0, size, size / 10);
    ctx.restore();

    ctx.save();
    ctx.translate(step * 2 + size / 8, size / 1.25);
    ctx.rotate(-45 * deg);
    ctx.fillStyle = createGradient('#f0262a', '#aa1a1e');
    ctx.fillRect(0, 0, size, size / 10);
    ctx.restore();

    this.sprite = sprite;
  };

  MemoryBlocks.prototype.calculateMetrics = function () {
    var opts = this.options,
        gridRatio = opts.gridRatio.split(':'),
        size = opts.blockSize,
        minLevel = opts.minLevel,
        maxLevel = opts.maxLevel,
        levelLen = maxLevel - minLevel + 1,
        space = size / 50, t = maxLevel, level,
        sizeFactor = (size + space),
        levels = {
          length: levelLen,
          space: space,
          sizeFactor: sizeFactor
        };

    while (levelLen--) {
      level = {};
      level.col = t * parseInt(gridRatio[0], 10);
      level.row = t * parseInt(gridRatio[1], 10);
      level.width = sizeFactor * level.col;
      level.height = sizeFactor * level.row;
      levels[levelLen] = level;
      t--;
    }

    this.metrics = levels;
  };

  MemoryBlocks.prototype.setup = function () {
    var board = document.createElement('canvas'),
        opts = this.options;

    opts.root.appendChild(board);
    this.board = board;

    this.context = board.getContext('2d');
    this.setupStatus();
    this.setupSprites();
    this.addControls();

    this.levels = new LevelManager({ holder: this.controls.holder, max: this.metrics.length, levelStart: this.startLevel.bind(this), end: this.end.bind(this) });
    this.setupBoard();
  };

  MemoryBlocks.prototype.setStatus = function (msg, type) {
    var statusElem = this.statusElem;
    statusElem.textContent = msg || '';
    statusElem.className = type || 'info';

    setTimeout(function () {
      statusElem.className = 'mb_hidden';
    }, 5000);
  };

  MemoryBlocks.prototype.setupBoard = function (levels) {
    var metrics = this.metrics,
        levelMetrics = metrics[levels && levels.currentLevel || 0],
        board = this.board,
        size = this.options.blockSize,
        x = 0, y = 0, m = levelMetrics.col, o = levelMetrics.row, n,
        blocks = {}, ty, sizeFactor = metrics.sizeFactor;

    board.width = levelMetrics.width;
    board.height = levelMetrics.height;

    while (o--) {
      n = m;
      x = 0;
      ty = (y / size).toFixed(0);
      while (n--) {
        this.drawBlock(x, y);
        blocks['' + (x / size).toFixed(0) + ty] = [x, y];

        x = x + sizeFactor;
      }
      y = y + sizeFactor;
    }
    this.blocks = blocks;
  };

  MemoryBlocks.prototype.drawBlock = function (x, y, type) {
    var self = this,
        size = self.options.blockSize,
        ctx = self.context,
        sprite = self.sprite,
        args = [sprite, size, size, x, y, size, size],
        getSprite = {
          blank: [size + 10, 0],
          select: [0, 0],
          invalid: [(size + 10) * 2, 0],
          hint: [(size + 10) * 3, 0]
        };

    splice.apply(args, [1, 0].concat(getSprite[type || 'blank']));
    drawImage.apply(ctx, args);
  };

  MemoryBlocks.prototype.bind = function () {
    var self = this,
        board = self.context.canvas,
        oX = board.offsetLeft,
        oY = board.offsetTop,
        controls = this.controls,
        sizeFactor = self.metrics.sizeFactor,
        filterActive = function (n) { return n !== ''; },
        handleClick = function (e) {
          e = e || event;
          var sX, sY, xy, coord;

          e.preventDefault();

          if (typeof self.possibleClicks === 'undefined') {
            return;
          } else if (self.possibleClicks--) {
            sX = Math.abs(Math.floor((e.clientX - oX) / sizeFactor));
            sY = Math.abs(Math.floor((e.clientY - oY) / sizeFactor));
            xy = '' + sX + sY;
            coord = self.blocks[xy];

            if (self.active.indexOf(xy) !== -1) {
              self.active = self.active.join(',').replace(xy, '').split(',').filter(filterActive);
              self.drawBlock(coord[0], coord[1], 'select');

              if (self.possibleClicks === 0) {
                self.unbind();
                self.levels.nextLevel();
                return;
              }

              if (self.options.showHints) {
                clearTimeout(self.hintTimer);
                self.hintTimer = setTimeout(function () {
                  self.showHint();
                }, (self.options.timeout / 3) * 1000);
              }

              return;
            } else {
              self.drawBlock(coord[0], coord[1], 'invalid');
            }
          }

          self.setStatus('GAME OVER', 'gameover');
          self.stop();
        };

    this.handleClick = handleClick.bind(this);

    board.addEventListener('click', this.handleClick, false);
  };

  MemoryBlocks.prototype.unbind = function () {
    this.active = [];
    delete this.possibleClicks;

    clearTimeout(this.hintTimer);

    this.context.canvas.removeEventListener('click', this.handleClick, false);
  };

  MemoryBlocks.prototype.clear = function () {
    var block = this.blocks, coord,
        metrics = this.metrics,
        levelMetrics = metrics[this.levels.currentLevel],
        col = levelMetrics.col,
        row = levelMetrics.row, r, tc;

    while (col--) {
      r = row;
      tc = col + '';
      while (r--) {
        coord = block[tc + r];

        this.drawBlock(coord[0], coord[1]);
      }
    }
  };

  MemoryBlocks.prototype.startLevel = function (levels) {
    this.setupBoard(levels);
    this.start();
  };

  MemoryBlocks.prototype.start = function () {
    var blocks = this.blocks,
        opt = this.options,
        metrics = this.metrics,
        levelMetrics = metrics[this.levels.currentLevel],
        maxX = levelMetrics.col,
        maxY = levelMetrics.row,
        n = maxX * maxY,
        h = Math.floor(n / 2),
        maxP = Math.floor(Math.random() * n),
        tX, tY, f,
        coord, self = this;
    this.active = [];
    this.statusElem.className = 'mb_hidden';

    if (maxP < h || maxP > n / 3) {
      maxP = h;
    }

    while (maxP--) {
      tX = Math.floor(Math.random() * maxX);
      tY = Math.floor(Math.random() * maxY);
      f = tX + '' + tY;

      if (this.active.indexOf(f) === -1) {
        this.active.push(f);
        coord = blocks[f];
        this.drawBlock(coord[0], coord[1], 'select');
      }
    }

    this.timer = setTimeout(function () {
      self.clear();

      self.possibleClicks = self.active.length;
      self.bind();

    }, opt.timeout * 1000);
  };

  MemoryBlocks.prototype.showHint = function () {
    var hints = this.active,
        hint = hints[Math.floor(Math.random() * hints.length)],
        coord = this.blocks[hint];

    this.drawBlock(coord[0], coord[1], 'hint');
  };

  MemoryBlocks.prototype.end = function (success) {
    var controls = this.controls;

    if (success) {
      this.setStatus('Congratulations!', 'gamecomplete');
    } else {
      this.setStatus('GAME OVER', 'gameover');
    }

    controls.stop.className = 'mb_hidden';
    controls.start.className = '';
    this.setupBoard();
  };

  MemoryBlocks.prototype.stop = function () {
    clearTimeout(this.timer);
    this.levels.end();
    this.unbind();
    this.clear();
  };

  return MemoryBlocks;
});
