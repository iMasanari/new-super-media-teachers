/// <reference path="CharaControler.ts" />
/// <reference path="Game.ts" />

class TouchControler extends CharaControler {
    x: number;
    y: number;

    constructor(public screen: Game) {
        super();

        this.x = 0;
        this.y = screen.height - 100;
    }
    update() {
        this.display();
    }
    display() {
        let ctx = this.screen.ctx;
        
        ctx.fillStyle = '#eee';
        ctx.fillRect(this.x, this.y, 500, 100);
        
        let roundRectPath = function(l, t, w, h, r) {
            ctx.beginPath();
            ctx.arc(l + r, t + r, r, - Math.PI, - 0.5 * Math.PI, false);
            ctx.arc(l + w - r, t + r, r, - 0.5 * Math.PI, 0, false);
            ctx.arc(l + w - r, t + h - r, r, 0, 0.5 * Math.PI, false);
            ctx.arc(l + r, t + h - r, r, 0.5 * Math.PI, Math.PI, false);
            ctx.closePath();
        }

        roundRectPath(this.x + 10, this.y + 10, 200, 80, 20);
        ctx.stroke();

        // ctx.beginPath();
        // ctx.arc(this.x + 50, this.y + 50, 40, 0, Math.PI * 2, false);
        // ctx.stroke();

        // ctx.beginPath();
        // ctx.arc(this.x + 150, this.y + 50, 40, 0, Math.PI * 2, false);
        // ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x + 400, this.y + 50, 40, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}
