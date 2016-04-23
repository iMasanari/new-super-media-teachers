class Usagi extends Enemy {
    speed = 3;
    point = 70;

    constructor(screens: Game) {
        super(sprites.usagi, screens);
    }
}
class Ai extends Enemy {
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
    private count = 0;
    constructor(screens: Game) {
        super(sprites.ae, screens);
    }
    move() {
        super.move();

        if (this.position.y >= this.screenBottom) {
            this.position.y = this.screenBottom;

            if (++this.count > 30) {
                this.count = 0;
                this.position.sy = -10;
                this.position.y += this.position.sy;
            }
        } else {
            this.position.sy += 0.2;
            this.position.y += this.position.sy;
        }
        // this.position.y += this.position.sy;
        // this.position.y = Math.min(this.position.y, this.screenBottom);

    }
}
class Pr extends Enemy {
    speed = 2;

    constructor(screens: Game) {
        super(sprites.pr, screens);
    }
}
class Piyo extends Enemy {
    speed = 5;
    point = 60;

    constructor(screens: Game) {
        super(sprites.piyo, screens);
    }
}