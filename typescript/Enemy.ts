/// <reference path="Chara.ts" />

class Enemy extends Chara {
    constructor(sprites: Sprite[], screen: Screens) {
        super(sprites, screen);
        
        this.position.x = screen.width;
        this.position.y = this.screenBottom;
    }
    update() {
        this.position.x -= 4;
        this.updateSprite();
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
        return this.position.x < -this.width;
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
                }
                player.isFly = true;
                this.list = [];
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