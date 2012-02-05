var levels = [];
levels.push(new Level(0, 0, 0));
levels.push(new Level(1, 1, 5));
levels.push(new Level(2, 2, 10));
levels.push(new Level(3, 4, 15));
levels.push(new Level(4, 6, 20));
levels.push(new Level(5, 10, 25));
levels.push(new Level(6, 15, 30));
levels.push(new Level(7, 18, 35));
levels.push(new Level(8, 22, 40));
levels.push(new Level(9, 30, 45));
levels.push(new Level(10, 37, 50));
levels.push(new Level(11, 48, 55));
levels.push(new Level(12, 54, 60));

function Level(number, requiredBalls, ballCount, settings) {
    this.number = number;
    this.requiredBalls = requiredBalls;
    this.ballCount = ballCount;
    this.settings = settings;
}

Level.prototype.isGoal = function (explodedBalls) {
    return (explodedBalls - 1) == this.requiredBalls; // remove the "bomb" ball.
};

Level.prototype.passedGoal = function (explodedBalls) {
    return (explodedBalls - 1) >= this.requiredBalls; // remove the "bomb" ball.
};

Level.create = function (number, requiredBalls, ballCount) {
    var settings = {};

    if (number == 2) {
        settings.ballSize = 10;
        settings.explodeRadius = 60;
        settings.explodeTime = 500;
        settings.bombColor = 'red';
    }

    if (number == 3) {
        settings.bombColor = 'green';
    }

    return new Level(number, requiredBalls, ballCount, settings);
}