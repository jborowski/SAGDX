SAGDX.introState = function(game){};

SAGDX.introState.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debugMode:false,
  justToggled:null,
  paused:false,
  events: [],
  dialogue: null,

  preload: function(){
    this.game.world.alpha = 0;
    this.game.add.tween(this.game.world).to({ alpha:1 }, 750).start();

  },
  create: function(){

    this.game.renderer.renderSession.roundPixels = true;

    this.map = this.game.add.tilemap('introForegroundLayerMap');
    this.map.addTilesetImage('tileset');
    this.foregroundLayer = this.map.createLayer('foregroundLayer');
    this.foregroundLayer.resizeWorld();
    this.foregroundLayer.renderSettings.enableScrollDelta = false;

    this.bgMap = this.game.add.tilemap('introBackgroundLayerMap');
    this.bgMap.addTilesetImage('tileset');
    this.backgroundLayer = this.bgMap.createLayer('backgroundLayer');
    this.backgroundLayer.renderSettings.enableScrollDelta = false;

    this.collisionMap = this.game.add.tilemap('introCollisionLayerMap');
    this.collisionMap.addTilesetImage('tileset');
    this.collisionLayer = this.collisionMap.createLayer('collisionLayer');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.parabgs = this.game.add.group();
    this.parabg = this.game.add.tileSprite(0,0, this.game.width, this.game.height, 'parabackground1', 0, this.parabgs);
    this.parabg.animations.add('full');
    this.parabg.fixedToCamera = true;


    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 808080;

    this.player = new Player(this, this.game, 3*gridSize, 15*gridSize, 'player');

    this.keyboard = this.game.input.keyboard;


    this.game.world.bringToTop(this.backgroundLayer);
    this.game.world.bringToTop(this.player);

    this.parabg.play('full');

    //this.music = this.sound.play('music', true);

  },
  update: function(){


    this.checkInput();

    this.game.physics.arcade.collide(this.mobs, this.lifts);
    if(!this.player.cState.hurt){
      this.game.physics.arcade.collide(this.player, this.mobs, this.customMobContact, null, this);
    }
    this.game.physics.arcade.collide(this.player, this.collisionLayer, this.customTileContact, null, this);

    if(this.player.cState.outOfBounds){
      this.goToState("Act1");
    }
  },
  customMobContact: function(firstObject, secondObject){
    firstObject.mobContact(secondObject);
  },
  customMobContactedBy: function(firstObject, secondObject){
    secondObject.mobContact(firstObject);
  },
  customTileContact: function(firstObject, secondObject){
    firstObject.tileContact(secondObject);
  },
  spawnMob: function(unit, xCoord, yCoord, firstWaypoint){
    var mob;
    if(unit.type=="truck"){
      mob = new Truck(this, this.game, xCoord, yCoord, this.mobs, unit.facing, unit.speed, unit.paused);
    } else if(unit.type=="carrier"){
      mob = new Carrier(this, this.game, xCoord, yCoord, this.lifts, unit.facing, unit.waypoints, firstWaypoint, unit.speed, unit.paused);
    } else if(unit.type=="lift"){
      mob = new Lift(this, this.game, xCoord, yCoord, this.lifts, unit.waypoints, unit.speed, unit.paused);
    } else if(unit.type=="turret"){
      mob = new Turret(this, this.game, xCoord, yCoord, this.turrets, unit);
    } else if(unit.type=="bigblast"){
      mob = new BigBlast(this, this.game, xCoord, yCoord, this.blasts, unit.facing, unit.speed, unit.paused);
    } else if(unit.type=="littleblast"){
      mob = new LittleBlast(this, this.game, xCoord, yCoord, this.blasts, unit.facing, unit.speed, unit.paused);
    } else if(unit.type=="floater"){
      mob = new Floater(this, this.game, xCoord, yCoord, this.mobs, unit.facing, unit.waypoints, firstWaypoint, unit.speed, unit.paused);
    } else if(unit.type=="flag"){
      mob = this.add.sprite(xCoord, yCoord, 'flag');
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
      if(this.keyboard.isDown(13)){
        this.justToggled = 13;
        this.enablePause();
      }
      if(this.player.cState.paused){
        if( this.keyboard.isDown(32) ||
            this.player.cursors.left.isDown ||
            this.player.cursors.right.isDown ||
            this.player.cursors.up.isDown ||
            this.player.cursors.down.isDown){
          this.player.setPause(false);
        }
      }
      if(this.keyboard.isDown(82)){
        this.justToggled = 82;
        this.goToState("Act1");
      }
    }
  },
  newPauseText: function(){
    var x = this.game.camera.x + this.game.camera.width/2;
    var y = this.game.camera.y + this.game.camera.height/2;
    return this.game.add.text(x, y-10, 'GAME PAUSED', { fontSize: '10px', fill: '#FFF' });
  },
  enablePause: function(){
    this.paused = true;
    this.pauseFilter.visible = true;
    this.music.volume = 0.3;
    this.pauseTexts.push(this.newPauseText());
    this.mobs.forEach(function(mob){
      mob.setPause(true);
    });
    this.turrets.forEach(function(mob){
      mob.setPause(true);
    });
    this.lifts.forEach(function(lift){
      lift.setPause(true);
    });
    this.blasts.forEach(function(blast){
      blast.setPause(true);
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
        if(nextEvent.triggerType == "pass"){
          if(nextEvent.x < this.player.body.x){
            this.triggerEvent(nextEvent);
          }
        } else if(nextEvent.triggerType == "inside"){
          var betweenSides = (this.player.body.x > nextEvent.x) && (this.player.body.right < nextEvent.x2);
          var underAndOver = (this.player.body.y > nextEvent.y) && (this.player.body.bottom < nextEvent.y2);
          if(betweenSides && underAndOver){
            this.triggerEvent(nextEvent);
          }
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
    this.dialogueText = this.game.add.text(300, 280, dialogueElement[0].speaker+': '+dialogueElement[0].text, { fontSize: '16px', fill: '#FFF' });
    this.dialogueText.fixedToCamera = true;
    this.dialogue = {
      index: 0,
      element: dialogueElement
    };
  },
  spawnEvent: function(newEvent){
    var ii, spawnDef;
    for(ii = 0; ii < this.eventSpawns.length; ii += 1){
      spawnDef = this.eventSpawns[ii];
      if(spawnDef.trigger == newEvent.name){
        for(var jj=0; jj < spawnDef.spawns.length; jj+=1){
          if(spawnDef.type=="once"){
              this.spawnMob(spawnDef.unit, spawnDef.spawns[jj].x*gridSize, spawnDef.spawns[jj].y*gridSize, spawnDef.spawns[jj].firstWaypoint);
          } else if(spawnDef.type=="continous"){
              this.spawnMob(spawnDef.unit, spawnDef.spawns[jj].x*gridSize, spawnDef.spawns[jj].y*gridSize, spawnDef.spawns[jj].firstWaypoint);
              this.timerEvents.push(this.game.time.events.loop(spawnDef.interval*this.timeMultiplier, this.spawnMob, this, spawnDef.unit, spawnDef.spawns[jj].x*gridSize, spawnDef.spawns[jj].y*gridSize));
          }
        }
      }
    }
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
  touchDoor: function(event){
    this.goToState(event.target);
  },
  goToState: function(state){
    var fadeOut = this.game.add.tween(this.game.world).to({ alpha:0 }, 750);
    fadeOut.onComplete.add(function(){this.state.start(state);}, this);
    fadeOut.start();
  }

}
