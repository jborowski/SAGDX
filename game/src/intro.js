var SAGDX = {};

SAGDX.act1State = function(game){};

SAGDX.act1State.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debug:false,
  justToggled:null,
  paused:false,
  events: [],
  dialogue: null,

  preload: function(){
    this.game.world.alpha = 0;
    this.game.add.tween(this.game.world).to({ alpha:1 }, 750).start();
    this.game.load.tilemap('foregroundLayerMap', 'data/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('backgroundLayerMap', 'data/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('collisionLayerMap', 'data/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tileset', 'assets/levels/act1/tileset.png');

    this.game.load.text('spawns', 'data/spawns.json');
    this.game.load.text('events', 'data/events.json');

    this.game.load.spritesheet('player', 'assets/player/spritesheet.png', 64, 80);
    this.game.load.image('truck', 'assets/truck.png');
    this.game.load.image('carrier', 'assets/carrier.png');
    this.game.load.image('lift', 'assets/lift.png');
    this.game.load.image('flag', 'assets/flag.png');
  },
  create: function(){
    this.mobs = this.game.add.group();
    this.lifts = this.game.add.group();
    this.game.renderer.renderSession.roundPixels = true;
    this.map = this.game.add.tilemap('foregroundLayerMap');
    this.map.addTilesetImage('tileset');
    this.foregroundLayer = this.map.createLayer('foregroundLayer');
    this.foregroundLayer.resizeWorld();
    this.foregroundLayer.renderSettings.enableScrollDelta = false;

    this.bgMap = this.game.add.tilemap('backgroundLayerMap');
    this.bgMap.addTilesetImage('tileset');
    this.backgroundLayer = this.bgMap.createLayer('backgroundLayer');
    this.backgroundLayer.renderSettings.enableScrollDelta = false;

    this.collisionMap = this.game.add.tilemap('collisionLayerMap');
    this.collisionMap.addTilesetImage('tileset');
    this.collisionLayer = this.collisionMap.createLayer('collisionLayer');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 808080;

    this.player = new Player(this, this.game, 0, 15*gridSize, 'player');
    this.game.camera.follow(this.player);

    this.keyboard = this.game.input.keyboard;
    this.timerEvents = [];
    var spawnList = JSON.parse(this.game.cache.getText('spawns'));
    var ii, spawnDef;
    for(var ii=0; ii < spawnList.length; ii+=1){
      spawnDef = spawnList[ii];
      for(var jj=0; jj < spawnDef.spawns.length; jj+=1){
        if(spawnDef.type=="once"){
            this.spawnMob(this.mobs, spawnDef.unit, spawnDef.spawns[jj].x*gridSize, spawnDef.spawns[jj].y*gridSize, spawnDef.spawns[jj].firstWaypoint);
        } else if(spawnDef.type=="continous"){
            this.spawnMob(this.mobs, spawnDef.unit, spawnDef.spawns[jj].x*gridSize, spawnDef.spawns[jj].y*gridSize, spawnDef.spawns[jj].firstWaypoint);
            this.timerEvents.push(this.game.time.events.loop(spawnDef.interval*this.timeMultiplier, this.spawnMob, this, this.mobs, spawnDef.unit, spawnDef.spawns[jj].x*gridSize, spawnDef.spawns[jj].y*gridSize));
        }
      }
    }
    
    var thisEvent;
    this.events = JSON.parse(this.game.cache.getText('events'));
    for(var ii=0; ii < this.events.length; ii+=1){
      thisEvent = this.events[ii];
      thisEvent.triggered = false;
      if(thisEvent.x){ thisEvent.x *= gridSize; }
      if(thisEvent.y){ thisEvent.y *= gridSize; }
      if(thisEvent.type=="dialogue"){
        thisEvent.resultCallbackName = "sendDialogue";
      }
    }

    this.game.world.bringToTop(this.mobs);
    this.game.world.bringToTop(this.lifts);
    this.game.world.bringToTop(this.player);
    this.game.world.bringToTop(this.foregroundLayer);

    if(this.debug){
      this.debugText = this.game.add.text(5, 50, 'DEBUG INFO ', { fontSize: '10px', fill: '#FFF' });
      this.debugText.fixedToCamera = true;
    }
  },
  update: function(){
    if(this.debug){
      this.debugText.text = "";
    }
    
    if(this.dialogue){
      this.processDialogue();
    } else {
      this.checkInput();

      this.game.physics.arcade.collide(this.mobs, this.lifts);
      if(!this.player.cState.hurt){
        this.game.physics.arcade.collide(this.player, this.mobs, this.customMobContact, this.checkmobs, this);
      }
      this.game.physics.arcade.collide(this.player, this.collisionLayer, this.customTileContact, null, this);
      this.game.physics.arcade.collide(this.mobs, this.collisionLayer);
      this.game.physics.arcade.collide(this.player, this.lifts, this.customMobContact, this.checkmobs, this);

      if(this.debug){
        this.debugText.text += "Player: "+this.player.debugString()+"\n";
        conflux = this;
        this.mobs.forEach(function(mob){conflux.debugText.text += mob.mobType+": "+mob.debugString()+"\n";});
        this.lifts.forEach(function(mob){conflux.debugText.text += mob.mobType+": "+mob.debugString()+"\n";});
      }

      this.checkEvents();
    }
  },
  customMobContact: function(firstObject, secondObject){
    firstObject.mobContact(secondObject);
  },
  customTileContact: function(firstObject, secondObject){
    firstObject.tileContact(secondObject);
  },
  spawnMob: function(group, unit, xCoord, yCoord, firstWaypoint){
    var mob;
    if(unit.type=="truck"){
      mob = new Truck(this, this.game, xCoord, yCoord, group, unit.facing, unit.speed);
    } else if(unit.type=="carrier"){
      mob = new Carrier(this, this.game, xCoord, yCoord, group, unit.facing, unit.waypoints, firstWaypoint, unit.speed);
    } else if(unit.type=="lift"){
      mob = new Lift(this, this.game, xCoord, yCoord, this.lifts, unit.waypoints, unit.speed);
    } else if(unit.type=="flag"){
      this.add.sprite(xCoord, yCoord, 'flag');
    }
    return mob;
  },

  checkInput: function(){
    if(this.justToggled){
      if(!this.keyboard.isDown(this.justToggled)){
        this.justToggled = null;
      }
    } else {
      if(this.keyboard.isDown(72)){
        this.justToggled = 72;
        if(this.player.cState.hurt){
          this.player.cancelHurt();
        }else{
          this.player.hurt();
        }
      }
      if(this.keyboard.isDown(70)){
        this.justToggled = 70;
        if(this.player.cState.flying){
          this.player.cState.flying=false;
        }else{
          this.player.cState.flying=true;
        }
      }
      if(this.keyboard.isDown(80)){
        this.justToggled = 80;
        this.enablePause();
      }
      if(this.player.cState.paused && this.keyboard.isDown(90)){
        this.justToggled = 90;
        this.player.setPause(false);
      }
      if(this.keyboard.isDown(82)){
        this.justToggled = 82;
        this.goToState("Act1");
      }
    }
  },

  enablePause: function(){
    this.paused = true;
    this.mobs.forEach(function(mob){
      mob.setPause(true);
    });
    this.lifts.forEach(function(lift){
      lift.setPause(true);
    });
    this.player.setPause(true);
    for (var i=0; i<this.timerEvents.length; i++){
      this.game.time.events.remove(this.timerEvents[i]);
    }
  },
  checkEvents: function(){
    var nextEvent;
    for(var ii = 0; ii < this.events.length; ii += 1){
      nextEvent = this.events[ii];
      if(!nextEvent.triggered){
        if(nextEvent.triggerType == "pass" && nextEvent.x < this.player.body.x){
          this.triggerEvent(nextEvent);
        }
      }
    }
  },
  triggerEvent: function(newEvent){
    newEvent.triggered = true;
    this[newEvent.resultCallbackName](newEvent);

  },
  sendDialogue: function(newEvent){
    this.enablePause();
    var dialogueElement = newEvent.dialogue;
    this.dialogueText = this.game.add.text(300, 250, dialogueElement[0].speaker+': '+dialogueElement[0].text, { fontSize: '10px', fill: '#FFF' });
    this.dialogueText.fixedToCamera = true;
    this.dialogue = {
      index: 0,
      element: dialogueElement
    };
  },
  processDialogue: function(){
    if(this.justToggled){
      if(!this.keyboard.isDown(this.justToggled)){
        this.justToggled = null;
      }
    } else {
      if(this.keyboard.isDown(32)){
        this.justToggled = 32;
        this.advanceDialogue();
      }
    }
  },
  advanceDialogue: function(){
    if(this.dialogue.element[this.dialogue.index]){
      var line = this.dialogue.element[this.dialogue.index];
      this.dialogueText.text = line.speaker+": "+line.text;
      this.dialogue.index += 1;
    }else{
      this.dialogueText.text = "";
      this.dialogue = null;
    }
  },
  goToState: function(state){
    var fadeOut = this.game.add.tween(this.game.world).to({ alpha:0 }, 750);
    fadeOut.onComplete.add(function(){this.state.start(state);}, this);
    fadeOut.start();
  }

}
