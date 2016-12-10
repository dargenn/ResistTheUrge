var mainState = {
    preload: function() {
        game.load.image('bird', 'assets/bird.png');
        game.load.image('pipe', 'assets/pipe.png');
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() {
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

        // Ruch rur
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // Wyswietlanie wyniku
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0",
            { font: "30px Arial", fill: "#ffffff" });

        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5);

        this.jumpSound = game.add.audio('jump');
    },

    update: function() {
        // Restart gdy bedzie za wysoko lub za nisko
        if (this.bird.y < 0 || this.bird.y > 490)
            this.restartGame();

        // Restart, gdy wykryje kolizje
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

        // Przy spadaniu obrot jest do dolu
        if (this.bird.angle < 20)
            this.bird.angle += 1;


    },

    jump: function() {
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

    restartGame: function() {
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        var pipe = game.add.sprite(x, y, 'pipe');
        this.pipes.add(pipe);
        game.physics.arcade.enable(pipe);

        // Ruch rur w lewo
        pipe.body.velocity.x = -200;

        // Gdy rura nie jest widoczna - usun ja
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
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

    hitPipe: function() {
        // Nie rob nic jezeli juz uderzyl
        if (this.bird.alive == false)
            return;

        // Zywy - false
        this.bird.alive = false;

        // Rury sie nie pojawiaja juz wiecej
        game.time.events.remove(this.timer);

        // Zatrzymanie ruchu rur
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    }
};

//Init
var game = new Phaser.Game(400, 490);

game.state.add('main', mainState);
game.state.start('main');