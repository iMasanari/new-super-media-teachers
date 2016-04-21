/// <reference path="tsd/socket.io-client.d.ts" />

/// <reference path="Screens.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="CharaControler.ts" />
/// <reference path="Player.ts" />
/// <reference path="OtherPlayer.ts" />
/// <reference path="Enemy.ts" />
/// <reference path="Usagi.ts" />

let display = new Screens(
    <HTMLCanvasElement>document.getElementById('canvas'),
    500, 500
);
let socket = io.connect();

let teacheresSprites = [];
let piyoSprite;
let usagiSprite;

// コールバック地獄！ 後で直す
imageLoad('sprite.png', function () {
    teacheresSprites[0] = [
        new Sprite(this, 0, 0, 60, 104),
        new Sprite(this, 64, 0, 60, 104),
        new Sprite(this, 128, 0, 60, 104)
    ];
    teacheresSprites[1] = [
        new Sprite(this, 0, 108, 60, 104),
        new Sprite(this, 64, 108, 60, 104),
        new Sprite(this, 128, 108, 60, 104)
    ];

    imageLoad('enemy.png', function () {
        piyoSprite = [
            // new Sprite(this, 14, 0, 96 - 28, 96),
            new Sprite(this, 96 + 14, 0, 96 - 28, 96),
            new Sprite(this, 96 * 2 + 14, 0, 96 - 28, 96),
            new Sprite(this, 96 * 3 + 14, 0, 96 - 28, 96)
        ];
        
        imageLoad('usagi.png', function () {
            usagiSprite = [
                new Sprite(this, 0, 0, 90, 171),
                new Sprite(this, 90, 0, 90, 171)
            ];

            init();
            run();
        });
    });
});

function imageLoad(src: string, callback: () => void) {
    let img = new Image();

    img.addEventListener('load', callback);
    img.src = src;
}

let player: Player;
let otherPlayers: OtherPlayerBuilder;
let enemys: EnemyBuilder;

function init() {
    let i = Math.random() * 2 | 0
    player = new Player(teacheresSprites[i], display);
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));

    otherPlayers = new OtherPlayerBuilder(teacheresSprites[i], display);
    enemys = new EnemyBuilder(display);

    setSocketEvent();
}

let time = new Date().getTime(),
    fps = 50;

function _run() {
    let _time = new Date().getTime();

    fps = 1000 / (_time - time);
    time = _time;

    update();
    render();

    window.setTimeout(_run, 1000 / 60);
    // animationFrame(run);
}
let run = (function() {
    var loops = 0;
    var skipTicks = 1000 / fps;
    var maxFrameSkip = 10;
    var nextGameTick = Date.now();

    return function() {
        loops = 0;

        while (Date.now() > nextGameTick && loops < maxFrameSkip) {
            update();
            nextGameTick += skipTicks;
            loops++;
        }

        render();
    };
})();

// Start the game loop
let _intervalId = setInterval(run, 0);

let isPlay = true;

function update() {
    ++display.frame;
    display.clear();

    if (isPlay) {
        player.update();
    } else {
        otherPlayers.update();
    }
    enemys.update(player);
}
function render() {
    // 地面の描写
    let ctx = display.ctx,
        y = display.height - 100;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(display.width, y);
    ctx.stroke();

    if (isPlay) {
        player.display();
    } else {
        otherPlayers.display();
    }
    enemys.display();
}

function setSocketEvent() {
    socket.on('update', function (data: socketData) {
        otherPlayers.getPlayer(data.id).sync(data.position);
    });
    socket.on('inputStart', function (data: socketData) {
        let chara = otherPlayers.getPlayer(data.id);

        chara.control.inputStart(data.keyCode);
        chara.sync(data.position);
    });
    socket.on('inputEnd', function (data: socketData) {
        let chara = otherPlayers.getPlayer(data.id);

        chara.control.inputEnd(data.keyCode);
        chara.sync(data.position);
    });
    socket.on('addEnemy', function () {
        enemys.add();
    });
    socket.on('request-update', function (data?: socketData) {
        socket.emit('update', {
            position: player.position
        });

        if (data) {
            otherPlayers.getPlayer(data.id).sync(data.position);
        }
    });
    socket.on('remove', function (id: string) {
        otherPlayers.remove(id);
    });
}

// iPhoneでスクロール中にアニメーションが止まるので、スクロールさせない等
document.addEventListener('touchstert', function (e) { e.preventDefault(); });
document.addEventListener('touchmove', function (e) { e.preventDefault(); });
document.addEventListener('touchend', function (e) { e.preventDefault(); });

interface socketData {
    id: string,
    keyCode: number,
    position: Chara.Position
}
function ElementRequestFullscreen(element) {
    let list = [
        "requestFullscreen",
        "webkitRequestFullScreen",
        "mozRequestFullScreen",
        "msRequestFullscreen"
    ];

    for (let i = 0, num = list.length; i < num; i++) {
        if (element[list[i]]) {
            element[list[i]]();
            return true;
        }
    }
    return false;
}

document.getElementById('fullscreen').addEventListener('click', function () {
    ElementRequestFullscreen(document.getElementById('canvas'));
})