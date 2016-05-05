var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Sprite = (function () {
    function Sprite(img, x, y, width, height, size) {
        if (size === void 0) { size = 1; }
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.size = size;
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
        this.ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height, x, y, sprite.width * sprite.size, sprite.height * sprite.size);
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
        player.emit();
        var inputStart = function (e) {
            var keyCode = _this.getKeyCode(e);
            _this.inputStart(keyCode);
            player.emit('inputStart', { keyCode: keyCode });
        };
        var inputEnd = function (e) {
            var keyCode = _this.getKeyCode(e);
            _this.inputEnd(keyCode);
            player.emit('inputEnd', { keyCode: keyCode });
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
        var keypadNumber = null;
        var touchInputStart = function (e) {
            var target = e.target;
            if (target.classList.contains('jump')) {
                inputStart(38);
            }
            else if (target.classList.contains('keypad')) {
                var val = e.targetTouches[0];
                var x = val.pageX - target.offsetLeft;
                keypadNumber = x < 166 ? 37 : 39;
                inputStart(keypadNumber);
            }
        };
        var touchInputMove = function (e) {
            var target = e.target;
            if (target.classList.contains('jump')) {
                inputStart(38);
            }
            else if (target.classList.contains('keypad')) {
                var val = e.targetTouches[0];
                var x = val.pageX - target.offsetLeft;
                var _keypadNumber = (x < 166 ? 37 : 39);
                if (keypadNumber !== _keypadNumber) {
                    inputEnd(keypadNumber);
                    inputStart(keypadNumber = _keypadNumber);
                }
            }
        };
        var touchInputEnd = function (e) {
            var target = e.target;
            if (target.classList.contains('jump')) {
                inputEnd(38);
            }
            else if (target.classList.contains('keypad')) {
                inputEnd(keypadNumber);
            }
        };
        window.addEventListener('blur', inputReset);
        if (touchKeyboard) {
            touchKeyboard.style.display = null;
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
        this.width = sprites[0].width * sprites[0].size;
        this.height = sprites[0].height * sprites[0].size;
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
var _Player = (function (_super) {
    __extends(_Player, _super);
    function _Player() {
        _super.apply(this, arguments);
    }
    _Player.prototype.move = function () {
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
    _Player.prototype.update = function () {
        this.move();
        this.setPosition();
        this.updateSprite();
    };
    _Player.prototype.setPosition = function (target) {
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
    _Player.prototype.updateSprite = function () {
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
    return _Player;
}(Chara));
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        _super.apply(this, arguments);
        this.point = 0;
        this.maxPoint = 0;
        this.prevPoint = 0;
    }
    Player.prototype.display = function () {
        var ctx = this.screen.ctx;
        ctx.font = '30px "8dot", sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillRect(250, 10, 240, 130);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(252, 12, 236, 130 - 4);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('Max:', 260, 85);
        ctx.fillText('Prev:', 260, 125);
        ctx.textAlign = 'right';
        ctx.fillText(this.maxPoint + ' pt', 480, 85);
        ctx.fillText(this.prevPoint + ' pt', 480, 125);
        ctx.fillText(this.point + ' pt', 480, 45);
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';
        _super.prototype.display.call(this);
    };
    Player.prototype.dead = function () {
        this.position = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0
        };
        this.isFly = true;
        player.prevPoint = player.point;
        player.point = 0;
        this.emit();
    };
    Player.prototype.emit = function (type, data) {
        if (type === void 0) { type = 'update'; }
        if (!socket || !isPlay)
            return;
        var sendData = {
            team: this.teamNumber,
            chara: this.charaNumber,
            position: {
                x: this.position.x | 0,
                y: this.position.y | 0,
                sx: (this.position.sx * 100 | 0) / 100,
                sy: (this.position.sy * 100 | 0) / 100
            }
        };
        for (var key in data) {
            sendData[key] = data[key];
        }
        socket.emit(type, sendData);
    };
    Player.prototype.getPoint = function (point) {
        if (!isPlay)
            return;
        this.point += point;
        this.maxPoint = Math.max(this.maxPoint, this.point);
        socket.emit('point', {
            team: this.teamNumber,
            chara: this.charaNumber,
            point: point
        });
    };
    return Player;
}(_Player));
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
                this._position.sy = -9;
                this.position.sy = -9;
            }
        }
    };
    OtherPlayer.prototype.sync = function (data) {
        for (var key in data) {
            this._position[key] = data[key];
        }
    };
    return OtherPlayer;
}(_Player));
var pointList;
var OtherPlayerBuilder = (function () {
    function OtherPlayerBuilder(sprites, screen) {
        this.sprites = sprites;
        this.screen = screen;
        this.list = {};
    }
    OtherPlayerBuilder.prototype.getPlayer = function (id, createData) {
        var chara = this.list[id];
        if (!chara) {
            chara = this.list[id] = new OtherPlayer(this.sprites, this.screen);
            chara.sprites = sprites.teacher[createData.chara][createData.team];
            chara.teamNumber = createData.team;
            ++pointList[createData.team].playerNum;
        }
        return chara;
    };
    OtherPlayerBuilder.prototype.remove = function (id) {
        if (this.list[id]) {
            --pointList[this.list[id].teamNumber].playerNum;
        }
        this.list[id] = null;
        delete this.list[id];
    };
    OtherPlayerBuilder.prototype.update = function () {
        for (var id in this.list) {
            this.list[id].update();
        }
    };
    OtherPlayerBuilder.prototype.display = function () {
        for (var id in this.list) {
            this.list[id].display();
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
        if (!isPlay)
            return;
        if (!this.isAddedPoint) {
            if (player.position.x > this.position.x) {
                var point = this.point * (1 + player.position.x / player.screenLeft) | 0;
                player.getPoint(point);
                this.isAddedPoint = true;
                this.pointPosition = {
                    point: point,
                    x: this.position.x + 30,
                    y: (this.position.y + player.position.y + player.height) / 2,
                    opacity: 130
                };
            }
        }
        else if (this.pointPosition && this.pointPosition.opacity) {
            var ctx = this.screen.ctx;
            ctx.font = '30px "8dot", sans-serif';
            ctx.textAlign = 'center';
            ctx.globalAlpha = this.pointPosition.opacity / 100;
            this.pointPosition.opacity -= 5;
            ctx.fillText('+' + this.pointPosition.point, this.pointPosition.x, this.pointPosition.y);
            this.pointPosition.y += -3;
            ctx.globalAlpha = 1;
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
                player.dead();
                this.list = [];
                break;
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
        this.speed = 3;
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
        this.isFly = false;
        this.count = 0;
    }
    Ae.prototype.move = function () {
        _super.prototype.move.call(this);
        if (this.screenBottom <= this.position.y) {
            if (++this.count > 30) {
                this.count = 0;
                this.position.sy = -10;
                this.position.y += this.position.sy;
                this.isFly = true;
            }
        }
        else {
            this.position.sy += 0.2;
            this.position.y += this.position.sy;
            if (this.screenBottom < this.position.y) {
                this.position.y = this.screenBottom;
                this.isFly = false;
            }
        }
    };
    Ae.prototype.updateSprite = function () {
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
var display = new Game(document.getElementById('canvas'), 500, 500);
var socket = io.connect();
var sprites = {};
imageLoad('img/mmddots.png', function () {
    sprites.teacher = [[], []];
    for (var i = 0; i < 6; ++i) {
        sprites.teacher[0][i] = [
            new Sprite(this, 0, 108 * i, 60, 104),
            new Sprite(this, 64, 108 * i, 60, 104),
            new Sprite(this, 128, 108 * i, 60, 104)
        ];
        sprites.teacher[1][i] = [
            new Sprite(this, 192, 108 * i, 60, 104),
            new Sprite(this, 256, 108 * i, 60, 104),
            new Sprite(this, 320, 108 * i, 60, 104)
        ];
    }
    imageLoad('img/adobe.png', function () {
        sprites.ai = [
            new Sprite(this, 0, 0, 60, 104, 1.4),
            new Sprite(this, 64, 0, 60, 104, 1.4)
        ];
        sprites.ps = [
            new Sprite(this, 0, 108, 60, 104),
            new Sprite(this, 64, 108, 60, 104)
        ];
        sprites.pr = [
            new Sprite(this, 0, 216, 60, 104),
            new Sprite(this, 64, 216, 60, 104)
        ];
        sprites.ae = [
            new Sprite(this, 0, 324, 60, 104),
            new Sprite(this, 64, 324, 60, 104),
            new Sprite(this, 128, 324, 60, 104)
        ];
        init();
        display.run();
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
var isPlay = false;
function init() {
    player = new Player(sprites.teacher[0][0], display);
    player.position.y = -100;
    otherPlayers = new OtherPlayerBuilder(sprites.teacher[0][0], display);
    enemys = new EnemyBuilder(display);
    setSocketEvent();
    var playInput = document.getElementById('play');
    if (playInput) {
        playInput.textContent = 'スタート！';
        playInput.classList.remove('js-disabled');
    }
}
var gameOption = document.getElementById('game-option');
if (gameOption) {
    gameOption.addEventListener('touchstert', function (e) { e.stopPropagation(); }, true);
    gameOption.addEventListener('touchmove', function (e) { e.stopPropagation(); }, true);
    gameOption.addEventListener('touchend', function (e) { e.stopPropagation(); }, true);
    var charaInputs_1 = document.getElementsByName('chara');
    var teamInputs_1 = document.getElementsByName('team');
    var playInput_1 = document.getElementById('play');
    var thmb_1 = document.getElementById('player-thmb');
    var onclick_1 = function () {
        var charaNumber = getCheckedRadio(charaInputs_1), teamNumber = getCheckedRadio(teamInputs_1);
        thmb_1.style.backgroundPosition =
            (+charaNumber ? -192 : 0) + "px " + -108 * +teamNumber + "px";
        if (charaNumber != null && teamNumber != null) {
            playInput_1.style.display = null;
        }
    };
    [].forEach.call(charaInputs_1, function (val) {
        val.addEventListener('change', onclick_1);
    });
    [].forEach.call(teamInputs_1, function (val) {
        val.addEventListener('change', onclick_1);
    });
    playInput_1.addEventListener('click', function () {
        var charaNumber = getCheckedRadio(charaInputs_1), teamNumber = getCheckedRadio(teamInputs_1);
        if (charaNumber == null ||
            teamNumber == null ||
            playInput_1.classList.contains('js-disabled') ||
            !window.confirm('ゲームを開始します。よろしいですか')) {
            return;
        }
        player.sprites = sprites.teacher[charaNumber][teamNumber];
        player.teamNumber = +teamNumber;
        player.charaNumber = +charaNumber;
        isPlay = true;
        player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));
        gameOption.style.display = 'none';
        enemys.list = [];
    }, false);
}
function getCheckedRadio(name) {
    var nodelist = (typeof name === 'string') ?
        document.getElementsByName(name) : name;
    for (var i = 0, val = void 0; val = nodelist[i]; ++i) {
        if (val.checked) {
            return val.value;
        }
    }
    return null;
}
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
var pointUpdate;
var _isGameover;
_isGameover = _isGameover || false;
function render() {
    var ctx = display.ctx, y = display.height - 100;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(display.width, y);
    ctx.stroke();
    if (pointUpdate) {
        pointUpdate();
    }
    if (isPlay) {
        player.display();
    }
    else {
        otherPlayers.display();
    }
    enemys.display();
    if (_isGameover) {
        ctx.fillStyle = '#000';
        ctx.textAlign = 'left';
        ctx.font = '100px "8x8", sans-serif';
        ctx.fillText('Game Over!', 10, 250);
    }
}
function setSocketEvent() {
    socket.on('update', function (data) {
        otherPlayers.getPlayer(data.id, data).sync(data.position);
    });
    socket.on('inputStart', function (data) {
        var otherPlayer = otherPlayers.getPlayer(data.id, data);
        otherPlayer.control.inputStart(data.keyCode);
        otherPlayer.sync(data.position);
    });
    socket.on('inputEnd', function (data) {
        var otherPlayer = otherPlayers.getPlayer(data.id, data);
        otherPlayer.control.inputEnd(data.keyCode);
        otherPlayer.sync(data.position);
    });
    socket.on('addEnemy', function (name) {
        enemys.add(name);
    });
    socket.on('request-update', function (data) {
        if (isPlay) {
            socket.emit('update', {
                position: player.position
            });
        }
        if (data) {
            otherPlayers.getPlayer(data.id, data).sync(data.position);
        }
    });
    socket.on('game-start', function (data) {
        if (isPlay && player) {
            player.point = 0;
        }
    });
    socket.on('set-life', function (num) {
        if (isPlay && player) {
        }
    });
    socket.on('remove', function (id) {
        otherPlayers.remove(id);
    });
}
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
