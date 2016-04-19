/// <reference path="Chara.ts" />

class Player extends Chara {
    point = 0;
    maxPoint = 0;
    isFly: boolean;

    move() {
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
    }
    update() {
        this.move();
        this.setPosition();
        this.updateSprite();
    }
    display() {
        let ctx = this.screen.ctx;

        super.display();
        ctx.font = '50px sans-serif';
        ctx.textAlign = 'right';
        ctx.strokeText(this.point.toFixed(0), 500 - 10, 50);
        ctx.font = '25px sans-serif';
        ctx.fillText('MAX: ' + Math.max(this.maxPoint, this.point), 500 - 200, 40);
    }
    setPosition(target = this.position) {
        target.x += target.sx;
        target.sx = Math.min(Math.max(target.sx * (this.isFly ? 0.98 : 0.9), -4), 4);
        target.y += target.sy;
        target.sy += 0.3;

        if (target.x < 0) {
            target.x = 0;
            target.sx *= -1;
        } else if (this.screenLeft < target.x) {
            target.x = this.screenLeft;
            target.sx *= -1;
        }

        if (target.y < 0) {
        } else if (this.screenBottom < target.y) {
            target.y = this.screenBottom;
            target.sy = 0;
            this.isFly = false;
        }
    }
    updateSprite() {
        if (this.isFly) {
            this.spriteIndex = 2;
        }
        else if (this.spriteIndex === 2) {
            this.spriteIndex = 0;
        }
        else if (this.screen.frame % 20 === 0) {
            this.spriteIndex = this.spriteIndex ? 0 : 1;
        }
    }
}