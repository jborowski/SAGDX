SAGDX.introState = function(game){};

SAGDX.introState.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debugMode:false,
  justToggled:null,
  dialogue: ["Initiating diagnostic procedure",
             "Press left arrow to move left",
             "Press right arrow to move right",
             "Press space to jump",
             "FATAL ERROR: Core component 0x5AFF missing",
             "Press R to sabotage own systems"],
  tutorialPoint: 0,
  textTimer: 0,

  preload: function(){
    this.game.world.alpha = 0;
    this.game.add.tween(this.game.world).to({ alpha:1 }, 750).start();

  },
  create: function(){

    this.game.renderer.renderSession.roundPixels = true;

    this.bgMap = this.game.add.tilemap('introBackgroundLayerMap');
    this.bgMap.addTilesetImage('tileset');
    this.backgroundLayer = this.bgMap.createLayer('backgroundLayer');
    this.backgroundLayer.renderSettings.enableScrollDelta = false;

    this.collisionMap = this.game.add.tilemap('introCollisionLayerMap');
    this.collisionMap.addTilesetImage('tileset');
    this.collisionLayer = this.collisionMap.createLayer('collisionLayer');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 000000;

    this.player = new Player(this, this.game, 15*gridSize, 10*gridSize, 'player');

    this.keyboard = this.game.input.keyboard;

    this.game.world.bringToTop(this.backgroundLayer);
    this.game.world.bringToTop(this.player);

    this.dialogueBox = this.game.add.sprite(0, 535, 'dialogbox');
    this.dialogueBox.anchor.setTo(0, 1);
    this.dialogueBox.fixedToCamera = true;
    this.dialogueText = this.game.add.text(50, 410, "", { font: '20px Lato Black', fill: '#000' });
    this.dialogueText.fixedToCamera = true;

    this.lifts = this.game.add.group();
    for (var i = 0; i < 5; i++) {
      var lift = this.game.add.sprite( (12 + 4 * i) * gridSize, 20*gridSize, 'lift');
      this.game.physics.arcade.enable(lift);
      this.lifts.add(lift);
    }

    //this.music = this.sound.play('music', true);

  },
  update: function(){
    this.processTutorial();

    if(!this.player.cState.hurt){
      this.game.physics.arcade.collide(this.player, this.lifts, this.customTileContact, null, this);
    }
    this.game.physics.arcade.collide(this.player, this.collisionLayer, this.customTileContact, null, this);

    if(this.player.cState.outOfBounds){
      this.goToState("Intro2");
    }
  },
  customMobContact: function(firstObject, secondObject){
    firstObject.mobContact(secondObject);
  },
  customTileContact: function(firstObject, secondObject){
    firstObject.tileContact(secondObject);
  },
  setText: function(point){
    this.dialogueText.text = this.dialogue[point]
  },
  processTutorial: function(){
    if(this.tutorialPoint < this.dialogue.length) this.setText(this.tutorialPoint);
    switch (this.tutorialPoint) {
      case 0:
        this.textTimer++;
        if(this.textTimer > 300){
          this.tutorialPoint++;
          this.textTimer = 0;
        }
        break;
      case 1:
        if(this.keyboard.isDown(37)) this.tutorialPoint++;
        break;
      case 2:
        if(this.keyboard.isDown(39)) this.tutorialPoint++;
        break;
      case 3:
        if(this.keyboard.isDown(32)) this.tutorialPoint++;
        break;
      case 4:
        this.textTimer++;
        if(this.textTimer > 300){
          this.tutorialPoint++;
          this.textTimer = 0;
        }
        break;
      case 5:
        if(this.keyboard.isDown(82)){
          this.tutorialPoint++;
          this.dialogueBox.destroy();
          this.dialogueText.text = "";
          this.endTutorial();
        }
      default:
        break;
    }
  },
  endTutorial: function(){
    this.player.animations.play('hurtLeft');
    this.player.cState.inputDisabled = true;
    this.game.time.events.add(1500, function(){ this.lifts.destroy(true); }, this);
  },
  goToState: function(state){
    var fadeOut = this.game.add.tween(this.game.world).to({ alpha:0 }, 750);
    fadeOut.onComplete.add(function(){this.state.start(state);}, this);
    fadeOut.start();
  }

}
