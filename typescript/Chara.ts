/// <reference path="Sprite.ts" />
/// <reference path="Screens.ts" />
/// <reference path="CharaControler.ts" />

class Chara {
    control = new CharaControler;
    spriteIndex = 0;
    position: Chara.Position = {
        x: 0,
        y: 0,
        sx: 0,
        sy: 0
    };
    
    screenLeft: number;
    screenBottom: number;

    constructor(public sprites: Sprite[], public screen: Screens) {
        this.screenLeft = screen.width - sprites[0].width;
        this.screenBottom = screen.height - sprites[0].height;
    }
    update(){}
    display() {
        this.screen.drawSprite(this.sprites[this.spriteIndex], this.position.x, this.position.y);
    };
}

module Chara {
    export interface Position {
        x : number,
        y : number,
        sx : number,
        sy : number
    }
}