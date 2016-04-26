/// <reference path="Player.ts" />

class OtherPlayer extends _Player {
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
        if (this.control.isDown(38)) {
            if (this.isFly) {
                this.position.sy -= 0.1;
                this._position.sy -= 0.1;
            } else {
                this.isFly = true;
                this._position.sy = -9;
                this.position.sy = -9;
            }
        }
    }
    sync(data) {
        for (let key in data) {
            this._position[key] = data[key];
        }
    }
}
var pointList;
class OtherPlayerBuilder {
    list: { [x: string]: OtherPlayer } = {};

    constructor(public sprites: Sprite[], public screen: Game) { }

    getPlayer(id: string, createData) {
        let chara = this.list[id];

        if (!chara) {
            chara = this.list[id] = new OtherPlayer(this.sprites, this.screen);
            chara.sprites = sprites.teacher[createData.chara][createData.team];
            chara.teamNumber = createData.team;

            ++pointList[createData.team].playerNum;
        }
        return chara;
    }
    remove(id: string) {
        if (this.list[id]) {
            --pointList[this.list[id].teamNumber].playerNum;
        }

        this.list[id] = null;
        delete this.list[id];
    }
    update() {
        for (let id in this.list) {
            this.list[id].update();
        }
    }
    display() {
        for (let id in this.list) {
            this.list[id].display();
        }
    }
}