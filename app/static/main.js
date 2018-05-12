var socket;
var colorHash = new ColorHash({
    saturation: 1,
    lightness: 0.25
});
var GOLD_COLOR = "#CFB53B";

ROT.Display.prototype.drawString = function(x, y, str, fg, bg) {
    fg = fg || this.getOptions().fg;
    bg = bg || this.getOptions().bg;

    for (var i = 0; i < str.length; ++i) {
        this.draw(x + i, y, str[i], fg, bg);
    }
};

function InputWidget(x, y) {
    this.x = x;
    this.y = y;
    this.value = "";
    this.fg = null;
    this.bg = "#222";
    this.bgActive = "#666";
    this.active = false;
    this.width = 40;
    this.password = false;
}

InputWidget.prototype.draw = function(display) {
    var value;
    if (this.password) {
        value = "";
        for (var i = 0; i < this.value.length; ++i)
            value += "*";
    } else {
        value = this.value;
    }
    display.drawString(this.x, this.y, sprintf("%-" + this.width + "s", value), this.fg, this.active ? this.bgActive : this.bg);
};

InputWidget.prototype.handle = function(type, data) {
    if (type === "keypress" && data.charCode && (data.charCode >= 32)) {
        if (this.value.length < this.width) {
            var key = String.fromCharCode(data.charCode);
            this.value += key;
        }
    }
    if (type === "keydown") {
        if (data.keyCode === 8) {
            // backspace
            this.value = this.value.slice(0, this.value.length - 1);
        }
    }
};

function AuthScreen() {
    this.contestName = "Командная олимпиада";
    this.login = new InputWidget(9, 2);
    this.login.active = true;
    this.login.value = window.localStorage.login || "";
    this.password = new InputWidget(9, 3);
    this.password.password = true;
    this.password.value = window.localStorage.password || "";
    this.error = "";
}

AuthScreen.prototype.draw = function(display) {
    display.clear();

    display.drawText(0, 0, this.contestName);
    display.drawText(0, 2, "login");
    display.drawText(0, 3, "password");
    display.drawText(0, 5, "%c{red}" + this.error + "%c{}");
    display.drawText(0, 7, "- Поле для ввода выбирается стрелочками");
    display.drawText(0, 8, "- Нажмите ENTER чтобы войти");

    this.login.draw(display);
    this.password.draw(display);
};

AuthScreen.prototype.handle = function(type, data) {
    if (type === "login.fail") {
        this.error = "Неправильный логин или пароль";
    }

    if (type === "keydown") {
        this.error = "";
        if (data.keyCode === 13) {
            socket.emit('login', this.login.value, this.password.value);
        }

        if (data.keyCode === 38) {
            this.login.active = true;
            this.password.active = false;
        }

        if (data.keyCode === 40) {
            this.login.active = false;
            this.password.active = true;
        }
    }
    if (this.login.active)
        this.login.handle(type, data);
    else
        this.password.handle(type, data);
};

function GameScreen() {
    this.level = null;
    this.ghosts = {};
    this.viewport = {
        position: {
            x: 10,
            y: 10
        },
        size: {
            x: 80,
            y: 25
        }
    };
    socket.emit('map.send');
}

GameScreen.prototype.inbounds = function(x, y) {
    if (!this.level) return false;
    return (x >= 0 && x < this.level.width && y >= 0 && y < this.level.height);
};

GameScreen.prototype.at = function(x, y) {
    if (!this.inbounds(x, y)) {
        return " ";
    }

    if (x === this.level.player.x && y === this.level.player.y) {
        return "@";
    }

    return this.level.level[y][x];
};

GameScreen.prototype.drawGlyph = function(display, i, j, x, y) {
    if (!this.inbounds(x, y))
        return;
    var glyph = this.at(x, y);
    var fg = "#ccc";
    var bg = "#000";
    if (!this.level.visible[x][y]) {
        glyph = " ";
    } else {
        if (glyph === '@') {
            // player
            fg = "#0f0";
        } else if (glyph === ' ') {
            if (this.ghosts[x + "," + y]) {
                // ghost
                glyph = '@';
                fg = this.ghosts[x + "," + y];
            } else {
                // empty
                glyph = '.';
                fg = "#444";
            }
        } else if (glyph === '$') {
            // coin
            fg = GOLD_COLOR;
        } else if (glyph === 'd') {
            // secret
            glyph = "#";
        } else if (glyph === 'D') {
            // door
            glyph = '☒';
            var t = this.level.doors[x + "," + y];
            if (t >= 0) {
                fg = "#f00"
            } else {
                fg = "#0f0"
            }
        } else if (glyph === 's') {
            // computer / scoreboard
            glyph = '⌘';
            fg = "#f0f"
        }
    }
    display.draw(i, j, glyph, fg, bg);
};

GameScreen.prototype.draw = function(display) {
    if (!this.level)
        return;

    display.clear();
    for (var i = 0; i < this.viewport.size.x; ++i) {
        for (var j = 0; j < this.viewport.size.y; ++j) {
            var x = i + this.viewport.position.x;
            var y = j + this.viewport.position.y;
            this.drawGlyph(display, i, j, x, y);
        }
    }

    var bg = '#444';
    var fg = GOLD_COLOR;
    var w = display.getOptions().width;
    var h = display.getOptions().height;

    for (var i = 0; i < w; ++i) {
        display.draw(i, h - 1, ' ', null, bg);
    }

    display.draw(w - 10, h - 1, '|', null, bg);
    display.drawString(w - 8, h - 1, sprintf("$%d", this.level.coins), fg, bg);
};

GameScreen.prototype.buildGhosts = function() {
    this.ghosts = {};
    for (var login in this.level.ghosts) {
        if (!this.level.ghosts.hasOwnProperty(login)) {
            continue;
        }
        if (login === Game._login) {
            continue;
        }
        var pos = this.level.ghosts[login];
        this.ghosts[pos.x + "," + pos.y] = colorHash.hex(login);
    }
};

GameScreen.prototype.controls = {
    37: {
        x: -1,
        y: 0,
        dir: "left"
    },
    39: {
        x: 1,
        y: 0,
        dir: "right"
    },
    38: {
        x: 0,
        y: -1,
        dir: "up"
    },
    40: {
        x: 0,
        y: 1,
        dir: "down"
    }
};

GameScreen.prototype.handle = function(type, data) {
    if (type === 'ghost.position') {
        this.level.ghosts[data.login] = {
            x: data.x,
            y: data.y
        };
        this.buildGhosts();
    }

    if (type === 'problem.ok') {
        for (var x in this.level.doors) {
            if (this.level.doors.hasOwnProperty(x)) {
                if (this.level.doors[x] == data) {
                    this.level.doors[x] = -1;
                }
            }
        }
    }

    if (type === 'map.recv') {
        this.level = data;
        this.viewport.position.x = this.level.player.x - Math.floor(this.viewport.size.x / 2);
        this.viewport.position.y = this.level.player.y - Math.floor(this.viewport.size.y / 2);
        this.level.visible = new Array(this.level.width);
        for (var i = 0; i < this.level.width; ++i) {
            this.level.visible[i] = [];
            for (var j = 0; j < this.level.height; ++j) {
                this.level.visible[i].push(false);
            }
        }
        this.buildGhosts();
    }

    if (type === 'keydown') {
        var delta = this.controls[data.keyCode];
        if (delta) {
            socket.emit('player.move', delta.dir)
        }
    }


    if (type === 'player.position') {
        this.level.player.x = data.x;
        this.level.player.y = data.y;
        this.viewport.position.x = this.level.player.x - Math.floor(this.viewport.size.x / 2);
        this.viewport.position.y = this.level.player.y - Math.floor(this.viewport.size.y / 2);
        if (this.level.level[data.y][data.x] === '$') {
            this.level.coins++;
            this.level.level[data.y][data.x] = ' ';
        }
    }

    if (type === 'map.visible') {
        for (var i = 0; i < this.level.width; ++i) {
            for (var j = 0; j < this.level.height; ++j) {
                this.level.visible[i][j] = data[i][j];
            }
        }
    }
};

function ScoreboardDialog(data) {
    this.size = {
        x: 70,
        y: 20
    };

    this.data = [];
    this.offset = 0;
    for (var row = 0; row < data.length; ++row) {
        this.data.push([
            row + 1,
            data[row][2],
            data[row][0],
            "$" + data[row][1]
        ])
    }
    this.title = "Таблица результатов";
    this.columns = [
        {
            "name": "NN",
            "width": 0.1
        },
        {
            "name": "Команда",
            "width": 0.6
        },
        {
            "name": "Очки",
            "width": 0.2
        },
        {
            "name": "$$",
            "width": 0.1,
            "fg": GOLD_COLOR
        }
    ]
}

ScoreboardDialog.prototype.position = function() {
    var w = Game._display.getOptions().width;
    var h = Game._display.getOptions().height;
    return {
        x: Math.floor((w - this.size.x) / 2),
        y: Math.floor((h - this.size.y) / 2)
    };
};

ScoreboardDialog.prototype.draw = function(display) {
    Game._gamescreen.draw(display);
    var w = display.getOptions().width;
    var h = display.getOptions().height;
    var size = this.size;
    var pos = this.position();

    // fill
    for (var i = pos.x + 1; i < pos.x + size.x - 1; ++i) {
        for (var j = pos.y + 1; j < pos.y + size.y - 1; ++j) {
            display.draw(i, j, ' ');
        }
    }

    // draw outline
    for (var i = pos.x + 1; i < pos.x + size.x - 1; ++i) {
        display.draw(i, pos.y, '═');
        display.draw(i, pos.y + 2, '─');
        display.draw(i, pos.y + size.y - 1, '═');
        display.draw(i, pos.y + 4, '─');
    }

    for (var j = pos.y + 1; j < pos.y + size.y - 1; ++j) {
        display.draw(pos.x, j, '║');
        display.draw(pos.x + size.x - 1, j, '║');
    }

    var len = this.title.length;
    display.drawString(pos.x + Math.floor((size.x - len) / 2), pos.y + 1, this.title);

    // toolbar
    display.drawText(1, h - 1, "%b{#444}%c{red}ESC%c{} - закрыть окно | %c{red}↑%c{}/%c{red}↓%c{} - вверх/вниз");

    // draw table
    var ew = size.x - 2 - (this.columns.length - 1);

    var ox = pos.x + 1;
    var oy = pos.y + 3;

    for (var i = 0; i < this.columns.length; ++i) {
        var c = this.columns[i];
        var cw = Math.round(c.width * ew);
        if (i > 0) {
            display.draw(ox, oy - 1, '┬');
            display.draw(ox, oy, '│');
            display.draw(ox, oy + 1, '┴');
            ox++;
        }
        display.drawString(ox + Math.floor((cw - c.name.length) / 2), oy, c.name, c.fg);
        ox += cw;
    }
    oy += 2;
    for (var idx = this.offset; (idx < this.data.length) && (oy < pos.y + size.y - 1); ++idx) {
        ox = pos.x + 1;
        for (var i = 0; i < this.columns.length; ++i) {
            var c = this.columns[i];
            var cw = Math.round(c.width * ew);
            if (i > 0) {
                // display.draw(ox, oy, '⋮');
                ox++;
            }
            display.drawString(ox + Math.floor((cw - this.data[idx][i].toString().length) / 2), oy, this.data[idx][i].toString(), c.fg);
            ox += cw;
        }
        oy++;
    }

    display.draw(pos.x, pos.y, '╔');
    display.draw(pos.x, pos.y + 2, '╟');
    display.draw(pos.x, pos.y + 4, '╟');
    display.draw(pos.x + size.x - 1, pos.y + 2, '╢');
    display.draw(pos.x + size.x - 1, pos.y + 4, '╢');
    display.draw(pos.x + size.x - 1, pos.y, '╗');
    display.draw(pos.x, pos.y + size.y - 1, '╚');
    display.draw(pos.x + size.x - 1, pos.y + size.y - 1, '╝');
};

ScoreboardDialog.prototype.handle = function(type, data) {
    if (type === "keydown") {
        if (data.keyCode === 27) {
            Game.switch(Game._gamescreen);
        }

        if (data.keyCode === 38) {
            if (this.offset > 0) {
                this.offset--;
            }
        }

        if (data.keyCode === 40) {
            if (this.offset < this.data.length - (this.size.y - 6)) {
                this.offset++;
            }
        }
    }

    if (type === "ghost.position") {
        Game._gamescreen.handle(type, data);
    }
};


function ProblemDialog(problem) {
    this.size = {
        x: 70,
        y: 20
    };

    var size = this.size;
    var pos = this.position();

    this.problem = problem;
    this.error = "";
    if (this.problem.type === "answer") {
        this.answer = new InputWidget(pos.x + 9, pos.y + size.y - 3);
        this.answer.active = true;
        this.answer.width = size.x - 11;
    }

    if (this.problem.statement_url) {
        this.problem.statement =
            "Чтобы открыть условие этой задачи, нажмите на ссылку в левом верхнем углу экрана.";
    }
}

ProblemDialog.prototype.position = function() {
    var w = Game._display.getOptions().width;
    var h = Game._display.getOptions().height;
    return {
        x: Math.floor((w - this.size.x) / 2),
        y: Math.floor((h - this.size.y) / 2)
    };
};

ProblemDialog.prototype.handle = function(type, data) {
    if (type === "problem.wrong_answer") {
        this.error = data;
    }

    if (type === "ghost.position") {
        Game._gamescreen.handle(type, data);
    }

    if (type === "keydown") {
        this.error = "";
        if (data.keyCode === 27) {
            Game.switch(Game._gamescreen);
        }

        if (data.keyCode === 13 && this.answer) {
            if (!this.answer.value) {
                this.error = "Поле ответа пустое!";
                return;
            }
            socket.emit('problem.answer', this.problem.id, this.answer.value);
        }
    }

    if (this.answer) {
        this.answer.handle(type, data);
    }
};

ProblemDialog.prototype.enter = function() {
    if (this.problem.statement_url) {
        var el = document.getElementById("statement_href");
        el.style.display = "";
        el.href = this.problem.statement_url;
    }
};

ProblemDialog.prototype.exit = function() {
    var el = document.getElementById("statement_href");
    el.style.display = "none";
};

ProblemDialog.prototype.draw = function(display) {
    Game._gamescreen.draw(display);
    var w = display.getOptions().width;
    var h = display.getOptions().height;
    var size = this.size;
    var pos = this.position();

    // fill
    for (var i = pos.x + 1; i < pos.x + size.x - 1; ++i) {
        for (var j = pos.y + 1; j < pos.y + size.y - 1; ++j) {
            display.draw(i, j, ' ');
        }
    }

    // draw outline
    for (var i = pos.x + 1; i < pos.x + size.x - 1; ++i) {
        display.draw(i, pos.y, '═');
        display.draw(i, pos.y + 2, '─');
        display.draw(i, pos.y + size.y - 1, '═');
    }

    for (var j = pos.y + 1; j < pos.y + size.y - 1; ++j) {
        display.draw(pos.x, j, '║');
        display.draw(pos.x + size.x - 1, j, '║');
    }

    display.draw(pos.x, pos.y, '╔');
    display.draw(pos.x, pos.y + 2, '╟');
    display.draw(pos.x + size.x - 1, pos.y + 2, '╢');
    display.draw(pos.x + size.x - 1, pos.y, '╗');
    display.draw(pos.x, pos.y + size.y - 1, '╚');
    display.draw(pos.x + size.x - 1, pos.y + size.y - 1, '╝');

    var len = this.problem.name.length;
    display.drawString(pos.x + Math.floor((size.x - len) / 2), pos.y + 1, this.problem.name);
    if (this.problem.reward > 0)
        display.drawString(pos.x + 1, pos.y + 1, "Награда: " + this.problem.cur_reward, GOLD_COLOR);

    // toolbar
    display.drawText(1, h - 1, "%b{#444}%c{red}ESC%c{} - закрыть окно" + (this.answer ? " | %c{red}ENTER%c{} - отправить ответ" : ""));
    display.drawText(pos.x + 2, pos.y + 4, this.problem.statement || "", size.x - 4);

    if (this.answer) {
        display.drawText(pos.x + 2, pos.y + size.y - 3, "Ответ:");
        display.drawString(pos.x + 2, pos.y + size.y - 2, this.error, "red");
        this.answer.draw(display);
    } else {
        display.drawText(pos.x + 2, pos.y + size.y - 4,
            "Сдавайте решение этой задачи в задачу " +
            this.problem.short_name + " в тестирующей системе " +
            "(ссылка опять же в левом верхнем углу экрана).", size.x - 4);
    }
};

var SocketHandlers = {
    'login.ok': function() {
        window.localStorage.login = Game._screen.login.value;
        window.localStorage.password = Game._screen.password.value;
        Game._login = Game._screen.login.value;
        Game.switch(Game._gamescreen = new GameScreen());
    },

    'login.fail': function() {
        Game.handle('login.fail');
    },

    'map.recv': function(data) {
        Game.handle('map.recv', msgpack.decode(new Uint8Array(data)));
    },

    'player.position': function(x, y) {
        Game.handle('player.position', {
            x: x,
            y: y
        })
    },

    'ghost.position': function(login, x, y) {
        Game.handle('ghost.position', {
            login: login,
            x: x,
            y: y
        })
    },

    'map.visible': function(visible) {
        Game.handle('map.visible', msgpack.decode(new Uint8Array(visible)));
    },

    'problem.view': function(data) {
        data = msgpack.decode(new Uint8Array(data));
        Game.switch(new ProblemDialog(data));
    },

    'scoreboard.view': function(data) {
        data = msgpack.decode(new Uint8Array(data));
        Game.switch(new ScoreboardDialog(data))
    },

    'problem.wrong_answer': function(msg) {
        Game.handle('problem.wrong_answer', msg);
    },

    'problem.ok': function(problem) {
        Game.switch(Game._gamescreen);
        Game.handle('problem.ok', problem);
    }
};

var Game = {
    _display: null,
    _screen: null,
    _gamescreen: null,

    init: function() {
        socket = io();
        for (var key in SocketHandlers) {
            if (SocketHandlers.hasOwnProperty(key)) {
                socket.on(key, SocketHandlers[key]);
            }
        }

        var bindEvent = function(event) {
            window.addEventListener(event, function(e) {
                Game.handle(event, e);
            })
        };

        bindEvent('keydown');
        bindEvent('keyup');
        bindEvent('keypress');

        Game._display = new ROT.Display({
            width: 80,
            height: 26,
            fontSize: 18
        });
        document.body.appendChild(Game._display.getContainer());

        Game.switch(new AuthScreen());
        Game.draw();
    },

    switch: function(screen) {
        if (Game._screen && Game._screen.exit)
            Game._screen.exit();
        Game._screen = screen;
        if (Game._screen && Game._screen.enter)
            Game._screen.enter();
        Game.draw();
    },

    draw: function() {
        //Game._display.clear();
        if (Game._screen && Game._screen.draw)
            Game._screen.draw(Game._display);
    },

    handle: function(event, data) {
        if (Game._screen && Game._screen.handle)
            Game._screen.handle(event, data);
        Game.draw();
    },

    deltaFont: function(x) {
        Game._display.setOptions({fontSize: Game._display.getOptions().fontSize + x});
    }
};