class CharaControler {
    down: { [x: string]: boolean } = {};
    _down: { [x: string]: boolean } = {};
    pressed: { [x: string]: boolean } = {};

    private timerId: number;

    inputStart(_code: number | KeyboardEvent | TouchEvent) {
        let code = this.getKeyCode(_code);

        if (this.down[code]) return;

        this.down[code] = true;
        this._down[code] = true;

        window.clearTimeout(this.timerId);

        this.timerId = window.setTimeout(() => {
            this._down[code] = undefined;
        }, 1000);
    }
    inputEnd(_code: number | KeyboardEvent | TouchEvent) {
        let code = this.getKeyCode(_code);

        this.down[code] = undefined;
        this.pressed[code] = undefined;
    }
    getKeyCode(code: number | KeyboardEvent | TouchEvent): number {
        let keyCode = (typeof code === 'number') ?
            code : (<KeyboardEvent>code).keyCode || +(<any>code).target.dataset.keyCode;

        if (keyCode === 32) {
            // スペースキーを上キーとして扱う
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
        // let touchKeyboardObject = {};

        // if (touchKeyboard) {
        //     let buttons = touchKeyboard.querySelectorAll('[data-key-code]');
        //     for (let i = 0, val: HTMLElement; val = <HTMLElement>buttons[i]; ++i) {
        //         touchKeyboardObject[val.dataset['keyCode']] = val;
        //     }
        // }
        if (socket) {
            socket.emit('add', {
                position: player.position
            });
        }
        let inputStart = (e: KeyboardEvent | TouchEvent) => {
            let keyCode = this.getKeyCode(e);

            this.inputStart(keyCode);

            if (socket) {
                socket.emit('inputStart', {
                    keyCode: keyCode,
                    // id: socket.id, // サーバー側で追加
                    position: {
                        position: player.position
                    }
                });
            }
            if ((<HTMLElement>e.target).classList) {
                (<HTMLElement>e.target).classList.add('js-hover');
            }
            // if (touchKeyboardObject[keyCode]) {
            //     touchKeyboardObject[keyCode].classList.add('js-hover');
            // }

        };
        let inputEnd = (e: KeyboardEvent | TouchEvent) => {
            let keyCode = this.getKeyCode(e);

            this.inputEnd(keyCode);

            if (socket) {
                socket.emit('inputEnd', {
                    keyCode: keyCode,
                    position: player.position
                });
            }
            if ((<HTMLElement>e.target).classList) {
                (<HTMLElement>e.target).classList.remove('js-hover');
            }
            // if (touchKeyboardObject[keyCode]) {
            //     touchKeyboardObject[keyCode].classList.remove('js-hover');
            // }
        };
        let inputReset = () => {
            this.down = {};
            this._down = {};
            this.pressed = {};
            
            if (socket) {
                socket.emit('remove');
            }
        }

        document.addEventListener("keydown", inputStart);
        document.addEventListener("keyup", inputEnd);

        window.addEventListener('blur', inputReset)
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