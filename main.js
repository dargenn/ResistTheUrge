var width = 400;
var height = 490;
var highestScore = 0;

var mainState = {
    preload: function () {
        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');
        game.load.image('computer', 'assets/computer.png');
        game.load.image('notebook', 'assets/notebook.png');
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function () {
        // Kolor tła - mozna zmienic na fajniejszy
        game.stage.backgroundColor = '#71c5cf';

        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Pozycja startowa
        this.bird = game.add.sprite(100, 245, 'bird');

        // Dodanie fizyki - potrzebna do ruchu, grawitacji i kolizji
        game.physics.arcade.enable(this.bird);

        // Grawitacja - jak szybko spada
        this.bird.body.gravity.y = 1000;

        // Na wcisniecie spacji - skacz
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        // Pusta grupa rur
        this.pipes = game.add.group();
        this.computers = game.add.group();
        this.notebooks = game.add.group();

        // Ruch rur
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        this.computerTimer = game.time.events.loop(3500, this.addComputer, this);
        this.notebookTimer = game.time.events.loop(2500, this.addNotebook, this);

        // Wyswietlanie wyniku
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0",
            {font: "30px Arial", fill: "#ffffff"});

        this.computerScore = 0;
        this.computerScoreLabel = game.add.text(20, 60, "0",
            {font: "30px Arial", fill: "#e8e242"});

        this.notebookScore = 0;
        this.notebookScoreLabel = game.add.text(20, 100, "0",
            {font: "30px Arial", fill: "#4de526"});

        this.highScoreLabel = this.game.add.text(20, 450, ("highScore" in localStorage ? "Highest score: " + localStorage.getItem("highScore") : "Highest score: 0"), {
            font: "20px Arial",
            fill: "#ffffff"
        });

        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5);

        this.jumpSound = game.add.audio('jump');

        // Create a label to use as a button
        var pauseLabel = game.add.text(300, 20, 'Pause', {font: '24px Arial', fill: '#fff'});
        pauseLabel.inputEnabled = true;
        pauseLabel.events.onInputUp.add(function () {
            // When the paus button is pressed, we pause the game
            game.paused = true;

            choiceLabel = game.add.text(width / 2, width - 150, 'Click anywhere to continue',
                {font: '30px Arial', fill: '#fff'});
            choiceLabel.anchor.setTo(0.5, 0.5);
            pauseLabel.visible = false;
        });

        game.input.onDown.add(unpause, self);

        function unpause(event) {
            if (game.paused) {
                choiceLabel.destroy();
                game.paused = false;
                pauseLabel.visible = true;
            }
        }
    },

    update: function () {
        // Restart gdy bedzie za wysoko lub za nisko
        if (this.bird.y < 0 || this.bird.y > 490) {
            this.restartGame();
        }

        // Restart, gdy wykryje kolizje
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        game.physics.arcade.overlap(this.bird, this.computers, this.hitComputer, null, this);
        game.physics.arcade.overlap(this.bird, this.notebooks, this.hitNotebook, null, this);

        // Przy spadaniu obrot jest do dolu
        if (this.bird.angle < 20)
            this.bird.angle += 1;
    },

    jump: function () {
        // Przy skoku puszczaj dzwiek
        this.jumpSound.play();

        // Nie moze skakac jesli jest martwy
        if (this.bird.alive == false)
            return;

        // Jak wysoko ma skakac
        this.bird.body.velocity.y = -350;

        // Animacja
        var animation = game.add.tween(this.bird);

        // 100ms na powrot do poprzedniego katu
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start();
    },

    restartGame: function () {
        if(this.score > localStorage.getItem("highScore") ){
            localStorage.setItem("highScore", this.score);
            this.highScoreLabel.text = "Highest score: " + localStorage.getItem("highScore");
        }
        game.state.start('main');
    },

    addOnePipe: function (x, y) {
        var pipe = game.add.sprite(x, y, 'pipe');
        this.pipes.add(pipe);
        game.physics.arcade.enable(pipe);

        // Ruch rur w lewo
        pipe.body.velocity.x = -200;

        // Gdy rura nie jest widoczna - usun ja
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function () {
        // Randomowa pozycja dziury w rurach - trzeba miec ktoredy przeleciec
        var hole = Math.floor(Math.random() * 5) + 1;

        // 6 rur z jedna dziura na dwa miejsca
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(400, i * 60 + 10);

        // Zinkrementuj wynik
        this.score++;
        this.labelScore.text = this.score;
    },

    addComputer: function () {
        var computer = game.add.sprite(Math.random() * 400, Math.random() * 400, 'computer');
        this.computers.add(computer);
        game.physics.arcade.enable(computer);

        computer.body.velocity.x = -200;
        computer.checkWorldBounds = true;
        computer.outOfBoundsKill = true;
    },

    addNotebook: function () {
        var notebook = game.add.sprite(Math.random() * 400, Math.random() * 400, 'notebook');
        this.notebooks.add(notebook);
        game.physics.arcade.enable(notebook);

        notebook.body.velocity.x = -200;
        notebook.checkWorldBounds = true;
        notebook.outOfBoundsKill = true;
    },

    hitPipe: function () {
        // Nie rob nic jezeli juz uderzyl
        if (this.bird.alive == false)
            return;

        // Zywy - false
        this.bird.alive = false;

        // Rury sie nie pojawiaja juz wiecej
        game.time.events.remove(this.timer);
        game.time.events.remove(this.computerTimer);
        game.time.events.remove(this.notebookTimer);

        // Zatrzymanie ruchu rur
        this.pipes.forEach(function (p) {
            p.body.velocity.x = 0;
        }, this);

        this.computers.forEach(function (p) {
            p.body.velocity.x = 0;
        }, this);

        this.notebooks.forEach(function (p) {
            p.body.velocity.x = 0;
        }, this);
    },

    hitComputer: function () {
        this.computers.destroy();
        this.computers = game.add.group();
        this.bird.body.gravity.y -= 100;

        this.computerScore++;
        this.computerScoreLabel.text = this.computerScore;
    },

    hitNotebook: function () {
        this.notebooks.destroy();
        this.notebooks = game.add.group();
        this.bird.body.gravity.y += 100;

        this.notebookScore++;
        this.notebookScoreLabel.text = this.notebookScore;
    }
};

//Init
var game = new Phaser.Game(width, height);

game.state.add('main', mainState);
game.state.start('main');