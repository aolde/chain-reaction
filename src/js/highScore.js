function HighScoreLocalStorage() {
    this.name = "Local High Score";

    this.highScores = [];
    this.loadChanges();
    this.isEmpty = this.highScores.length == 0;
}

HighScoreLocalStorage.prototype.save = function (name, points, level, callback) {
    var highScoreItem = {
        name: name,
        points: points,
        level: level,
        date: new Date()
    };

    this.highScores.push(highScoreItem);
    this.saveChanges();
    
    if (callback != null)
        callback(highScoreItem);
};

HighScoreLocalStorage.prototype.topScores = function (maxItems, callback) {
    if (callback == null)
        return;

    var topList = this.highScores.sort(this.byHighScore).slice(0, maxItems).map(function (obj, index) {
        obj.position = index + 1;
        return obj;
    });

    callback(this.highScores.sort(this.byHighScore).slice(0, maxItems));
};

HighScoreLocalStorage.prototype.byHighScore = function (a, b) {
    return b.points - a.points;
};

HighScoreLocalStorage.prototype.saveChanges = function () {
    localStorage.highScore = JSON.stringify(this.highScores);
};

HighScoreLocalStorage.prototype.loadChanges = function () {
    this.highScores = JSON.parse(localStorage.highScore ? localStorage.highScore : "[]");
};

/* ------------- */

function HighScoreService(game) {
    this.name = "Public High Score";
    this.game = game;
}

HighScoreService.prototype.save = function (name, points, level, callback) {
    var highScoreItem = {
        name: name,
        points: points,
        level: level,
        game: this.game
    };

    $.post("/highscore/ScoreService.ashx?addScore", highScoreItem, function (response) {
        if (response.error)
            console.error(response.error);
        else {
            callback();
        }
    });
};

HighScoreService.prototype.topScores = function (maxItems, callback) {
    if (callback == null)
        return;

    $.post("/ScoreService.ashx?getTopList", { game: this.game, count: maxItems }, function (response) {
        if (response.error)
            console.error(response.error);
        else {
            response = response.map(function (obj, index) {
                obj.position = index + 1;
                return obj;
            });
            callback(response);
        }
    });
};

var highScore = new HighScoreLocalStorage();