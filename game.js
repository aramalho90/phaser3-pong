/*@Author: André Ramalho    
*
* Created at     : 2020-09-11 02:21:56 
* Last modified  : 2020-09-25 12:31:40
*
*/ 

    // Setup configs
    var config = {
    type: Phaser.AUTO,
    width: 960,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

    //Creates two scenes
    var gameScene = new Phaser.Scene("game");
    var titleScene = new Phaser.Scene("title");
    
    //Initialize the game with the proper configs
    var game = new Phaser.Game(config);

    //Add the scenes to the game and start the title menu
    game.scene.add('title', titleScene);
    game.scene.add("game", gameScene);
    game.scene.start('title');

    //Init global vars
    var ball;
    var music;
    var cpu_scores;
    var player_scores;
    var blip;
    var whack;
    var whistle;
    var score1_text;
    var score2_text;
    let score1=0;
    let score2=0;


// ------------------------- TITLE MENU SCENE -----------------------------------------

    titleScene.preload = function ()
    {
        // Load images
        this.load.image('menu', 'assets/menu.jpg');
        this.load.image('startButton', 'assets/start.png');
        
        // Load audio
        this.load.audio('start_menu','assets/start_menu.wav');

    }
    
       titleScene.create = function ()
    {
        // Add the background image   
        this.add.image(480, 360, 'menu');
        
        //Add the start button and the onClick event   
        var playButton = this.add.image(480,600, 'startButton')
        .setScale(0.2)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => switchScenes(this.scene));

        //Keep the music playing if not focused
        this.sound.pauseOnBlur=false;
           
        //Add the background music   
        music = this.sound.add('start_menu');
        music.setVolume(0.3);
        music.setLoop(true);  
        music.play();
        
 
    }

    titleScene.update = function ()
    {
       
    }

    
// ----------------------------------- GAME SCENE ------------------------------------------
    
    gameScene.preload = function ()
    {
        // Load images
        this.load.image('background', 'assets/background.png');
        this.load.image('paddle', 'assets/paddle1.png');
        this.load.image('ball', 'assets/ball.png');
        
        //Load audio
        this.load.audio('blip','assets/blip.wav');
        this.load.audio('cpu_scores','assets/error.wav');
        this.load.audio('player_scores','assets/coin.wav');
        this.load.audio('whack','assets/whack.wav');
        this.load.audio('backgroundMusic','assets/background.wav');
        this.load.audio('beeper','assets/beeper.wav');
        this.load.audio('whistle','assets/whistle.wav');
        this.load.audio('game_over','assets/game_over.wav');
        this.load.audio('victory','assets/victory.wav');

    }

    gameScene.create = function ()
    {
        // Add the background image   
        this.add.image(480, 360, 'background');
        
        //Add the background music   
        music = this.sound.add('backgroundMusic');
        music.setVolume(0.1);
        music.setLoop(true);
        
        //Add all the sound effects to the scene
        player_scores = this.sound.add('player_scores', {volume: 0.5});
        cpu_scores = this.sound.add('cpu_scores', {volume: 0.5});
        blip = this.sound.add('blip', {volume: 0.5});
        whack = this.sound.add('whack', {volume: 0.3});
        beeper = this.sound.add('beeper', {volume: 0.5});
        whistle = this.sound.add('whistle', {volume: 0.5});
        game_over = this.sound.add('game_over', {volume: 0.5});
        victory = this.sound.add('victory', {volume: 1});
        
        //Create two paddles, one for each player
        player = this.physics.add.sprite(50,160,'paddle');
        player.body.immovable=true;
        cpu = this.physics.add.sprite(909,160,'paddle');
        cpu.body.immovable=true;
        
        //Create the ball
        balls = this.physics.add.group();
        ball = balls.create(480, 360, 'ball');
        ball.setBounce(1);
        ball.setCollideWorldBounds(true);
        ball.allowGravity = false;
        
        //Play the beeper sfx and begin the match
        this.time.delayedCall(1000, function() {beeper.play()}, this);        
        this.time.delayedCall(2000, function() {beeper.play()}, this);        
        this.time.delayedCall(3000, function() {beeper.play()}, this);        
        this.time.delayedCall(4250, kickoff, this);        
        
        //Add collision between the ball and the paddles
        this.physics.add.collider(player, balls, function() {whack.play()}, null, this);
        this.physics.add.collider(cpu, balls, function() {whack.play()}, null, this);


        //Adds the scoreboards and all text, but hidden
        score1_text= this.add.text(400,10,score1,{
            font: "64px Gabriella",
            fill: "#ffffff",
            align: "center"
        });
        score1_text.visible=false;
        
        score2_text= this.add.text(530,10,score2,{
            font: "64px Gabriella",
            fill: "#ffffff",
            align: "center"
        });
        score2_text.visible=false;
        
        game_over_text= this.add.text(120,120,"GAME OVER",{
            font: "bold 128px Gabriella",
            fill: "#ff0000",
            align: "center"
        });
        game_over_text.visible=false;
        
        you_win_text= this.add.text(175,120,"YOU WIN!",{
            font: "bold 128px Gabriella",
            fill: "#0000ff",
            align: "center"
        });
        you_win_text.visible=false;
        
    }

    gameScene.update = function () 
    {   
        //NOTE: All code under this function will be constantly called
        
        //Update paddle position on the y axis with the mouse current position
        player.y = this.input.y;
        
        //Make the cpu paddle follow the ball
        cpu.body.velocity.setTo(ball.body.velocity.y);
        cpu.body.velocity.x=0;
        cpu.body.maxVelocity.y=250; //Set a speed limit to the paddle - higher difficulties should have a higher limit
        
        //Update the scoreboards
        score1_text.text=score1;
        score2_text.text=score2;

        //Limit paddle positioning within the canvas
        if (player.y < player.height / 2){
            player.y = player.height / 2;
        } else if (player.y > game.canvas.height - player.height / 2){
            player.y= game.canvas.height - player.height / 2;
        }
        
        if (cpu.y < cpu.height / 2){
            cpu.y = cpu.height / 2;
        } else if (cpu.y > game.canvas.height - cpu.height / 2){
            cpu.y= game.canvas.height - cpu.height / 2;
        }
        
        //If the ball hits the canvas' limit update the score or just play a sound
        if(ball.body.blocked.left){
            cpu_scores.play();
            score2+=1;
            score2_text.setText(score2);

            }
        else if (ball.body.blocked.right){
            player_scores.play();
            score1+=1;
            score1_text.setText(score1);
        }
        else if (ball.body.blocked.up){
            blip.play();
        }
        else if (ball.body.blocked.down){
            blip.play();
        } 
        
        //Match ends at 3 points
        if (score2==3){
            this.scene.pause();
            music.stop();
            game_over.play()       
            game_over_text.visible=true; //Show game over text
        } else if (score1==3){
            this.scene.pause();
            music.stop();
            victory.play()       
            you_win_text.visible=true; //Show victory text
        }
        
    }

    function kickoff(){
        whistle.play();
        
        //Randomize ball speed
        //ball.setVelocity(Phaser.Math.Between(-400, 400), Phaser.Math.Between(-400, 400)); 
        
        //Set the ball in motion
        ball.setVelocity(-400, 400);
        music.play();
        
        //Show scores
        score1_text.visible=true;
        score2_text.visible=true;
    }
    
function switchScenes(scene){
    //Stop title menu song and switch scenes
    scene.switch('game');
    music.stop();
}