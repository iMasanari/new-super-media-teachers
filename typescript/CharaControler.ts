class CharaControler {
    down: { [x: string]: boolean } = {};
    _down: { [x: string]: boolean } = {};
    pressed: { [x: string]: boolean } = {};
    
    private timerId: number;

    inputStart(_code: number | TouchEvent | KeyboardEvent) {
        let code = this.getKeyCode(_code);

        if (this.down[code]) return;

        this.down[code] = true;
        this._down[code] = true;
        
        this.timerId = window.setTimeout(() => {
            this._down[code] = undefined;
        }, 1000);
    }
    inputEnd(_code: number | TouchEvent | KeyboardEvent) {
        let code = this.getKeyCode(_code);

        this.down[code] = undefined;
        this.pressed[code] = undefined;
        
        window.clearTimeout(this.timerId);
    }
    getKeyCode(code: number | TouchEvent | KeyboardEvent): number {
        let keyCode = (typeof code === 'number') ?
            code : (<KeyboardEvent>code).keyCode || +(<any>code).target.dataset.keyCode;

        if (keyCode === 32) {
            return 38;
        }
        return keyCode;
    };
    isDown(code: number): boolean {
        if (this._down[code]) {
            this._down[code] = undefined;
            return true;
        }
        return this.down[code] || false;
    };
    isPressed_bata(code: number): boolean {
        if (!this.pressed[code] && this.isDown(code)) {
            return this.pressed[code] = true;
        }
        return false;
    }
    setInputHandeler(player: Player, socket, touchKeyboard: HTMLElement) {
        var touchKeyboardObject = {};

        if (touchKeyboard) {
            var buttons = touchKeyboard.querySelectorAll('[data-key-code]');
            for (var i = 0, val = void 0; val = buttons[i]; ++i) {
                touchKeyboardObject[val.dataset['keyCode']] = val;
            }
        }
        if (socket) {
            socket.emit('add', {
                position: player.position
            });
        }
        var inputStart = e => {
            var keyCode = this.getKeyCode(e);
            if (socket) {
                socket.emit('inputStart', {
                    keyCode: keyCode,
                    // id: socket.id, // サーバー側で追加
                    position: {
                        position: player.position
                    }
                });
            }
            if (touchKeyboardObject[keyCode]) {
                touchKeyboardObject[keyCode].classList.add('js-hover');
            }

            this.inputStart(e);
        };
        var inputEnd = e => {
            var keyCode = this.getKeyCode(e);
            if (socket) {
                socket.emit('inputEnd', {
                    keyCode: keyCode,
                    position: player.position
                });
            }
            if (touchKeyboardObject[keyCode]) {
                touchKeyboardObject[keyCode].classList.remove('js-hover');
            }
            this.inputEnd(e);
        };
        document.addEventListener("keydown", inputStart);
        document.addEventListener("keyup", inputEnd);
        if (touchKeyboard) {
            if ('ontouchstart' in window) {
                touchKeyboard.addEventListener('touchstart', inputStart, false);
                touchKeyboard.addEventListener('touchend', inputEnd, false);
                touchKeyboard.addEventListener('touchcancel', inputEnd, false);
            }
            else {
                touchKeyboard.addEventListener('mousedown', inputStart, false);
                touchKeyboard.addEventListener('mouseup', inputEnd, false);
                touchKeyboard.addEventListener('mouseout', inputEnd, false);
            }
        }
    };
}