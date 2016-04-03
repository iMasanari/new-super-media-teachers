/// <reference path="tsd/socket.io-client.d.ts" />

/// <reference path="Screens.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="CharaControler.ts" />
/// <reference path="Player.ts" />
/// <reference path="OtherPlayer.ts" />

let animationFrame = (function(): (callback) => void {
    let list = [
        'requestAnimationFrame',
        'webkitRequestAnimationFrame',
        'mozRequestAnimationFrame'
    ];

    for (let val of list) if (window[val]) {
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

function init() {
    player = new Player(teacheresSprite, display);
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));

    otherPlayers = new OtherPlayerBuilder(teacheresSprite, display);
}

function run() {
    update();
    render();

    animationFrame(run);
}
function update() {
    ++display.frame;
    display.clear();
    player.move();
    player.update();
    otherPlayers.each(function(chara) {
        chara.move();
        chara.update();
    });
}
function render() {
    otherPlayers.each(function(chara) {
        chara.display();
    });
    player.display();
}

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
socket.on('request-update', function(data) {
    socket.emit('update', {
        position: player.position
    });

    let chara = otherPlayers.getPlayer(data.id);

    // chara.control.inputEnd(data.keyCode);
    chara.sync(data.position);
});
socket.on('remove', function(id: string) {
    otherPlayers.remove(id);
});

interface socketData {
    id: string,
    keyCode: number,
    position: Chara.Position
}