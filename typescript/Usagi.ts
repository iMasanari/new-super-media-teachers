class Usagi extends Enemy {
    speed = 3;
    point = 70;
    
    constructor(screens: Game) {
        super(sprites.usagi, screens);
    }
}
class Ai extends Enemy {
    speed = 4;
    point = 50;
    
    constructor(screens: Game) {
        super(sprites.ai, screens);
    }
}
class Piyo extends Enemy {
    constructor(screens: Game) {
        super(sprites.piyo, screens);
    }
}