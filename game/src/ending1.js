SAGDX.ending1State = function(game){};

SAGDX.ending1State.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debugMode:false,
  justToggled:null,
  dialogueTexts: [ "Target acquired.",
              "The Doctor's performing destructive analysis\nin the back right now.",
              "Even if the Factory makes more of these things\nwe'll be ready.",
              "The mission is a success.",
              "Tell the boys we're coming home."],
  dialoguePoint: 0,
  textTimer: 0,
  dialogues: [],
  dialogueY: 2,

  preload: function(){
    this.game.world.alpha = 0;
    this.game.add.tween(this.game.world).to({ alpha:1 }, 10).start();
  },
  create: function(){
    console.log("ENDING!");
    this.game.renderer.renderSession.roundPixels = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 000000;

    this.player = this.game.add.sprite(35*gridSize, 25*gridSize, 'player');
    this.player.animations.add('hurtLeft', [73]);
    this.player.animations.play('hurtLeft', 2, true);
    
    this.title = this.game.add.sprite(width/2, height/2, 'title');
    this.title.anchor.setTo(0.5, 0.5);
    this.title.alpha = 0;
    
    var newText;
    for(var ii=0; ii<this.dialogueTexts.length; ii+=1){
      newText = this.game.add.text(3*gridSize, this.dialogueY*gridSize, this.dialogueTexts[ii], { font: '25px Lato Black', fill: '#4444FF' });
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
