/// <reference path="Chara.ts" />

class Enemy extends Chara {
    spritesLen: number;
    speed = 5;

    isAddedPoint = false;
    point = 50;
    pointPosition: {
        x: number,
        y: number,
        point: number,
        opacity: number
    } = null;

    constructor(sprites: Sprite[], screen: Game) {
        super(sprites, screen);

        this.position.x = screen.width;
        this.position.y = this.screenBottom;

        this.spritesLen = sprites.length;
    }
    update() {
        this.position.x -= this.speed;
        this.pointCheck();
        this.updateSprite();
    }
    pointCheck() {
        if (!isPlay) return;

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
            ctx.fillStyle = '#fff';

            this.pointPosition.opacity -= 5;

            ctx.fillText('+' + this.pointPosition.point, this.pointPosition.x, this.pointPosition.y);
            ctx.strokeText('+' + this.pointPosition.point, this.pointPosition.x, this.pointPosition.y);
            this.pointPosition.y += -3;
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#000';
        }
    }
    updateSprite() {
        // if (this.screen.frame % 10 === 0) {
        //     this.spriteIndex = (this.spriteIndex + 1) % 3;
        // }
        if (this.screen.frame % 20 === 0) {
            this.spriteIndex = (this.spriteIndex + 1) % this.spritesLen;
        }
    }
    isHit(chara: Chara): boolean {
        let a = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
            r: this.r
        },
            b = {
                x: chara.position.x + chara.width / 2,
                y: chara.position.y + chara.height / 2,
                r: chara.r
            };

        return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= (a.r + b.r) ** 2;
    }
    isDead(): boolean {
        return this.position.x < -this.width; // <- this.position.x + this.width < 0
    }
}

class EnemyBuilder {
    list: Enemy[] = [];

    constructor(public screen: Game) { }

    add(name: string) {
        this.list.push(new window[name](this.screen));
    }
    remove(n: number) {
        this.list.splice(n, 1);
    }
    update(player: Player) {
        for (let i = 0, enemy: Enemy; enemy = this.list[i]; ++i) {
            enemy.update();
            if (enemy.isHit(player)) {

                // おふざけ
                player.sprites = sprites.teacher[Math.random() * 3 | 0];
                player.width = player.sprites[0].width;
                player.height = player.sprites[0].height;
                player.screenLeft = player.screen.width - player.width;
                player.screenBottom = player.screen.height - player.height - 100;
                player.r = Math.min(player.width, player.height) / 2 - 2;

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