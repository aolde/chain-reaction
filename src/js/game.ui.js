/// <reference path="game.js" />
/// <reference path="levels.js" />
/// <reference path="util.drawer.js" />
/// <reference path="util.misc.js" />

var DEV = false;
var CANVAS_ID = "#game";

var ui = ui || {};
ui.files = {
    start: 'start.html?4',
    levelSuccess: 'levelSuccess.html?1',
    levelFail: 'levelFail.html?1',
    submitScore: 'submitScore.html?1',
    highScore: 'highScore.html?1',
    gameDone: 'gameDone.html?1'
};
ui.overlayClose = function () {
    $('#overlay').hide();
};
ui.overlayOpen = function () {
    $('#overlay').show();
};
ui.loadOverlay = function (file) {
    $('#overlay').load(file, function () {
        ui.overlayOpen();
    });

};

ui.backgroundAnimation = function (callback) {
    var canvas = $('#background')[0];
    var ctx = canvas.getContext("2d");
    var drawer = new Drawer(ctx);
    var backgroundTimer = setInterval(function () { animateBackground(); }, 1000 / 35);
    var move = 0;
    var increaseMove = 15;

    var leftBall = new Ball(0 + 80, 340, 80, "#FF474F", drawer);
    var rightBall = new Ball(1020 - 80, 340, 80, "#BBC35C", drawer);
    var centerBall = new Ball(510, 350, 80, "#FFFFFF", drawer);

    $('#background').addClass('active');

    function animateBackground() {
        drawer.clear();

        centerBall.draw();

        rightBall.draw();
        leftBall.draw();

        if (move < 270) {
            rightBall.x -= increaseMove;
            leftBall.x += increaseMove;
        } else {
            rightBall.radius += increaseMove;
            leftBall.radius += increaseMove;
        }

        move += increaseMove;

        if (move >= 500) {
            clearInterval(backgroundTimer);
            $('#gameBoard').addClass('active');
            callback();
        }
    }
};

ui.updateStatusBar = function () {
    $('#score').text(util.formatNumber(game.stats.score));
    if (game.stats.levelScore > 0)
        $('#middleInfoHolder').text(util.formatNumber(game.stats.levelScore) + " points");
    $('#level').text(game.level.number + " of " + (levels.length - 1));
};

$(function () {
    game.events.levelBegin = function () {
        //console.log('LevelBegin', game.level);

        ui.updateStatusBar();
    };

    game.events.levelGoalReached = function () {
        //console.log('GoalReached');
    };

    game.events.levelFinished = function () {
        //console.log('LevelFinished');

        $('#levelProgress').width('0%');
        ui.loadOverlay(ui.files.levelSuccess);
    };

    game.events.lastLevelFinished = function () {
        $('#levelProgress').width('0%');
        $('#middleInfoHolder').text('');

        ui.loadOverlay(ui.files.gameDone);
    };

    game.events.gameOver = function () {
        //console.log('GameOver', game);

        $('#levelProgress').width('0%');
        ui.updateStatusBar();
        ui.loadOverlay(ui.files.levelFail);
    };

    game.events.explosion = function (ball, score, levelScore) {
        var exploded = game.getExplosions();
        var required = game.level.requiredBalls;

        var percentDone = (exploded / required) * 100;
        if (percentDone > 100) percentDone = 100;

        $('#levelProgress').attr('title', 'Exploded: ' + exploded + '\nGoal: ' + required);
        $('#levelProgress').width(percentDone + '%');

        ui.updateStatusBar();
    };

    if (!DEV)
        ui.backgroundAnimation(function () {
            ui.loadOverlay(ui.files.start);
        });
    else {
        $('#gameBoard').addClass('active');
        ui.loadOverlay(ui.files.start);
    }
});