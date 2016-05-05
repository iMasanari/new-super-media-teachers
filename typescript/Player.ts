/// <reference path="Chara.ts" />

class _Player extends Chara {
    // life = 4;
    teamNumber: number;
    charaNumber: number;
    isFly: boolean;

    move() {
        if (this.control.isDown(37)) {
            this.position.sx -= this.isFly ? 0.1 : 0.4;
        }
        if (this.control.isDown(39)) {
            this.position.sx += this.isFly ? 0.1 : 0.4;
        }
        if (this.control.isDown(38)) {
            if (this.isFly) {
                this.position.sy -= 0.1;
            } else {
                this.isFly = true;
                this.position.sy = -9;
            }
        }
        if (this.control.isDown(40)) {
            if (this.isFly) {
                this.position.sy += 0.2;
            }
        }
    }
    update() {
        this.move();
        this.setPosition();
        this.updateSprite();
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
        } else if (this.spriteIndex === 2) {
            this.spriteIndex = 0;
        } else if (this.screen.frame % 20 === 0) {
            this.spriteIndex = this.spriteIndex ? 0 : 1;
        }
    }
}

class Player extends _Player {
    point = 0;
    maxPoint = 0;
    prevPoint = 0;
    
    display() {
        let ctx = this.screen.ctx;

        ctx.font = '30px "8dot", sans-serif';

        ctx.fillStyle = '#000';
        ctx.fillRect(250, 10, 240, 130);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(252, 12, 236, 130 - 4);

        ctx.fillStyle = '#fff';

        ctx.textAlign = 'left';
        // ctx.fillText('Point', 260, 45);
        ctx.fillText('Max:', 260, 85);
        ctx.fillText('Prev:', 260, 125);
        ctx.textAlign = 'right';
        ctx.fillText(this.maxPoint + ' pt', 480, 85);
        ctx.fillText(this.prevPoint + ' pt', 480, 125);
        
        // ctx.font = '50px "8dot", sans-serif';
        ctx.fillText(this.point + ' pt', 480, 45);

        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';
        
        super.display();
    }
    dead() {
        this.position = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0
        };
        this.isFly = true;

        player.prevPoint = player.point;
        player.point = 0;
        
        // --this.life;

        // if (this.life < 0) {
        //     isPlay = false;
        //     _isGameover = true;
        //     console.log(_isGameover)
            
        //     socket.emit('remove');
        // }

        this.emit();
    }
    emit(type = 'update', data?: Object) {
        if (!socket || !isPlay) return;

        let sendData = {
            team: this.teamNumber,
            chara: this.charaNumber,
            position: {
                x: this.position.x | 0,
                y: this.position.y | 0,
                sx: (this.position.sx * 100 | 0) / 100,
                sy: (this.position.sy * 100 | 0) / 100
            }
        }

        for (let key in data) {
            sendData[key] = data[key];
        }

        socket.emit(type, sendData);
    }
    getPoint(point: number) {
        if (!isPlay) return;

        this.point += point;
        this.maxPoint = Math.max(this.maxPoint, this.point);

        socket.emit('point', {
            team: this.teamNumber,
            chara: this.charaNumber,
            point: point
        });
    }
}