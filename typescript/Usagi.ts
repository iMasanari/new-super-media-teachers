class Usagi extends Enemy {
    speed = 3;
    point = 70;

    constructor(screens: Game) {
        super(sprites.usagi, screens);
    }
}
class Ai extends Enemy {
    speed = 3;
    constructor(screens: Game) {
        super(sprites.ai, screens);
    }
}
class Ps extends Enemy {
    constructor(screens: Game) {
        super(sprites.ps, screens);
    }
}
class Ae extends Enemy {
    speed = 1.5;
    isFly = false;
    private count = 0;

    constructor(screens: Game) {
        super(sprites.ae, screens);
    }
    move() {
        super.move();

        if (this.screenBottom <= this.position.y) {
            // 歩き
            if (++this.count > 30) {
                // ジャンプ
                this.count = 0;
                this.position.sy = -10;
                this.position.y += this.position.sy;
                this.isFly = true;
            }
        } else {
            // 空中
            this.position.sy += 0.2;
            this.position.y += this.position.sy;

            if (this.screenBottom < this.position.y) {
                // 着地直後
                this.position.y = this.screenBottom;
                this.isFly = false;
            }
        }
    }
    updateSprite() {
        if (this.isFly) {
            this.spriteIndex = 2;
        } else if (this.spriteIndex === 2) {
            this.spriteIndex = 0;
        } else if (this.screen.frame % 20 === 0) {
            this.spriteIndex = this.spriteIndex ? 0 : 1;
        }
    }
}
class Pr extends Enemy {
    speed = 2;

    constructor(screens: Game) {
        super(sprites.pr, screens);
    }
}