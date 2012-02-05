/*globals $,Ball,clearInterval,Drawer,levels*/
/// <reference path="levels.js" />
/// <reference path="ball.js" />
/// <reference path="util.drawer.js" />
/// <reference path="util.misc.js" />

var game = game || {};

game = {
    canvas: null,
    ctx: null,
    balls: [],
    explodedBalls: [],
    bomb: null,
    level: null,
    currentLevel: 1,
    gameLoopTimer: null,
    defaults: null,
    drawer: null,

    stats: {
        score: 0,
        levelScore: 0
    },

    settings: {
        fps: 35,
        ballSize: 12,
        explodeRadius: 14 * 3,
        explodeTime: 2000,
        bombColor: '#ddd'
    },

    boundary: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },

    events: {
        levelBegin: function () { },
        levelGoalReached: function () { },
        levelFinished: function () { },
        lastLevelFinished: function () { },
        gameOver: function () { },
        explosion: function (ball, score, levelScore) { }
    },

    init: function (canvasId) {
        this.reset();
        this.initContext(canvasId);

        // backup settings
        this.defaults = $.extend(true, {}, game.settings);

        this.startLevel(levels[this.currentLevel]);
    },

    reset: function () {
        this.stats = {
            score: 0,
            levelScore: 0
        };
        this.currentLevel = 1;
        this.level = levels[this.currentLevel];
    },

    startLevel: function (level) {
        this.level = level;
        this.currentLevel = level.number;
        this.explodedBalls = [];
        this.balls = [];
        this.bomb = null;
        this.stats.levelScore = 0;

        // default settings in case they have been changed
        this.settings = $.extend(true, {}, this.defaults);

        if (level.settings != null) {
            $.extend(true, this.settings, level.settings);
        }

        this.generateBalls(level);

        this.startGameLoop();
        this.events.levelBegin();
    },

    restartLevel: function () {
        this.stopGameLoop();
        this.startLevel(levels[this.currentLevel]);
    },

    loadNextLevel: function () {
        this.stopGameLoop();
        this.startLevel(levels[++this.currentLevel]);
    },

    generateBalls: function (level) {
        if (level == null)
            throw new Error("Level doesn't exist.");

        for (var i = 0; i < level.ballCount; i++) {
            var ball = Ball.create();
            this.balls.push(ball);
        }
    },

    onMouseUp: function (e) {
        if (game.bomb == null || game.bomb.isExploded)
            return;

        game.bomb.explode();
        game.addExplosion(game.bomb);
    },

    onMouseMove: function (e) {
        var x = e.clientX - game.canvas.offsetLeft + (window.scrollX ? window.scrollX : 0);
        var y = e.clientY - game.canvas.offsetTop + (window.scrollY ? window.scrollY : 0);

        if (game.bomb == null) {
            var radius = game.settings.ballSize / 2;
            game.bomb = new Ball(x, y, radius, game.settings.bombColor);
            game.bomb.isBomb = true;
        } else if (!game.bomb.isExploded) {
            game.bomb.x = x;
            game.bomb.y = y;
        }
    },

    startGameLoop: function () {
        this.gameLoopTimer = setInterval(this.gameLoop, 1000 / this.settings.fps);
    },

    stopGameLoop: function () {
        clearInterval(this.gameLoopTimer);
    },

    gameLoop: function () {
        game.drawer.clear();

        if (game.bomb != null)
            game.bomb.draw();

        for (var i in game.balls) {
            var ball = game.balls[i];

            if (!ball.isExploded) {
                var closestBall = ball.getClosestBall(game.explodedBalls);
                if (closestBall != null) {
                    ball.explodeWith(closestBall);
                    game.addExplosion(ball);
                }

                ball.move();
            }

            ball.draw();
        }


        game.checkGameState();
    },

    addExplosion: function (ball) {
        var newPoints = this.calculateScoreByDepth(ball.depth);

        this.explodedBalls.push(ball);
        this.stats.score += newPoints;
        this.stats.levelScore += newPoints;
        this.events.explosion(ball, this.stats.score, this.stats.levelScore);

        if (this.level.isGoal(this.explodedBalls.length)) {
            this.events.levelGoalReached();
        }
    },

    checkGameState: function () {
        if (this.explodedBalls.length > 0 && game.explodedBalls.every(Ball.isClosed)) {
            this.drawer.clear();
            this.stopGameLoop();

            if (this.level.passedGoal(this.explodedBalls.length)) {
                if (this.currentLevel < levels.length - 1)
                    this.events.levelFinished();
                else
                    this.events.lastLevelFinished();
            }
            else {
                // remove points earned this level because we didn't pass goals.
                this.stats.score -= this.stats.levelScore;

                this.events.gameOver();
            }
        }
    },

    changeFps: function (fps) {
        this.settings.fps = fps;
        this.stopGameLoop();
        this.startGameLoop();
    },

    calculateScoreByDepth: function (depth) {
        return depth * depth * depth * 100;
    },

    initContext: function (canvasId) {
        var canvas = $(canvasId)[0];

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.drawer = new Drawer(this.ctx);

        $(this.canvas).mouseup(this.onMouseUp)
                      .mousemove(this.onMouseMove);

        this.ctx.textBaseline = "top";
        this.ctx.font = "bold 14px Arial";
        this.ctx.globalAlpha = 0.8;

        this.boundary.right = canvas.width;
        this.boundary.bottom = canvas.height;
    },

    getExplosions: function () {
        if (this.explodedBalls == null || this.explodedBalls.length == 0)
            return 0;
        return this.explodedBalls.length - 1; // Remove 'bomb' ball
    },

    getLongestReaction: function () {
        return this.balls.reduce(function (previousBall, currentBall, index, array) {
            return (previousBall.depth > currentBall.depth ? previousBall : currentBall);
        }).depth;
    }
};