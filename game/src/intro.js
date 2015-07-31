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
             "Error cannot be rescued. Unit is defective.",
             "Press R to activate self-destruct sequence."],
  tutorialPoint: 0,
  textTimer: 0,

  create: function(){
    this.game.world.alpha = 1;
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

    this.parabgsBack = this.game.add.group();
    this.parabg1 = new ParaBackground(this, this.game, 0, 0.5, 0.8, this.parabgsBack, "parabackground3");
    this.parabg1.animations.add("full");
    this.parabg1.animations.play('full', 30, true);
    this.parabg2 = new ParaBackground(this, this.game, 768, 0.5, 0.8, this.parabgsBack, 'parabackground3');
    this.parabg2.animations.add("full");
    this.parabg2.animations.play('full', 30, true);

    this.overlays = this.game.add.group();
    this.overlay1 = new ParaBackground(this, this.game, 0, 0, 0.8, this.overlays, 'overlay');

    var distanceFilterGraphic = new Phaser.Graphics().beginFill(0x000000).drawRect(0,0,this.game.camera.width,this.game.camera.height);
    this.distanceFilter1 = this.game.add.sprite(0,0,distanceFilterGraphic.generateTexture());
    this.distanceFilter1.alpha = 0.1;
    this.distanceFilter2 = this.game.add.sprite(0,0,distanceFilterGraphic.generateTexture());
    this.distanceFilter2.alpha = 0.6;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 000000;

    this.player = new Player(this, this.game, 15*gridSize, 10*gridSize, 'player');
    this.player.cState.leftDisabled = true;
    this.player.cState.rightDisabled = true;
    this.player.cState.jumpDisabled = true;

    this.keyboard = this.game.input.keyboard;

    this.game.world.bringToTop(this.parabgsBack);
    this.game.world.bringToTop(this.distanceFilter2);
    this.game.world.bringToTop(this.distanceFilter1);
    this.game.world.bringToTop(this.overlays);
    this.game.world.bringToTop(this.backgroundLayer);
    this.game.world.bringToTop(this.player);

    this.dialogueBox = this.game.add.sprite(30, 380, 'instructionbox');
    this.dialogueBox.fixedToCamera = true;
    this.dialogueText = this.game.add.text(50, 50, "", { font: '20px Lato Black', fill: '#000' });
    this.dialogueBox.addChild(this.dialogueText);

    this.lifts = this.game.add.group();
    for (var i = 0; i < 5; i++) {
      var lift = this.game.add.sprite( (12 + 4 * i) * gridSize, 20*gridSize, 'lift', 1);
      this.game.physics.arcade.enable(lift);
      this.lifts.add(lift);
    }

    
    ambience.play('', 0, 0.8, true);
    //this.game.add.tween(this.game.world).to({ alpha:1 }, 750).start();
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
        if(this.textTimer > 150){
          this.tutorialPoint++;
          this.textTimer = 0;
          this.player.cState.leftDisabled = false;
        }
        break;
      case 1:
        if(this.keyboard.isDown(37)){
          this.tutorialPoint++;
          this.player.cState.rightDisabled = false;
        }
        break;
      case 2:
        if(this.keyboard.isDown(39)){
          this.tutorialPoint++;
          this.player.cState.jumpDisabled = false;
        }
        break;
      case 3:
        if(this.keyboard.isDown(32)) this.tutorialPoint++;
        break;
      case 4:
      case 5:
        this.textTimer++;
        if(this.textTimer > 150){
          this.tutorialPoint++;
          this.textTimer = 0;
        }
        break;
      case 6:
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
    //var fadeOut = this.game.add.tween(this.game.world).to({ alpha:0 }, 750);
    //fadeOut.onComplete.add(function(){
      this.state.start(state);
    //}, this);
    //fadeOut.start();
  }

}
