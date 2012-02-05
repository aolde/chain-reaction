/// <reference path="game.js" />
/// <reference path="levels.js" />
/// <reference path="util.drawer.js" />
/// <reference path="util.misc.js" />

function Ball(x, y, radius, color, drawer) {
    this.x = x;
    this.y = y;
    this.dx = util.getRandomDirection();
    this.dy = util.getRandomDirection();
    this.color = color;
    this.radius = radius;
    this.isBomb = false;
    this.isExploded = false;
    this.explodeOpenTime = null;
    this.state = Ball.states.NORMAL;
    this.depth = 0;
    this.drawer = drawer ? drawer : game.drawer;
}

Ball.states = {
    NORMAL: 'normal',
    EXPANDING: 'expanding',
    OPEN: 'open',
    CONTRACTING: 'contracting',
    CLOSED: 'closed'
};

Ball.prototype.draw = function () {
    if (this.isExploded)
        this.explodeUpdate();

    if (this.state == Ball.states.CLOSED)
        return;

    if (this.isBomb && !this.isExploded)
        this.drawer.circle(this.x, this.y, game.settings.explodeRadius, null, true);

    this.drawer.circle(this.x, this.y, this.radius, this.color);

    if (this.isExploded && !this.isBomb)
        this.drawScore();
};

Ball.prototype.drawScore = function () {
    var score = "+" + util.formatNumber(game.calculateScoreByDepth(this.depth));
    var textWidth = this.drawer.textWidth(score);

    if (textWidth < (this.radius * 2 - 5)) {
        this.drawer.text(score, this.x - (textWidth / 2), this.y - 8);
    }
};

Ball.prototype.move = function () {
    if (this.x + this.radius > game.boundary.right)
        this.dx = this.dx * -1;
    else if (this.x - this.radius < game.boundary.left)
        this.dx = this.dx * -1;

    if (this.y + this.radius > game.boundary.bottom)
        this.dy = this.dy * -1;
    else if (this.y - this.radius < game.boundary.top)
        this.dy = this.dy * -1;

    this.x += this.dx;
    this.y += this.dy;
};

Ball.prototype.explode = function () {
    this.isExploded = true;
    this.state = Ball.states.EXPANDING;
};

Ball.prototype.explodeWith = function (ball) {
    this.explode();
    this.depth = ball.depth + 1;
};

Ball.prototype.explodeUpdate = function () {
    switch (this.state) {
        case Ball.states.CLOSED:
            return;
        case Ball.states.EXPANDING:
            if (this.radius <= game.settings.explodeRadius - 2)
                this.radius += 2;
            else
                this.state = Ball.states.OPEN;
            break;
        case Ball.states.OPEN:
            var now = new Date().getTime();

            if (this.explodeOpenTime == null)
                this.explodeOpenTime = now;
            else if ((now - this.explodeOpenTime) >= game.settings.explodeTime)
                this.state = Ball.states.CONTRACTING;

            break;
        case Ball.states.CONTRACTING:
            if (this.radius >= 2)
                this.radius -= 2;
            else
                this.state = Ball.states.CLOSED;
            break;
    }
};

Ball.prototype.getClosestBall = function (balls) {
    if (balls == null)
        return null;

    for (var i in balls) {
        var ball = balls[i];
        if (ball.state != Ball.states.CLOSED && this.isInsideBall(ball))
            return ball;
    }

    return null;
};

Ball.prototype.isInsideBall = function (ball) {
    var dx = ball.x - this.x;
    var dy = ball.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    return (dist < this.radius + ball.radius);
};

Ball.isClosed = function (ball) {
    return ball.state == Ball.states.CLOSED;
};

Ball.create = function () {
    var x = util.randomNumber(game.settings.ballSize, game.boundary.right - game.settings.ballSize);
    var y = util.randomNumber(game.settings.ballSize, game.boundary.bottom - game.settings.ballSize);
    var radius = game.settings.ballSize / 2;
    var color = util.randomVibrantColor();

    return new Ball(x, y, radius, color);
};