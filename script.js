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
    constructor(paddle) {
        document.addEventListener("keydown", event => {
            switch (event.keyCode) {
                case 37:
                    paddle.moveLeft();
                    break;
                case 39:
                    paddle.moveRight();
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
        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;
        this.image = document.getElementById('ball');

        this.position = { x: 10, y: 10 };
        this.speed = { x: 5, y: 5 };
        this.size = 90;
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    }
    update() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
            this.speed.x = -this.speed.x;
        }
        if (this.position.y + this.size > this.gameHeight || this.position.y < 0) {
            this.speed.y = -this.speed.y;
        }
    }
}
class Game {
    constructor(gameWidth, gameHeight, ctx) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.ctx = ctx;
    }
    start() {
        this.ball = new Ball(this);
        this.paddle = new Paddle(this);
        this.ih = new InputHandler(this.paddle);
    }
    update() {
        this.paddle.update();
        this.ball.update();
    }
    draw() {
        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);
    }
}

let canvas = document.querySelector('canvas');

let ctx = canvas.getContext("2d");

const GAME_WIDTH = 1350;
const GAME_HEIGHT = 600;
let game = new Game(GAME_WIDTH, GAME_HEIGHT, ctx);
game.start();
let lastTime = 0;

function gameLoop(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    game.draw();
    game.update();
    
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

