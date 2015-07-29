SAGDX.intro2State = function(game){};

SAGDX.intro2State.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debugMode:false,
  justToggled:null,
  dialogue: ["Something... is missing.",
             "I am... flawed.",
             "I am... incomplete.",
             "I am still operational."],
  dialoguePoint: 0,
  textTimer: 0,

  preload: function(){
    this.game.world.alpha = 0;
    this.game.add.tween(this.game.world).to({ alpha:1 }, 750).start();

  },
  create: function(){

    this.game.renderer.renderSession.roundPixels = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 000000;

    this.player = this.game.add.sprite(5*gridSize, 10*gridSize, 'player');
    this.player.animations.add('fallRight', [40,41,42,43,44,45,46,47,48,49,50,51,52,53,54]);
    this.player.animations.play('fallRight', 30, true);

    this.dialogueText = this.game.add.text(20*gridSize, 10*gridSize, "", { font: '25px Lato Black', fill: '#FFF' });
    this.dialogueText.fixedToCamera = true;

    this.title = this.game.add.sprite(width/2, height/2, 'title');
    this.title.anchor.setTo(0.5, 0.5);
    this.title.alpha = 0;

    //this.music = this.sound.play('music', true);

  },
  update: function(){
    if(this.dialoguePoint <= this.dialogue.length) this.processIntro();
  },
  setText: function(point){
    this.dialogueText.text = this.dialogue[point];
  },
  processIntro: function(){
    if(this.dialoguePoint == this.dialogue.length){
      this.dialoguePoint++;
      this.endIntro();
    } else {
      this.setText(this.dialoguePoint);
      this.textTimer++;
      if(this.textTimer > 200){
        this.dialoguePoint++;
        this.textTimer = 0;
      }
    }
  },
  endIntro: function(){
    this.game.add.tween(this.player).to({alpha:0}, 750).start();
    this.game.add.tween(this.dialogueText).to({alpha:0}, 750).start();
    var titleDrop = this.game.add.tween(this.title).to({ alpha:1 }, 10000);
    titleDrop.onComplete.add(function(){this.goToState("Level1");}, this);
    titleDrop.start();
  },
  goToState: function(state){
    var fadeOut = this.game.add.tween(this.game.world).to({ alpha:0 }, 750);
    fadeOut.onComplete.add(function(){this.state.start(state);}, this);
    fadeOut.start();
  }
}
