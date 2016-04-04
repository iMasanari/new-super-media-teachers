/// <reference path="Player.ts" />

class OtherPlayer extends Player {
    private _position: Chara.Position = {
        x: 0,
        y: 0,
        sx: 0,
        sy: 0
    };

    update() {
        this.move();
        this.setPosition();
        this.setPosition(this._position);

        // 通信ラグによるズレを補正
        for (let key in this.position) {
            let difference = (this._position[key] - this.position[key]) / 2;
            if (Math.abs(difference) > 50) {
                this.position[key] = this._position[key];
            } else {
                this.position[key] += Math.min(Math.max(difference, -1), 1);
            }
        }
        this.updateSprite();
    }
    move() {
        if (this.control.isDown(37)) {
            let sx = this.isFly ? 0.1 : 0.4;

            this.position.sx -= sx;
            this._position.sx -= sx;
        }
        if (this.control.isDown(39)) {
            let sx = this.isFly ? 0.1 : 0.4;

            this.position.sx += sx;
            this._position.sx += sx;
        }
        if (this.control.isDown(38) && !this.isFly) {
            this.isFly = true;
            this.position.sy = -10;
            this._position.sy = -10;
        }
    }
    sync(data) {
        for (let key in data) {
            this._position[key] = data[key];
        }
    }
}

class OtherPlayerBuilder {
    players: { [x: string]: OtherPlayer } = {};

    constructor(public sprites: Sprite[], public screen: Screens) { }

    getPlayer(id: string) {
        let chara = this.players[id];

        if (!chara) {
            return this.players[id] = new OtherPlayer(this.sprites, this.screen);
        }
        return chara;
    }
    remove(id: string) {
        this.players[id] = null;
        delete this.players[id];
    }
    update() {
        for (let id in this.players) {
            this.players[id].update();
        }
    }
    display() {
        for (let id in this.players) {
            this.players[id].display();
        }
    }
}