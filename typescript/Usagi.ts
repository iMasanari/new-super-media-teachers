class Usagi extends Enemy {
    speed = 2;
    point = 70;
    
    constructor(screens: Game) {
        super(usagiSprite, screens);
    }
}
class Piyo extends Enemy {
    constructor(screens: Game) {
        super(piyoSprite, screens);
    }
}