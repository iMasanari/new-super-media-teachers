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
        player.emit();

        let inputStart = (e: number | KeyboardEvent | TouchEvent) => {
            let keyCode = this.getKeyCode(e);

            this.inputStart(keyCode);

            player.emit('inputStart', {keyCode: keyCode});

            // if ((<HTMLElement>e.target).classList) {
            //     (<HTMLElement>e.target).classList.add('js-hover');
            // }
        };
        let inputEnd = (e: number | KeyboardEvent | TouchEvent) => {
            let keyCode = this.getKeyCode(e);

            this.inputEnd(keyCode);

            player.emit('inputEnd', {keyCode: keyCode});
            
            // if ((<HTMLElement>e.target).classList) {
            //     (<HTMLElement>e.target).classList.remove('js-hover');
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

        let keypadNumber: number = null;
        let touchInputStart = (e: TouchEvent) => {
            let target = <HTMLElement>e.target;

            if (target.classList.contains('jump')) {
                inputStart(38);
            } else if (target.classList.contains('keypad')) {
                let val = e.targetTouches[0];
                let x = val.pageX - target.offsetLeft;

                keypadNumber = x < 166 ? 37 : 39;
                inputStart(keypadNumber);
            }
        }
        let touchInputMove = (e: TouchEvent) => {
            let target = <HTMLElement>e.target;
            if (target.classList.contains('jump')) {
                inputStart(38);
            } else if (target.classList.contains('keypad')) {
                // for (let i = 0, val: Touch; val = e.targetTouches[i]; ++i) {
                let val = e.targetTouches[0];
                let x = val.pageX - target.offsetLeft;

                let _keypadNumber = (x < 166 ? 37 : 39);

                if (keypadNumber !== _keypadNumber) {
                    inputEnd(keypadNumber);
                    inputStart(keypadNumber = _keypadNumber);
                }
                // }
            }
        }
        let touchInputEnd = (e: TouchEvent) => {
            let target = <HTMLElement>e.target;
            if (target.classList.contains('jump')) {
                inputEnd(38);
            } else if (target.classList.contains('keypad')) {
                inputEnd(keypadNumber);
            }
        }

        window.addEventListener('blur', inputReset)
        if (touchKeyboard) {
            touchKeyboard.style.display = null;

            if ('ontouchstart' in window) {
                touchKeyboard.addEventListener('touchstart', touchInputStart, false);
                touchKeyboard.addEventListener('touchmove', touchInputMove, false);
                touchKeyboard.addEventListener('touchend', touchInputEnd, false);
                touchKeyboard.addEventListener('touchcancel', touchInputEnd, false);
            } else {
                // touchKeyboard.addEventListener('mousedown', inputStart, false);
                // touchKeyboard.addEventListener('mouseup', inputEnd, false);
                // touchKeyboard.addEventListener('mouseout', inputEnd, false);
            }
        }
    };
}