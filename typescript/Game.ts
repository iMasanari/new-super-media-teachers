/// <reference path="Sprite.ts" />

class Game {
    frame = 0;
    fps = 50;
    ctx: CanvasRenderingContext2D;

    maxFrameSkip = 10;

    private skipTicks = 1000 / this.fps;
    private nextGameTick: number;

    constructor(public canvas: HTMLCanvasElement, public width: number, public height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
    }
    run() {
        let loop = () => {
            let loopCount = 0;
            let now = Date.now();

            if (now - this.nextGameTick < 1000) {
                while (now > this.nextGameTick && loopCount < this.maxFrameSkip) {
                    update();
                    this.nextGameTick += this.skipTicks;
                    loopCount++;
                }
            } else {
                console.log('skip!!');

                // 敵を全てリセット
                enemys.list = [];

                this.nextGameTick = now;
            }

            render();
            this.requestAnimationFrame(loop);
        }
        
        this.nextGameTick = Date.now();
        loop();
    }
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    drawSprite(sprite: Sprite, x: number, y: number) {
        this.ctx.drawImage(
            sprite.img,
            sprite.x, sprite.y, sprite.width, sprite.height,
            x, y, sprite.width, sprite.height
        );
    }
}
interface Game {
    requestAnimationFrame(callback: () => void): void;
}

Game.prototype.requestAnimationFrame = (function () {
    let list = [
        'requestAnimationFrame',
        'webkitRequestAnimationFrame',
        'mozRequestAnimationFrame',
        'oRequestAnimationFrame',
        'msRequestAnimationFrame'
    ];

    for (let i = 0, val: string; val = list[i]; ++i) {
        if (window[val]) {
            console.log('use ' + val);
            return function (callback: () => void) {
                window[val](callback);
            }
        }
    }
    console.log('use setTimeout');
    return function (callback: () => void) {
        window.setTimeout(callback, 30);
    }
})();