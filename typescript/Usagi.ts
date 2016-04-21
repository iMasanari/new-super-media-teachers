class Usagi extends Enemy {
    speed = 3;
    point = 70;
    
    constructor(screens: Game) {
        super(sprites.usagi, screens);
    }
}
class Ai extends Enemy {
    constructor(screens: Game) {
        super(sprites.ai, screens);
    }
}
class Ps extends Enemy {
    constructor(screens: Game) {
        super(sprites.ps, screens);
    }
}
class Pr extends Enemy {
    constructor(screens: Game) {
        super(sprites.pr, screens);
    }
}
class Ae extends Enemy {
    constructor(screens: Game) {
        super(sprites.Ae, screens);
    }
}
class Piyo extends Enemy {
    speed = 5;
    point = 60;
    
    constructor(screens: Game) {
        super(sprites.piyo, screens);
    }
}