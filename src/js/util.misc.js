try {
    console = console || {};
    console.log = console.log || function () { };
} catch (err) { }

var util = {};
util.randomNumber = function (min, max) {
    return (Math.round((max - min) * Math.random() + min));
};

util.randomColor = function (ranges) {
    var color = (0xffffff * Math.random()).toString(16);
    return "#" + color.replace(/\./i, "").slice(0, 6);
};

util.randomVibrantColor = function () {
    var range = [70, 256];
    var g = function () {
        return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
    }
    return "rgb(" + g() + "," + g() + "," + g() + ")";
}

util.formatNumber = function (number) {
    if (!number) return "";
    var s = ('' + number).split('.');
    s[0] = s[0].split('').reverse().join('').match(/\d{1,3}/gi).join(',').split('').reverse().join('');
    return (s.join('.'));
};

util.getRandomDirection = function () {
    var direction = util.randomNumber(-2, 2);

    if (direction == 0)
        return this.getRandomDirection();

    return direction;
};