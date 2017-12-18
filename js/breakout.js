window.addEventListener('DOMContentLoaded', () => {
    // 初期化
    const canvas = document.getElementById('board');
    new Breakout({
        canvas: canvas,
        interval: 1000 / 60,    // 60 FPS
        paddle: {width: 100,height: 10,color: '#FFFFFF'},
        ball: {radius: 5, color: '#FFFFFF'},
        block: {width: 80,height: 20}
    });
});

class Breakout {
    static set width(w) {
        Breakout.gameWidth = w;
    }

    static get width() {
        return Breakout.gameWidth;
    }

    static set height(h) {
        Breakout.gameHight = h;
    }

    static get height() {
        return Breakout.gameHight;
    }

    static get isGameOver() {
        return Breakout._game_over === true;
    }

    static setGameOver(f) {
        if (f instanceof Boolean) {
            Breakout._game_over = f;
            return;
        }
        Breakout._game_over = true;
    }

    constructor(options) {
        this.canvas = options.canvas;
        this.context = this.canvas.getContext('2d');
        Breakout.width = this.canvas.width;
        Breakout.height = this.canvas.height;

        this.leftKey = false;
        this.rightKey = false;

        this.paddle = new Paddle(options.paddle.width, options.paddle.height, options.paddle.color);

        this.paddle.setPosition(Breakout.width / 2, Breakout.height * 8 / 9);
        this.paddle.setSpeed(Breakout.width / 100);

        this.blockManager = new BlockManager(options.block.width, options.block.height);
        this.blockManager.stage1();

        this.ball = new Ball(options.ball.radius, options.ball.color);
        this.ball.setPosition(Breakout.width / 2, Breakout.height / 2);

        this.ball.addTarget(this.paddle);
        this.ball.addTarget(this.blockManager.blockList);

        setInterval(this.draw.bind(this), options.interval);

        window.addEventListener('keydown', this.keydown.bind(this));
        window.addEventListener('keyup', this.keyup.bind(this));
    }

    keydown(evt) {
        if (evt.code === 'ArrowLeft') {
            this.leftKey = true;
        } else if (evt.code === 'ArrowRight') {
            this.rightKey = true;
        } else if (evt.code === 'Space') {
            this.ball.setSpeed(5, 135);
        }
    }

    keyup(evt) {
        if (evt.code === 'ArrowLeft') {
            this.leftKey = false;
        } else if (evt.code === 'ArrowRight') {
            this.rightKey = false;
        }
    }

    draw() {
        this.context.clearRect(0, 0, Breakout.width, Breakout.height);
        if (this.leftKey) {
            this.paddle.moveLeft();
        }
        if (this.rightKey) {
            this.paddle.moveRight();
        }
        if (Breakout.isGameOver) {
            this.context.save();

            this.context.fillStyle = "red";
            this.context.font = "48pt Arial";
            this.context.textAlign = "center";
            this.context.fillText("GameOver", Breakout.width / 2, Breakout.height / 2);

            this.context.restore();
        } else {
            this.ball.draw(this.context);
        }
        this.paddle.draw(this.context);
        this.blockManager.draw(this.context);
    }
}

class Entity {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }

    getCornerPoints() {
        return [
            {x: this.x - this.width / 2, y: this.y - this.height / 2},
            {x: this.x + this.width / 2, y: this.y - this.height / 2},
            {x: this.x + this.width / 2, y: this.y + this.height / 2},
            {x: this.x - this.width / 2, y: this.y + this.height / 2}
        ]
    }

    hit(ball) {
    }
}

class Paddle extends Entity {
    constructor(width, height, color) {
        super();
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
    }

    draw(context) {
        context.save();

        context.translate(this.x, this.y);
        context.fillStyle = this.color;
        context.fillRect(-(this.width / 2), -(this.height / 2),
            this.width, this.height);

        context.restore();
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.fixPosition();
    }


    setSpeed(speed) {
        this.speed = speed;
    }


    moveLeft() {
        this.x -= this.speed;
        this.fixPosition();
    }

    moveRight() {
        this.x += this.speed;
        this.fixPosition();
    }

    fixPosition() {
        const left = this.x - (this.width / 2);
        if (left < 0) {
            this.x += Math.abs(left);
        }

        const right = this.x + (this.width / 2);
        if (right > Breakout.width) {
            this.x -= right - Breakout.width;
        }
    }


    hit(ball) {
        if (this.x + this.width / 4 < ball.x) {
            ball.changeAngle();
            return;
        }
        if (this.x - this.width / 4 > ball.x) {
            ball.changeAngle(true);
        }
    }
}

class Block extends Entity {
    static get colorSet() {
        return [
            ['Pink', 'Crimson'],
            ['HotPink', 'DeepPink'],
            ['Violet', 'Magenta'],
            ['MediumOrchid', 'DarkOrchid'],
            ['MediumSlateBlue', 'DarkSlateBlue'],
            ['Blue', 'MidnightBlue'],
            ['LightSkyBlue', 'DeepSkyBlue'],
            ['Cyan', 'DarkCyan'],
            ['MediumAquamarine', 'MediumSpringGreen'],
            ['SpringGreen', 'SeaGreen'],
            ['DarkGreen', 'LawnGreen'],
            ['Yellow', 'Olive'],
            ['Gold', 'DarkGoldenrod'],
            ['Orange', 'DarkOrange'],
            ['Coral', 'OrangeRed'],
            ['Red', 'DarkRed'],
        ];
    }

    constructor(manager, x, y, width, height, color) {
        super();
        this.manager = manager;
        this.width = width;
        this.height = height;
        if (color >= Block.colorSet.length) {
            color = Block.colorSet.length - 1;
        }
        this.color = Block.colorSet[color];
        this.x = x;
        this.y = y;
    }

    draw(context) {
        context.save();

        context.translate(this.x, this.y);
        context.fillStyle = this.color[0];
        context.fillRect(-(this.width / 2), -(this.height / 2),
            this.width, this.height);
        context.lineWidth = 4;
        context.strokeStyle = this.color[1];
        context.strokeRect(-(this.width / 2) + 2, -(this.height / 2) + 2,
            this.width - 4, this.height - 4);

        context.restore();
    }

    hit(ball) {
        ball.removeTarget(this);
        this.manager.removeTarget(this);
    }
}

class BlockManager {
    constructor(baseWidth, baseHeight) {
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
        this.blockList = [];
    }

    stage1() {
        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 6; y++) {
                const color = parseInt(Math.random() * Block.colorSet.length);
                this.blockList.push(
                    new Block(this, this.baseWidth * (x + 1)
                        , this.baseHeight * (y + 1),
                        this.baseWidth, this.baseHeight, color));
            }
        }
    }

    removeTarget(object) {
        this.blockList.splice(this.blockList.indexOf(object), 1);
    }


    draw(context) {
        this.blockList.forEach((block) => {
            block.draw(context);
        }, this);
    }
}

class Ball {
    constructor(radius, color) {
        this.radius = radius;
        this.color = color;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.targetList = [];
    }

    addTarget(object) {
        if (Array.isArray(object)) {
            for (let i in object) {
                this.targetList.push(object[i]);
            }
        } else {
            this.targetList.push(object);
        }
    }

    removeTarget(object) {
        this.targetList.splice(this.targetList.indexOf(object), 1);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }


    setSpeed(speed, direction) {
        const rad = direction * Math.PI / 180;
        this.dx = Math.cos(rad) * speed;
        this.dy = Math.sin(rad) * speed;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.collision()) {
            this.dy *= -1;
        }
    }

    collision() {
        let isCollision = false;
        this.targetList.forEach((target) => {
            if (isCollision) {
                return false;
            }
            const points = target.getCornerPoints();
            points.forEach((point) => {
                const a = Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
                if (a <= this.radius) {
                    isCollision = true;
                    target.hit(this);
                }
            }, this);

            if (isCollision) {
                return false;
            }
            const bl = this.x - this.radius;
            const br = this.x + this.radius;
            const bt = this.y - this.radius;
            const bb = this.y + this.radius;
            if (points[0].x < br && bl < points[1].x) {
                if (points[0].y < bb && bt < points[2].y) {
                    isCollision = true;
                    target.hit(this);
                }
            }
        }, this);
        return isCollision;
    }

    changeAngle(ccw = false) {
        let theta = Math.atan(this.dy / this.dx);
        const speed = this.dx / Math.cos(theta);
        if (ccw) {
            theta -= Math.PI * 5 / 180;
        } else {
            theta += Math.PI * 5 / 180;
        }

        if (theta <= -0.7853981634 || theta >= 0.5235987756) {
            // 変更なしにする
            return;
        }
        this.dx = Math.cos(theta) * speed;
        this.dy = Math.sin(theta) * speed;
    }

    fixPosition() {
        const left = this.x - this.radius;
        if (left < 0) {
            this.x += Math.abs(left);
            this.reflectionX();
        }

        const top = this.y - this.radius;
        if (top < 0) {
            this.y += Math.abs(top);
            this.reflectionY();
        }

        const right = this.x + this.radius;
        if (right > Breakout.width) {
            this.x -= right - Breakout.width;
            this.reflectionX();
        }

        if (top > Breakout.height) {
            Breakout.setGameOver();
        }
    }

    reflectionX() {
        this.dx *= -1;
    }

    reflectionY() {
        this.dy *= -1;
    }


    draw(context) {
        this.move();
        this.fixPosition();

        context.save();

        context.fillStyle = this.color;
        context.translate(this.x, this.y);

        context.beginPath();
        context.arc(0, 0, this.radius, 0, 2 * Math.PI);
        context.fill();

        context.restore();
    }
}