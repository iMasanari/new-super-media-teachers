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

let sprites: any = {};

imageLoad('img/mmddots.png', function () {
    sprites.teacher = [[], []];
    
    for (let i = 0; i < 6; ++i) {
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
    player = new Player(sprites.teacher[0][0], display);
    player.position.y = -100;

    otherPlayers = new OtherPlayerBuilder(sprites.teacher[0][0], display);
    enemys = new EnemyBuilder(display);

    setSocketEvent();

    let playInput = document.getElementById('play');

    if (playInput) {
        playInput.textContent = 'スタート！'
        playInput.classList.remove('js-disabled');
    }
}

let gameOption = document.getElementById('game-option');

if (gameOption) {
    gameOption.addEventListener('touchstert', function (e) { e.stopPropagation(); }, true);
    gameOption.addEventListener('touchmove', function (e) { e.stopPropagation(); }, true);
    gameOption.addEventListener('touchend', function (e) { e.stopPropagation(); }, true);

    let charaInputs = <NodeListOf<HTMLInputElement>>document.getElementsByName('chara');
    let teamInputs = <NodeListOf<HTMLInputElement>>document.getElementsByName('team');
    let playInput = document.getElementById('play');

    let thmb = document.getElementById('player-thmb');

    let onclick = () => {
        let charaNumber = getCheckedRadio(charaInputs),
            teamNumber = getCheckedRadio(teamInputs);

        thmb.style.backgroundPosition =
            `${+charaNumber ? -192 : 0}px ${-108 * +teamNumber}px`;

        if (charaNumber != null && teamNumber != null) {
            playInput.style.display = null;
        }
    };

    [].forEach.call(charaInputs, val => {
        val.addEventListener('change', onclick)
    });
    [].forEach.call(teamInputs, val => {
        val.addEventListener('change', onclick)
    });


    playInput.addEventListener('click', function () {
        let charaNumber = getCheckedRadio(charaInputs),
            teamNumber = getCheckedRadio(teamInputs);

        if (
            charaNumber == null ||
            teamNumber == null ||
            playInput.classList.contains('js-disabled') ||
            !window.confirm('ゲームを開始します。よろしいですか')
        ) {
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


function getCheckedRadio(name: string | NodeListOf<HTMLInputElement>): string {
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

var pointUpdate;
var _isGameover: boolean;

_isGameover = _isGameover || false;

function render() {
    // 地面の描写
    let ctx = display.ctx,
        y = display.height - 100;

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
    } else {
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
    socket.on('update', function (data: socketData) {
        otherPlayers.getPlayer(data.id, data).sync(data.position);
    });
    socket.on('inputStart', function (data: socketData) {
        let otherPlayer = otherPlayers.getPlayer(data.id, data);

        otherPlayer.control.inputStart(data.keyCode);
        otherPlayer.sync(data.position);
    });
    socket.on('inputEnd', function (data: socketData) {
        let otherPlayer = otherPlayers.getPlayer(data.id, data);

        otherPlayer.control.inputEnd(data.keyCode);
        otherPlayer.sync(data.position);
    });
    socket.on('addEnemy', function (name) {
        enemys.add(name);
    });
    socket.on('request-update', function (data?: socketData) {
        if (isPlay) {
            socket.emit('update', {
                position: player.position
            });
        }

        if (data) {
            otherPlayers.getPlayer(data.id, data).sync(data.position);
        }
    });
    socket.on('game-start', function (data?: socketData) {
        if (isPlay && player) {
            // player.life = 2;
            player.point = 0;
        }
    });
    socket.on('set-life', function (num: number) {
        if (isPlay && player) {
            // player.life = num;
        }
    });
    socket.on('remove', function (id: string) {
        otherPlayers.remove(id);
    });
}

function ElementRequestFullscreen(element: HTMLElement) {
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

