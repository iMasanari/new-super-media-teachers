/// <reference path="Chara.ts" />
/// <reference path="Player.ts" />

class Enemy extends Chara {
    isAddedPoint = false;
    point = 50;
    pointPosition: {
        x: number,
        y: number,
        point: number,
        opacity : number
    } = null;

    constructor(sprites: Sprite[], screen: Screens) {
        super(sprites, screen);

        this.position.x = screen.width;
        this.position.y = this.screenBottom;
    }
    update() {
        this.position.x -= 4;
        this.pointCheck();
        this.updateSprite();
    }
    pointCheck() {
        if (!this.isAddedPoint) {
            if (player.position.x > this.position.x) {
                let point = this.point * (1 + player.position.x / player.screenLeft) | 0;
                
                player.point += point;
                
                this.isAddedPoint = true;
                this.pointPosition = {
                    point: point,
                    x: this.position.x + 30,
                    y: this.position.y - 20,
                    opacity: 130
                };

                window.setTimeout(() => {
                    this.pointPosition = null;
                }, 1000);

            }
        } else if (this.pointPosition && this.pointPosition.opacity) {
            let ctx = this.screen.ctx;

            ctx.font = '30px sans-serif';
            ctx.textAlign = 'center';
            ctx.globalAlpha = this.pointPosition.opacity / 100;
            this.pointPosition.opacity -= 5;
            ctx.strokeText('+' + this.pointPosition.point, this.pointPosition.x, this.pointPosition.y);
            this.pointPosition.y += -3;
            ctx.globalAlpha = 1;
        }
    }
    updateSprite() {
        if (this.screen.frame % 20 === 0) {
            this.spriteIndex = this.spriteIndex ? 0 : 1;
        }
    }
    isHit(chara: Chara): boolean {
        let a = this.position,
            b = chara.position;

        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= 60 ** 2;
    }
    isDead(): boolean {
        return this.position.x < -this.width; // <- this.position.x + this.width < 0
    }
}

class EnemyBuilder {
    list: Enemy[] = [];

    constructor(public sprites: Sprite[], public screen: Screens) { }

    add() {
        this.list.push(new Enemy(this.sprites, this.screen));
    }
    remove(n: number) {
        this.list.splice(n, 1);
    }
    update(player: Player) {
        for (let i = 0, enemy: Enemy; enemy = this.list[i]; ++i) {
            enemy.update();
            if (enemy.isHit(player)) {
                player.position = {
                    x: 0,
                    y: 0,
                    sx: 0,
                    sy: 0
                };
                player.maxPoint = Math.max(player.point, player.maxPoint);
                player.point = 0;
                player.isFly = true;
                this.list = [];

                if (socket) {
                    socket.emit('add', {
                        position: player.position
                    });
                }
                // this.remove(i--);
            } else if (enemy.isDead()) {
                this.remove(i--);
            }
        }
    }
    display() {
        for (let i = 0, enemy: Enemy; enemy = this.list[i]; ++i) {
            enemy.display();
        }
    }
}