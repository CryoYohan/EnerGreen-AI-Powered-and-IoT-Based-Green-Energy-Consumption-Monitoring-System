var Eye = {

    size: 250,
    point: 15,
    speed: 100,
    pupil: { x: 6, y: 36 },
    eye: { x: 100, y: 65 },
    data: [],

    Add: function (val) {
        return val + Eye.size / 2;
    },

    Interval: function (color, distance, value) {
        var s = Math.abs((color.a - color.b) / (distance.b - distance.a));
        var v = value - distance.a;
        var c = color.a > color.b ? color.a - v * s : color.a + v * s;
        return Math.round(c);
    },


    Color: function (percent) {
        if (percent < 5) return Eye.Interval({ a: 255, b: 180 }, { a: 0, b: 2 }, percent);
        else if (percent < 10) return Eye.Interval({ a: 180, b: 100 }, { a: 2, b: 5 }, percent);
        else if (percent < 40) return Eye.Interval({ a: 100, b: 0 }, { a: 5, b: 30 }, percent);
        else if (percent < 70) return Eye.Interval({ a: 0, b: 100 }, { a: 30, b: 70 }, percent);
        else if (percent < 75) return Eye.Interval({ a: 100, b: 180 }, { a: 70, b: 80 }, percent);
        else return Eye.Interval({ a: 180, b: 255 }, { a: 80, b: 100 }, percent);
    },

    Pifagor: function (x, y) {
        return Math.sqrt(x * x + y * y);
    },

    Remove: function (radius, max, i) {
        if (radius > max) {
            Eye.data.splice(i, 1);
        }
    },

    Write: function (x, y, color, opacity) {
        Eye.ctx.fillStyle = 'rgba(255,' + color + ',0,' + opacity + ')';
        Eye.ctx.fillRect(Eye.Add(x), Eye.Add(y), 1, 1);
    },

    Style: function (point, i) {
        var radius = Eye.Pifagor(point.x, point.y);
        var percent = (radius - point.min) / (point.max - point.min) * 100;
        var color = Eye.Color(percent);
        var opacity = percent > 70 ? 1 - (percent - 70) / 30 : 1;

        Eye.Write(point.x, point.y, color, opacity);
        Eye.Remove(radius, point.max, i);
    },

    Move: function (i) {
        var point = Eye.data[i];
        point.x += point.X;
        point.y += point.Y;
        Eye.Style(point, i);
    },

    Update: function () {
        Eye.Fill(0.02);
        for (var i = 0; i < Eye.point; i++) {
            Eye.Point();
        }
        for (var j = 0; j < Eye.data.length; j++) {
            Eye.Move(j);
        }
    },

    Draw: function () {
        Eye.Update();
        requestAnimationFrame(Eye.Draw, Eye.canvas);
    },

    Noise: function (value) {
        return Math.random() * value - value / 2;
    },

    Radius: function (start, end) {
        return {
            max: Eye.Pifagor(end.x, end.y),
            min: Eye.Pifagor(start.x, start.y)
        }
    },

    Step: function (start, end) {
        return {
            x: (end.x - start.x) / Eye.speed,
            y: (end.y - start.y) / Eye.speed
        }
    },

    Position: function (type, angel, noise) {
        return {
            x: Eye[type].x * Math.cos(angel) + Eye.Noise(noise),
            y: Eye[type].y * Math.sin(angel) + Eye.Noise(noise)
        }
    },

    Point: function () {
        var angel = Math.random() * 2 * Math.PI;
        var start = Eye.Position('pupil', angel, 5);
        var end = Eye.Position('eye', angel, 25);
        var radius = Eye.Radius(start, end);
        var step = Eye.Step(start, end);

        Eye.data.push({
            x: start.x,
            y: start.y,
            X: step.x,
            Y: step.y,
            min: radius.min,
            max: radius.max
        });
    },

    Fill: function (a) {
        Eye.ctx.fillStyle = 'rgba(0,0,0,' + a + ')';
        Eye.ctx.fillRect(0, 0, Eye.size, Eye.size);
    },

    Init: function () {
        Eye.Fill(1);
        for (var i = 0; i < Eye.point; i++) {
            Eye.Point();
        }
        Eye.Draw();
    },

    Watch: function () {
        Eye.canvas = document.getElementById('canvas');
        Eye.canvas.width = Eye.size;
        Eye.canvas.height = Eye.size;
        Eye.ctx = Eye.canvas.getContext('2d');
        Eye.Init();
    }
};


Eye.Watch();