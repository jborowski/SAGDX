SAGDX.ending3State = function(game){};

SAGDX.ending3State.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debugMode:false,
  justToggled:null,
  dialogueTexts: [ "SYSTEM INFORMATION: DANGER!\nHEAT DAMAGE CRITICAL!",
                   "Servos: OFFLINE\nCommunications: OFFLINE",
                   "Pausebreaker P-PB14: OFFLINE",
                   "Emergency Breakers Tripped.",
                   "Activating Component P23.",
                   "Game Paused"
                  ],
  dialoguePoint: 0,
  textTimer: 0,
  dialogues: [],
  dialogueY: 2,

  preload: function(){
  },
  create: function(){
    this.game.world.alpha = 1;
    //this.game.add.tween(this.game.world).to({ alpha:1 }, 10).start();

    this.game.renderer.renderSession.roundPixels = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 000000;

    this.player = this.game.add.sprite(22*gridSize, 14*gridSize, 'player');
    this.player.animations.add('paused', [124]);
    this.player.animations.play('paused', 1, true);
    
    this.title = this.game.add.sprite(width/2, height/2, 'title');
    this.title.anchor.setTo(0.5, 0.5);
    this.title.alpha = 0;
    
    var newText;
    for(var ii=0; ii<this.dialogueTexts.length; ii+=1){
      newText = this.game.add.text(2*gridSize, this.dialogueY*gridSize, this.dialogueTexts[ii], { font: '25px Lato Black', fill: '#FFF' });
      newText.alpha = 0.0;
      newText.anchor.set(0.0);
      this.dialogueY += 5;
      this.dialogues.push(newText);
      this.game.add.tween(newText).to({ alpha:1 }, 2500, "Linear", true, 2500*ii);
    }
  },
  update: function(){
  },
  endEnding: function(){
  },
  goToState: function(state){
    //var fadeOut = this.game.add.tween(this.game.world).to({ alpha:0 }, 750);
    //fadeOut.onComplete.add(function(){
      this.state.start(state);
    //}, this);
    //fadeOut.start();
  }
}
