var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Sprite = (function () {
    function Sprite(img, x, y, width, height) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return Sprite;
}());
var Game = (function () {
    function Game(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.frame = 0;
        this.fps = 50;
        this.maxFrameSkip = 10;
        this.skipTicks = 1000 / this.fps;
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
    }
    Game.prototype.run = function () {
        var _this = this;
        var loop = function () {
            var loopCount = 0;
            var now = Date.now();
            if (now - _this.nextGameTick < 1000) {
                while (now > _this.nextGameTick && loopCount < _this.maxFrameSkip) {
                    update();
                    _this.nextGameTick += _this.skipTicks;
                    loopCount++;
                }
            }
            else {
                console.log('skip!!');
                enemys.list = [];
                _this.nextGameTick = now;
            }
            render();
            _this.requestAnimationFrame(loop);
        };
        this.nextGameTick = Date.now();
        loop();
    };
    Game.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };
    Game.prototype.drawSprite = function (sprite, x, y) {
        this.ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height, x, y, sprite.width, sprite.height);
    };
    return Game;
}());
Game.prototype.requestAnimationFrame = (function () {
    var list = [
        'requestAnimationFrame',
        'webkitRequestAnimationFrame',
        'mozRequestAnimationFrame',
        'oRequestAnimationFrame',
        'msRequestAnimationFrame'
    ];
    var _loop_1 = function(i, val) {
        if (window[val]) {
            console.log('use ' + val);
            return { value: function (callback) {
                window[val](callback);
            } };
        }
    };
    for (var i = 0, val = void 0; val = list[i]; ++i) {
        var state_1 = _loop_1(i, val);
        if (typeof state_1 === "object") return state_1.value;
    }
    console.log('use setTimeout');
    return function (callback) {
        window.setTimeout(callback, 30);
    };
})();
var CharaControler = (function () {
    function CharaControler() {
        this.down = {};
        this._down = {};
        this.pressed = {};
    }
    CharaControler.prototype.inputStart = function (_code) {
        var _this = this;
        var code = this.getKeyCode(_code);
        if (this.down[code])
            return;
        this.down[code] = true;
        this._down[code] = true;
        window.clearTimeout(this.timerId);
        this.timerId = window.setTimeout(function () {
            _this._down[code] = undefined;
        }, 1000);
    };
    CharaControler.prototype.inputEnd = function (_code) {
        var code = this.getKeyCode(_code);
        this.down[code] = undefined;
        this.pressed[code] = undefined;
    };
    CharaControler.prototype.getKeyCode = function (code) {
        var keyCode = (typeof code === 'number') ?
            code : code.keyCode || +code.target.dataset.keyCode;
        if (keyCode === 32) {
            return 38;
        }
        return keyCode;
    };
    ;
    CharaControler.prototype.isDown = function (code) {
        if (this._down[code]) {
            this._down[code] = undefined;
            return true;
        }
        return this.down[code] || false;
    };
    ;
    CharaControler.prototype.isPressed_bata = function (code) {
        if (!this.pressed[code] && this.isDown(code)) {
            return this.pressed[code] = true;
        }
        return false;
    };
    CharaControler.prototype.setInputHandeler = function (player, socket, touchKeyboard) {
        var _this = this;
        if (socket) {
            socket.emit('add', {
                position: player.position
            });
        }
        var inputStart = function (e) {
            var keyCode = _this.getKeyCode(e);
            _this.inputStart(keyCode);
            if (socket) {
                socket.emit('inputStart', {
                    keyCode: keyCode,
                    position: {
                        position: {
                            x: player.position.x | 0,
                            y: player.position.y | 0,
                            sx: (player.position.sx * 100 | 0) / 100,
                            sy: (player.position.sy * 100 | 0) / 100
                        }
                    }
                });
            }
        };
        var inputEnd = function (e) {
            var keyCode = _this.getKeyCode(e);
            _this.inputEnd(keyCode);
            if (socket) {
                socket.emit('inputEnd', {
                    keyCode: keyCode,
                    position: {
                        x: player.position.x | 0,
                        y: player.position.y | 0,
                        sx: (player.position.sx * 100 | 0) / 100,
                        sy: (player.position.sy * 100 | 0) / 100
                    }
                });
            }
        };
        var inputReset = function () {
            _this.down = {};
            _this._down = {};
            _this.pressed = {};
            if (socket) {
                socket.emit('remove');
            }
        };
        document.addEventListener("keydown", inputStart);
        document.addEventListener("keyup", inputEnd);
        var inputNumber = null;
        var touchInputStart = function (e) {
            var target = e.target;
            if (target.innerHTML === 'Jump') {
                inputStart(e);
            }
            else {
                var val = e.targetTouches[0];
                var x = val.pageX - target.offsetLeft;
                inputNumber = x < 166 ? 37 : 39;
                inputStart(inputNumber);
            }
        };
        var touchInputMove = function (e) {
            var target = e.target;
            if (target.innerHTML === 'Jump') {
                inputStart(e);
            }
            else {
                var val = e.targetTouches[0];
                var x = val.pageX - target.offsetLeft;
                var _inputNumber = x < 166 ? 37 : 39;
                if (inputNumber !== _inputNumber) {
                    inputNumber = _inputNumber;
                    inputStart(_inputNumber);
                    inputEnd(x > 166 ? 37 : 39);
                }
            }
        };
        var touchInputEnd = function (e) {
            var target = e.target;
            if (target.innerHTML === 'Jump') {
                inputEnd(e);
            }
            else {
                inputEnd(37);
                inputEnd(39);
            }
        };
        window.addEventListener('blur', inputReset);
        if (touchKeyboard) {
            if ('ontouchstart' in window) {
                touchKeyboard.addEventListener('touchstart', touchInputStart, false);
                touchKeyboard.addEventListener('touchmove', touchInputMove, false);
                touchKeyboard.addEventListener('touchend', touchInputEnd, false);
                touchKeyboard.addEventListener('touchcancel', touchInputEnd, false);
            }
            else {
            }
        }
    };
    ;
    return CharaControler;
}());
var Chara = (function () {
    function Chara(sprites, screen) {
        this.sprites = sprites;
        this.screen = screen;
        this.control = new CharaControler;
        this.spriteIndex = 0;
        this.position = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0
        };
        this.width = sprites[0].width;
        this.height = sprites[0].height;
        this.screenLeft = screen.width - this.width;
        this.screenBottom = screen.height - this.height - 100;
        this.r = Math.min(this.width, this.height) / 2 - 2;
    }
    Chara.prototype.update = function () { };
    Chara.prototype.display = function () {
        this.screen.drawSprite(this.sprites[this.spriteIndex], this.position.x, this.position.y);
    };
    ;
    return Chara;
}());
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.apply(this, arguments);
        this.point = 0;
        this.maxPoint = 0;
    }
    Player.prototype.move = function () {
        if (this.control.isDown(37)) {
            this.position.sx -= this.isFly ? 0.1 : 0.4;
        }
        if (this.control.isDown(39)) {
            this.position.sx += this.isFly ? 0.1 : 0.4;
        }
        if (this.control.isDown(38)) {
            if (this.isFly) {
                this.position.sy -= 0.1;
            }
            else {
                this.isFly = true;
                this.position.sy = -9;
            }
        }
        if (this.control.isDown(40)) {
            if (this.isFly) {
                this.position.sy += 0.2;
            }
        }
    };
    Player.prototype.update = function () {
        this.move();
        this.setPosition();
        this.updateSprite();
    };
    Player.prototype.display = function () {
        var ctx = this.screen.ctx;
        _super.prototype.display.call(this);
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(this.point.toFixed(0), 500 - 10, 50);
        ctx.font = '25px sans-serif';
        ctx.fillText('MAX: ' + Math.max(this.maxPoint, this.point), 500 - 200, 40);
    };
    Player.prototype.setPosition = function (target) {
        if (target === void 0) { target = this.position; }
        target.x += target.sx;
        target.sx = Math.min(Math.max(target.sx * (this.isFly ? 0.98 : 0.9), -4), 4);
        target.y += target.sy;
        target.sy += 0.3;
        if (target.x < 0) {
            target.x = 0;
            target.sx *= -1;
        }
        else if (this.screenLeft < target.x) {
            target.x = this.screenLeft;
            target.sx *= -1;
        }
        if (target.y < 0) {
        }
        else if (this.screenBottom < target.y) {
            target.y = this.screenBottom;
            target.sy = 0;
            this.isFly = false;
        }
    };
    Player.prototype.updateSprite = function () {
        if (this.isFly) {
            this.spriteIndex = 2;
        }
        else if (this.spriteIndex === 2) {
            this.spriteIndex = 0;
        }
        else if (this.screen.frame % 20 === 0) {
            this.spriteIndex = this.spriteIndex ? 0 : 1;
        }
    };
    return Player;
}(Chara));
var OtherPlayer = (function (_super) {
    __extends(OtherPlayer, _super);
    function OtherPlayer() {
        _super.apply(this, arguments);
        this._position = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0
        };
    }
    OtherPlayer.prototype.update = function () {
        this.move();
        this.setPosition();
        this.setPosition(this._position);
        for (var key in this.position) {
            var difference = (this._position[key] - this.position[key]) / 2;
            if (Math.abs(difference) > 50) {
                this.position[key] = this._position[key];
            }
            else {
                this.position[key] += Math.min(Math.max(difference, -1), 1);
            }
        }
        this.updateSprite();
    };
    OtherPlayer.prototype.move = function () {
        if (this.control.isDown(37)) {
            var sx = this.isFly ? 0.1 : 0.4;
            this.position.sx -= sx;
            this._position.sx -= sx;
        }
        if (this.control.isDown(39)) {
            var sx = this.isFly ? 0.1 : 0.4;
            this.position.sx += sx;
            this._position.sx += sx;
        }
        if (this.control.isDown(38)) {
            if (this.isFly) {
                this.position.sy -= 0.1;
                this._position.sy -= 0.1;
            }
            else {
                this.isFly = true;
                this._position.sy = -10;
                this.position.sy = -10;
            }
        }
    };
    OtherPlayer.prototype.sync = function (data) {
        for (var key in data) {
            this._position[key] = data[key];
        }
    };
    return OtherPlayer;
}(Player));
var OtherPlayerBuilder = (function () {
    function OtherPlayerBuilder(sprites, screen) {
        this.sprites = sprites;
        this.screen = screen;
        this.players = {};
    }
    OtherPlayerBuilder.prototype.getPlayer = function (id) {
        var chara = this.players[id];
        if (!chara) {
            return this.players[id] = new OtherPlayer(this.sprites, this.screen);
        }
        return chara;
    };
    OtherPlayerBuilder.prototype.remove = function (id) {
        this.players[id] = null;
        delete this.players[id];
    };
    OtherPlayerBuilder.prototype.update = function () {
        for (var id in this.players) {
            this.players[id].update();
        }
    };
    OtherPlayerBuilder.prototype.display = function () {
        for (var id in this.players) {
            this.players[id].display();
        }
    };
    return OtherPlayerBuilder;
}());
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(sprites, screen) {
        _super.call(this, sprites, screen);
        this.speed = 4;
        this.point = 50;
        this.isAddedPoint = false;
        this.pointPosition = null;
        this.position.x = screen.width;
        this.position.y = this.screenBottom;
        this.spritesLen = sprites.length;
    }
    Enemy.prototype.update = function () {
        this.move();
        this.pointCheck();
        this.updateSprite();
    };
    Enemy.prototype.move = function () {
        this.position.x -= this.speed;
    };
    Enemy.prototype.pointCheck = function () {
        var _this = this;
        if (!isPlay)
            return;
        if (!this.isAddedPoint) {
            if (player.position.x > this.position.x) {
                var point = this.point * (1 + player.position.x / player.screenLeft) | 0;
                player.point += point;
                this.isAddedPoint = true;
                this.pointPosition = {
                    point: point,
                    x: this.position.x + 30,
                    y: this.position.y - 20,
                    opacity: 130
                };
                window.setTimeout(function () {
                    _this.pointPosition = null;
                }, 1000);
            }
        }
        else if (this.pointPosition && this.pointPosition.opacity) {
            var ctx = this.screen.ctx;
            ctx.font = '30px sans-serif';
            ctx.textAlign = 'center';
            ctx.globalAlpha = this.pointPosition.opacity / 100;
            ctx.fillStyle = '#fff';
            this.pointPosition.opacity -= 5;
            ctx.fillText('+' + this.pointPosition.point, this.pointPosition.x, this.pointPosition.y);
            ctx.strokeText('+' + this.pointPosition.point, this.pointPosition.x, this.pointPosition.y);
            this.pointPosition.y += -3;
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#000';
        }
    };
    Enemy.prototype.updateSprite = function () {
        if (this.screen.frame % 20 === 0) {
            this.spriteIndex = (this.spriteIndex + 1) % this.spritesLen;
        }
    };
    Enemy.prototype.isHit = function (chara) {
        var a = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
            r: this.r
        }, b = {
            x: chara.position.x + chara.width / 2,
            y: chara.position.y + chara.height / 2,
            r: chara.r
        };
        return Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2) <= Math.pow((a.r + b.r), 2);
    };
    Enemy.prototype.isDead = function () {
        return this.position.x < -this.width;
    };
    return Enemy;
}(Chara));
var EnemyBuilder = (function () {
    function EnemyBuilder(screen) {
        this.screen = screen;
        this.list = [];
    }
    EnemyBuilder.prototype.add = function (name) {
        this.list.push(new window[name](this.screen));
    };
    EnemyBuilder.prototype.remove = function (n) {
        this.list.splice(n, 1);
    };
    EnemyBuilder.prototype.update = function (player) {
        for (var i = 0, enemy = void 0; enemy = this.list[i]; ++i) {
            enemy.update();
            if (enemy.isHit(player)) {
                player.sprites = sprites.teacher[Math.random() * 2 | 0];
                player.position = {
                    x: 0,
                    y: 0,
                    sx: 0,
                    sy: 0
                };
                player.maxPoint = Math.max(player.point, player.maxPoint);
                player.point = 0;
                player.isFly = true;
                this.list = [];
                if (socket) {
                    socket.emit('add', {
                        position: player.position
                    });
                }
            }
            else if (enemy.isDead()) {
                this.remove(i--);
            }
        }
    };
    EnemyBuilder.prototype.display = function () {
        for (var i = 0, enemy = void 0; enemy = this.list[i]; ++i) {
            enemy.display();
        }
    };
    return EnemyBuilder;
}());
var Usagi = (function (_super) {
    __extends(Usagi, _super);
    function Usagi(screens) {
        _super.call(this, sprites.usagi, screens);
        this.speed = 3;
        this.point = 70;
    }
    return Usagi;
}(Enemy));
var Ai = (function (_super) {
    __extends(Ai, _super);
    function Ai(screens) {
        _super.call(this, sprites.ai, screens);
    }
    return Ai;
}(Enemy));
var Ps = (function (_super) {
    __extends(Ps, _super);
    function Ps(screens) {
        _super.call(this, sprites.ps, screens);
    }
    return Ps;
}(Enemy));
var Ae = (function (_super) {
    __extends(Ae, _super);
    function Ae(screens) {
        _super.call(this, sprites.ae, screens);
        this.speed = 1.5;
        this.count = 0;
    }
    Ae.prototype.move = function () {
        _super.prototype.move.call(this);
        if (this.position.y >= this.screenBottom) {
            this.position.y = this.screenBottom;
            if (++this.count > 30) {
                this.count = 0;
                this.position.sy = -10;
                this.position.y += this.position.sy;
            }
        }
        else {
            this.position.sy += 0.2;
            this.position.y += this.position.sy;
        }
    };
    return Ae;
}(Enemy));
var Pr = (function (_super) {
    __extends(Pr, _super);
    function Pr(screens) {
        _super.call(this, sprites.pr, screens);
        this.speed = 2;
    }
    return Pr;
}(Enemy));
var Piyo = (function (_super) {
    __extends(Piyo, _super);
    function Piyo(screens) {
        _super.call(this, sprites.piyo, screens);
        this.speed = 5;
        this.point = 60;
    }
    return Piyo;
}(Enemy));
var display = new Game(document.getElementById('canvas'), 500, 500);
var socket = io.connect();
var sprites = {
    teacher: []
};
imageLoad('sprite.png', function () {
    sprites.teacher[0] = [
        new Sprite(this, 0, 0, 60, 104),
        new Sprite(this, 64, 0, 60, 104),
        new Sprite(this, 128, 0, 60, 104)
    ];
    sprites.teacher[1] = [
        new Sprite(this, 0, 108, 60, 104),
        new Sprite(this, 64, 108, 60, 104),
        new Sprite(this, 128, 108, 60, 104)
    ];
    imageLoad('enemy.png', function () {
        sprites.piyo = [
            new Sprite(this, 96 + 14, 0, 96 - 28, 96),
            new Sprite(this, 96 * 2 + 14, 0, 96 - 28, 96),
            new Sprite(this, 96 * 3 + 14, 0, 96 - 28, 96)
        ];
        imageLoad('usagi.png', function () {
            sprites.usagi = [
                new Sprite(this, 0, 0, 90, 168),
                new Sprite(this, 92, 0, 90, 168)
            ];
            imageLoad('adobe.png', function () {
                sprites.ai = [
                    new Sprite(this, 0, 0, 60, 100),
                    new Sprite(this, 64, 0, 60, 100)
                ];
                sprites.ps = [
                    new Sprite(this, 0, 108, 60, 100),
                    new Sprite(this, 64, 108, 60, 100)
                ];
                sprites.pr = [
                    new Sprite(this, 0, 216, 60, 100),
                    new Sprite(this, 64, 216, 60, 100)
                ];
                sprites.ae = [
                    new Sprite(this, 0, 324, 60, 100),
                    new Sprite(this, 64, 324, 60, 100)
                ];
                imageLoad('usagi-player.png', function () {
                    sprites.teacher[2] = [
                        new Sprite(this, 0, 0, 89, 168),
                        new Sprite(this, 92, 0, 89, 168),
                        new Sprite(this, 186, 0, 89, 168)
                    ];
                    init();
                    display.run();
                });
            });
        });
    });
});
function imageLoad(src, callback) {
    var img = new Image();
    img.addEventListener('load', callback);
    img.src = src;
}
var player;
var otherPlayers;
var enemys;
function init() {
    var i = Math.random() * 2 | 0;
    player = new Player(sprites.teacher[i], display);
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));
    otherPlayers = new OtherPlayerBuilder(sprites.teacher[i], display);
    enemys = new EnemyBuilder(display);
    setSocketEvent();
}
var time = Date.now();
var isPlay = true;
function update() {
    ++display.frame;
    display.clear();
    if (isPlay) {
        player.update();
    }
    else {
        otherPlayers.update();
    }
    enemys.update(player);
}
function render() {
    var ctx = display.ctx, y = display.height - 100;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(display.width, y);
    ctx.stroke();
    if (isPlay) {
        player.display();
    }
    else {
        otherPlayers.display();
    }
    enemys.display();
}
function setSocketEvent() {
    socket.on('update', function (data) {
        otherPlayers.getPlayer(data.id).sync(data.position);
    });
    socket.on('inputStart', function (data) {
        var chara = otherPlayers.getPlayer(data.id);
        chara.control.inputStart(data.keyCode);
        chara.sync(data.position);
    });
    socket.on('inputEnd', function (data) {
        var chara = otherPlayers.getPlayer(data.id);
        chara.control.inputEnd(data.keyCode);
        chara.sync(data.position);
    });
    socket.on('addEnemy', function (name) {
        enemys.add(name);
    });
    socket.on('request-update', function (data) {
        socket.emit('update', {
            position: player.position
        });
        if (data) {
            otherPlayers.getPlayer(data.id).sync(data.position);
        }
    });
    socket.on('remove', function (id) {
        otherPlayers.remove(id);
    });
}
document.addEventListener('touchstert', function (e) { e.preventDefault(); });
document.addEventListener('touchmove', function (e) { e.preventDefault(); });
document.addEventListener('touchend', function (e) { e.preventDefault(); });
function ElementRequestFullscreen(element) {
    var list = [
        "requestFullscreen",
        "webkitRequestFullScreen",
        "mozRequestFullScreen",
        "msRequestFullscreen"
    ];
    for (var i = 0, num = list.length; i < num; i++) {
        if (element[list[i]]) {
            element[list[i]]();
            return true;
        }
    }
    return false;
}
document.getElementById('fullscreen').addEventListener('click', function () {
    ElementRequestFullscreen(document.getElementById('canvas'));
});
