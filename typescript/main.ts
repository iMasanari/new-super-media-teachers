/// <reference path="tsd/socket.io-client.d.ts" />

/// <reference path="Game.ts" />
/// <reference path="Sprite.ts" />
/// <reference path="CharaControler.ts" />
/// <reference path="Player.ts" />
/// <reference path="OtherPlayer.ts" />
/// <reference path="Enemy.ts" />
/// <reference path="Usagi.ts" />

let display = new Game(
    <HTMLCanvasElement>document.getElementById('canvas'),
    500, 500
);

let socket = io.connect();

let sprites: any = {
    teacher: []
};

// コールバック地獄！ 後で直す
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

        init();
        display.run();
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

let isPlay = false;

function init() {
    player = new Player(sprites.teacher[0], display);
    player.position.y = -100;

    otherPlayers = new OtherPlayerBuilder(sprites.teacher[0], display);
    enemys = new EnemyBuilder(display);

    setSocketEvent();
    document.getElementById('play').removeAttribute('disabled');
}

let gameOption = document.getElementById('game-option');

gameOption.addEventListener('touchstert', function (e) { e.stopPropagation(); }, true);
gameOption.addEventListener('touchmove', function (e) { e.stopPropagation(); }, true);
gameOption.addEventListener('touchend', function (e) { e.stopPropagation(); }, true);

document.getElementById('play').addEventListener('click', function () {
    let charaNumber = getCheckedRadio('chara'),
        teamrNumber = getCheckedRadio('team');
    
    if (charaNumber == null || teamrNumber == null) {
        return;
    }
    
    player.sprites = sprites.teacher[charaNumber];
    isPlay = true;
    player.control.setInputHandeler(player, socket, document.getElementById('touch-keyboard'));
    
    gameOption.style.display = 'none';
    enemys.list = [];
}, false);

function getCheckedRadio(name: string | NodeListOf<HTMLInputElement>) {
    let nodelist = (typeof name === 'string') ?
        <NodeListOf<HTMLInputElement>>document.getElementsByName(name) : name;

    for (let i = 0, val: HTMLInputElement; val = nodelist[i]; ++i) {
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
    } else {
        otherPlayers.update();
    }
    enemys.update(player);
}
function render() {
    // 地面の描写
    let ctx = display.ctx,
        y = display.height - 100;

    ctx.lineWidth = 2;
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
    socket.on('addEnemy', function (name) {
        enemys.add(name);
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
});

interface socketData {
    id: string,
    keyCode: number,
    position: Chara.Position
}

