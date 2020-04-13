const level1 = [
    [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
class Paddle {
    constructor(game) {
        this.gameWidth = game.gameWidth;
        this.width = 150;
        this.height = 20;
        this.speed = 0;
        this.maxSpeed = 15;
        this.position = {
            x: game.gameWidth / 2 - this.width / 2,
            y: game.gameHeight - this.height - 10
        };
    }
    moveLeft() {
        this.speed = -this.maxSpeed;
    }
    moveRight() {
        this.speed = this.maxSpeed;
    }
    stop() {
        this.speed = 0;
    }
    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.position.x += this.speed;
        if (this.position.x < 0) {
            this.position.x = 0;

        }
        if (this.position.x + this.width > this.gameWidth) {
            this.position.x = this.gameWidth - this.width;
        }
    }
}

class InputHandler {
    constructor(paddle, game) {
        document.addEventListener("keydown", event => {
            switch (event.keyCode) {
                case 37:
                    paddle.moveLeft();
                    break;
                case 39:
                    paddle.moveRight();
                    break;
                case 27:
                    game.togglePause();
                    break;
                default:
                    break;
            }
        });

        document.addEventListener("keyup", event => {
            switch (event.keyCode) {
                case 37:
                    if (paddle.speed < 0) paddle.stop();
                    break;
                case 39:
                    if (paddle.speed > 0) paddle.stop();
                    break;
                default:
                    break;
            }
        });
    }
}

class Ball {
    constructor(game) {
        this.game = game;
        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;
        this.image = document.getElementById('ball');

        this.position = { x: 10, y: 150 };
        this.speed = { x: 7, y: 7 };
        this.size = 10;
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }
    update() {

        if (this.position.y + this.size >= this.gameHeight) {
            this.game.lives--;
        }
        
        if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
        }
        if (this.position.y + this.size > this.gameHeight || this.position.y < 0) {
            this.speed.y = -this.speed.y;
        }
        if (detectColision(this, this.game.paddle)) {
            this.speed.y = -this.speed.y;
            this.position.y = this.game.paddle.position.y - this.size;
        }
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
    }
}
class Brick {
    constructor(game, position) {
        this.image = document.getElementById('brick');
        this.game = game;
        this.position = position;
        this.width = 68;
        this.height = 20;
        this.markedForDelete = false;
    }
    update() {
        if (detectColision(this.game.ball, this)) {
            this.game.ball.speed.y = -this.game.ball.speed.y;
            this.markedForDelete = true;
        }
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}

class Game {
    constructor(gameWidth, gameHeight, ctx) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.ctx = ctx;
        const GAMESTAGE = {
            PAUSED: 0,
            RUNNING: 1,
            GAMEOVER: 2
        }
        this.GAMESTAGE = GAMESTAGE;
        this.gameStage;
        this.lives = 1;
    }
    start() {
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        this.ih = new InputHandler(this.paddle, this);
        this.bricks = buildLevel(this, level1);
        this.gameObjects = [this.ball, this.paddle, ...this.bricks];
        this.gameStage = this.GAMESTAGE.RUNNING;
    }
    update() {
        if (this.lives == 0) {
         this.gameStage = this.GAMESTAGE.GAMEOVER;
        }    

        if (this.gameStage == this.GAMESTAGE.PAUSED || 
            this.gameStage == this.GAMESTAGE.GAMEOVER) return;

            this.gameObjects.forEach(object => object.update());
            this.gameObjects = this.gameObjects.filter(objt => !objt.markedForDelete);
    }
    draw() {
        this.gameObjects.forEach(object => object.draw(this.ctx));
        if (this.gameStage == this.GAMESTAGE.PAUSED) {
            this.ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fill();

            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Paused", this.gameWidth/2, this.gameHeight/2);
        }
        if (this.gameStage == this.GAMESTAGE.GAMEOVER) {
            this.ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fill();

            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Game Over", this.gameWidth/2, this.gameHeight/2);
        }
    }
    togglePause() {
        if (this.gameStage == this.GAMESTAGE.PAUSED) {
            this.gameStage = this.GAMESTAGE.RUNNING;
        } else if (this.gameStage == this.GAMESTAGE.RUNNING) {
            this.gameStage = this.GAMESTAGE.PAUSED;
        }
    }
}

let canvas = document.querySelector('canvas');

let ctx = canvas.getContext("2d");


const GAME_WIDTH = 1350;
const GAME_HEIGHT = 600;
let game = new Game(GAME_WIDTH, GAME_HEIGHT, ctx);
game.start();
let lastTime = 0;

function buildLevel(game, level) {
    let bricks = [];

    level.forEach((row, rowIndex) => {

        row.forEach((brick, brickIndex) => {
            if (brick == 1) {
                let position = {
                    x: (68 * brickIndex),
                    y: (40 + 20 * rowIndex)
                }
                bricks.push(new Brick(game, position));
            }
        });

    });
    return bricks;
}
function detectColision(ball, gameObject) {
    let bottomOfBall = ball.position.y + ball.size;
    let topOfBall = ball.position.y;

    let topOfObject = gameObject.position.y;
    let leftOfObject = gameObject.position.x;
    let rightOfObject = gameObject.position.x + gameObject.width;
    let bottomOfObject = gameObject.position.y + gameObject.height;

    return (
        bottomOfBall >= topOfObject &&
        topOfBall <= bottomOfObject &&
        ball.position.x >= leftOfObject &&
        ball.position.x + ball.size <= rightOfObject
    );
}
function gameLoop(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    game.draw();
    game.update();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

