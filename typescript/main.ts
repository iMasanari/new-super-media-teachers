/// <reference path="tsd/socket.io-client.d.ts" />

/// <reference path="Screens.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="CharaControler.ts" />
/// <reference path="Player.ts" />
/// <reference path="OtherPlayer.ts" />
/// <reference path="Enemy.ts" />

let animationFrame = (function(): (callback) => void {
    let list = [
        'requestAnimationFrame',
        'webkitRequestAnimationFrame',
        'mozRequestAnimationFrame'
    ];

    for (let i = 0, val: string; val = list[i]; ++i) if (window[val]) {
        return function(callback) {
            window[val](callback.bind(this));
        };
    }
    return function(callback) {
        return window.setTimeout(callback.bind(this), 1000 / 60);
    };
})();

let display = new Screens(
    <HTMLCanvasElement>document.getElementById('canvas'),
    500, 500
);
let socket = io.connect();

let teacheresSprite;
let img = new Image();

img.addEventListener('load', function() {
    teacheresSprite = [
        new Sprite(this, 0, 0, 60, 100),
        new Sprite(this, 60, 0, 60, 100),
        new Sprite(this, 120, 0, 60, 100)
    ];
    init();
    run();
});
img.src = 'sprite.png';

let player: Player;
let otherPlayers: OtherPlayerBuilder;
let enemys: EnemyBuilder;

function init() {
    player = new Player(teacheresSprite, display);
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));

    otherPlayers = new OtherPlayerBuilder(teacheresSprite, display);
    enemys = new EnemyBuilder(teacheresSprite, display);

    setSocketEvent();
}

function run() {
    update();
    render();

    animationFrame(run);
}
function update() {
    ++display.frame;
    display.clear();

    otherPlayers.update();
    player.update();
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

    otherPlayers.display();
    player.display();
    enemys.display();
}

function setSocketEvent() {
    socket.on('update', function(data: socketData) {
        otherPlayers.getPlayer(data.id).sync(data.position);
    });
    socket.on('inputStart', function(data: socketData) {
        let chara = otherPlayers.getPlayer(data.id);

        chara.control.inputStart(data.keyCode);
        chara.sync(data.position);
    });
    socket.on('inputEnd', function(data: socketData) {
        let chara = otherPlayers.getPlayer(data.id);

        chara.control.inputEnd(data.keyCode);
        chara.sync(data.position);
    });
    socket.on('addEnemy', function() {
        enemys.add();
    });
    socket.on('request-update', function(data?: socketData) {
        socket.emit('update', {
            position: player.position
        });

        if (data) {
            otherPlayers.getPlayer(data.id).sync(data.position);
        }
    });
    socket.on('remove', function(id: string) {
        otherPlayers.remove(id);
    });
}

// iPhoneでスクロール中にアニメーションが止まるので、スクロールさせない等
document.addEventListener('touchstert', function(e) { e.preventDefault(); });
document.addEventListener('touchmove', function(e) { e.preventDefault(); });
document.addEventListener('touchend', function(e) { e.preventDefault(); });

interface socketData {
    id: string,
    keyCode: number,
    position: Chara.Position
}