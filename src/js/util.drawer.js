function Drawer(ctx) {
    this.ctx = ctx;
}

Drawer.prototype = {
    clear: function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    },

    circle: function (x, y, radius, color, gradient) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, Math.round(radius), 0, Math.PI * 2, true);
        this.ctx.closePath();

        if (gradient) {
            var radgrad = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            radgrad.addColorStop(0, 'rgba(0,0,0,0)');
            radgrad.addColorStop(1, 'rgba(255,255,255,0.3)');

            this.ctx.fillStyle = radgrad;
        } else {
            this.ctx.fillStyle = color;
        }

        this.ctx.fill();
    },

    text: function (string, x, y) {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.ctx.fillText(string, x, y);
    },

    textWidth: function (string) {
        return this.ctx.measureText(string).width;
    }
};

