/// <reference path="tsd/socket.io-client.d.ts" />

/// <reference path="Screens.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="CharaControler.ts" />
/// <reference path="Player.ts" />
/// <reference path="OtherPlayer.ts" />
/// <reference path="Enemy.ts" />

let display = new Screens(
    <HTMLCanvasElement>document.getElementById('canvas'),
    500, 500
);
let socket = io.connect();

let teacheresSprite;
let enemysSprite;

imageLoad('sprite.png', function () {
    teacheresSprite = [
        new Sprite(this, 0, 0, 60, 100),
        new Sprite(this, 60, 0, 60, 100),
        new Sprite(this, 120, 0, 60, 100)
        // new Sprite(this, 0, 0, 60, 104),
        // new Sprite(this, 60, 0, 60, 104),
        // new Sprite(this, 120, 0, 60, 104)
    ];

    // imageLoad('enemy.png', function () {
    //     enemysSprite = [
    //         // new Sprite(this, 14, 0, 96 - 28, 96),
    //         new Sprite(this, 96 + 14, 0, 96 - 28, 96),
    //         new Sprite(this, 96 * 2 + 14, 0, 96 - 28, 96),
    //         new Sprite(this, 96 * 3 + 14, 0, 96 - 28, 96)
    //     ];
    imageLoad('usagi.png', function () {
        enemysSprite = [
            new Sprite(this, 0, 0, 90, 171),
            new Sprite(this, 90, 0, 90, 171),
            // new Sprite(this, 200, 0, 100, 180)
        ];
        
        init();
        run();
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
    player = new Player(teacheresSprite, display);
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));

    otherPlayers = new OtherPlayerBuilder(teacheresSprite, display);
    enemys = new EnemyBuilder(enemysSprite, display);

    setSocketEvent();
}

let time = new Date().getTime(),
    fps = 60;

function run() {
    let _time = new Date().getTime();

    fps = 1000 / (_time - time);
    time = _time;

    update();
    render();

    window.setTimeout(run, 1000 / 60);
    // animationFrame(run);
}
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