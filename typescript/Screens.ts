/// <reference path="Sprite.ts" />

class Screens {
    frame = 0;
    ctx: CanvasRenderingContext2D;

    constructor(public canvas: HTMLCanvasElement, public width: number, public height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d");
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