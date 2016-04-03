var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Screens = (function () {
    function Screens(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.frame = 0;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
    }
    Screens.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };
    Screens.prototype.drawSprite = function (sprite, x, y) {
        this.ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height, x, y, sprite.width, sprite.height);
    };
    return Screens;
}());
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
        window.setTimeout(function () {
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
    CharaControler.prototype.isDown = function (code) {
        if (this._down[code]) {
            this._down[code] = undefined;
            return true;
        }
        return this.down[code] || false;
    };
    CharaControler.prototype.isPressed = function (code) {
        if (!this.pressed[code] && this.isDown(code)) {
            return this.pressed[code] = true;
        }
        return false;
    };
    CharaControler.prototype.setInputHandeler = function (player, socket, touchKeyboard) {
        var _this = this;
        var touchKeyboardObject = {};
        if (touchKeyboard) {
            var buttons = touchKeyboard.querySelectorAll('[data-key-code]');
            for (var i = 0, val = void 0; val = buttons[i]; ++i) {
                touchKeyboardObject[val.dataset['keyCode']] = val;
            }
        }
        if (socket) {
            socket.emit('add', {
                position: player.position
            });
        }
        var inputStart = function (e) {
            var keyCode = _this.getKeyCode(e);
            if (socket) {
                socket.emit('inputStart', {
                    keyCode: keyCode,
                    // id: socket.id, // サーバー側で追加
                    position: {
                        position: player.position
                    }
                });
            }
            if (touchKeyboardObject[keyCode])
                touchKeyboardObject[keyCode].classList.add('js-hover');
            _this.inputStart(e);
        };
        var inputEnd = function (e) {
            var keyCode = _this.getKeyCode(e);
            if (socket) {
                socket.emit('inputEnd', {
                    keyCode: keyCode,
                    position: player.position
                });
            }
            if (touchKeyboardObject[keyCode])
                touchKeyboardObject[keyCode].classList.remove('js-hover');
            _this.inputEnd(e);
        };
        document.addEventListener("keydown", inputStart);
        document.addEventListener("keyup", inputEnd);
        if (touchKeyboard) {
            if ('ontouchstart' in window) {
                touchKeyboard.addEventListener('touchstart', inputStart, false);
                touchKeyboard.addEventListener('touchend', inputEnd, false);
                touchKeyboard.addEventListener('touchcancel', inputEnd, false);
            }
            else {
                touchKeyboard.addEventListener('mousedown', inputStart, false);
                touchKeyboard.addEventListener('mouseup', inputEnd, false);
                touchKeyboard.addEventListener('mouseout', inputEnd, false);
            }
        }
    };
    return CharaControler;
}());
/// <reference path="Screens.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="CharaControler.ts" />
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
        this.screenLeft = screen.width - sprites[0].width;
        this.screenBottom = screen.height - sprites[0].height;
    }
    Chara.prototype.update = function () {
    };
    Chara.prototype.display = function () {
        this.screen.drawSprite(this.sprites[this.spriteIndex], this.position.x, this.position.y);
    };
    return Chara;
}());
/// <reference path="Chara.ts" />
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.apply(this, arguments);
    }
    Player.prototype.move = function () {
        if (this.control.isDown(37)) {
            this.position.sx -= this.isFly ? 0.1 : 0.4;
        }
        if (this.control.isDown(39)) {
            this.position.sx += this.isFly ? 0.1 : 0.4;
        }
        if (this.control.isDown(38) && !this.isFly) {
            this.isFly = true;
            this.position.sy = -10;
        }
    };
    Player.prototype.update = function () {
        this.setPosition();
        this.updateSprite();
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
/*
 * SyncChara
 * 同期しているCharaのクラス及びその管理
 */
/// <reference path="Chara.ts" />
var SyncChara = (function (_super) {
    __extends(SyncChara, _super);
    function SyncChara() {
        _super.apply(this, arguments);
        this.displayPosition = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0
        };
    }
    SyncChara.prototype.update = function () {
        this.setPosition();
        this.setPosition(this.displayPosition);
        // 通信ラグによるズレを補正
        for (var key in this.position) {
            var difference = (this.position[key] - this.displayPosition[key]) / 2;
            if (Math.abs(difference) > 50) {
                this.displayPosition[key] = this.position[key];
            }
            else {
                this.displayPosition[key] += Math.min(Math.max(difference, -1), 1);
            }
        }
        this.updateSprite();
    };
    SyncChara.prototype.display = function () {
        this.screen.drawSprite(this.sprites[this.spriteIndex], this.displayPosition.x, this.displayPosition.y);
    };
    SyncChara.prototype.move = function () {
        if (this.control.isDown(37)) {
            var sx = this.isFly ? 0.1 : 0.4;
            this.position.sx -= sx;
            this.displayPosition.sx -= sx;
        }
        if (this.control.isDown(39)) {
            var sx = this.isFly ? 0.1 : 0.4;
            this.position.sx += sx;
            this.displayPosition.sx += sx;
        }
        if (this.control.isDown(38) && !this.isFly) {
            this.isFly = true;
            this.position.sy = -10;
            this.displayPosition.sy = -10;
        }
    };
    SyncChara.prototype.sync = function (data) {
        for (var key in data) {
            this.position[key] = data[key];
        }
    };
    SyncChara.each = function (func) {
        for (var id in this.charas) {
            func(this.charas[id]);
        }
    };
    SyncChara.getChara = function (id) {
        var chara = this.charas[id];
        if (!chara) {
            return this.charas[id] = new this(teacheresSprite, display);
        }
        return chara;
    };
    SyncChara.remove = function (id) {
        this.charas[id] = null;
        delete this.charas[id];
    };
    // static //
    // SyncCharaの管理
    SyncChara.charas = {};
    return SyncChara;
}(Player));
/**
 * Game
 */
var Game = (function () {
    function Game(update, render) {
        this.update = update;
        this.render = render;
    }
    Game.prototype.run = function () {
        this.update();
        this.render();
        // window.setTimeout(loop, 1000 / 60);
        // window.requestAnimationFrame(this.run);
        this.animationFrame(this.run);
    };
    return Game;
}());
Game.prototype.animationFrame = function () {
    var list = [
        'requestAnimationFrame',
        'webkitRequestAnimationFrame',
        'mozRequestAnimationFrame'
    ];
    var _loop_1 = function(val) {
        if (window[val]) {
            return { value: function (callback) {
                window[val](callback.bind(this));
            } };
        }
    };
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var val = list_1[_i];
        var state_1 = _loop_1(val);
        if (typeof state_1 === "object") return state_1.value;
    }
    return function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };
}();
/// <reference path="socket.io-client.d.ts" />
/// <reference path="Screens.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="Player.ts" />
/// <reference path="SyncChara.ts" />
/// <reference path="Game.ts" />
var display = new Screens(document.getElementById('canvas'), 500, 500);
var socket = io.connect();
var player;
var game;
var teacheresSprite;
var img = new Image();
img.addEventListener('load', function () {
    teacheresSprite = [
        new Sprite(this, 0, 0, 60, 100),
        new Sprite(this, 60, 0, 60, 100),
        new Sprite(this, 120, 0, 60, 100)
    ];
    init();
    game = new Game(update, render);
    game.run();
});
img.src = 'sprite.png';
function init() {
    player = new Player(teacheresSprite, display);
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));
}
function update() {
    ++display.frame;
    display.clear();
    player.move();
    player.update();
    SyncChara.each(function (chara) {
        chara.move();
        chara.update();
    });
}
function render() {
    SyncChara.each(function (chara) {
        chara.display();
    });
    player.display();
}
socket.on('update', function (data) {
    SyncChara.getChara(data.id).sync(data.position);
});
socket.on('inputStart', function (data) {
    var chara = SyncChara.getChara(data.id);
    chara.control.inputStart(data.keyCode);
    chara.sync(data.position);
});
socket.on('inputEnd', function (data) {
    var chara = SyncChara.getChara(data.id);
    chara.control.inputEnd(data.keyCode);
    chara.sync(data.position);
});
socket.on('remove', function (data) {
    SyncChara.remove(data.id);
});
socket.on('request-update', function () {
    socket.emit('update', {
        position: player.position
    });
});

