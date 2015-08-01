SAGDX.level4State = function(game){};

SAGDX.level4State.prototype = {
  // Settings
  timeMultiplier: 400,

  // State Variables
  debugMode:false,
  justToggled:null,
  paused:false,
  events: [],
  eventSpawns: [],
  eventActivations: [],
  dialogue: null,
  textIndent: "           ",

  preload: function(){
  },
  create: function(){
    this.game.world.alpha = 1;
    //this.game.add.tween(this.game.world).to({ alpha:1 }, 750).start();

    this.trucks = this.game.add.group();
    this.floaters = this.game.add.group();
    this.lifts = this.game.add.group();
    this.turrets = this.game.add.group();
    this.blasts = this.game.add.group();
    this.game.renderer.renderSession.roundPixels = true;

    this.map = this.game.add.tilemap('level4ForegroundLayerMap');
    this.map.addTilesetImage('tileset');
    this.foregroundLayer = this.map.createLayer('foregroundLayer');
    this.foregroundLayer.resizeWorld();
    this.foregroundLayer.renderSettings.enableScrollDelta = false;

    this.bgMap = this.game.add.tilemap('level4BackgroundLayerMap');
    this.bgMap.addTilesetImage('tileset');
    this.backgroundLayer = this.bgMap.createLayer('backgroundLayer');
    this.backgroundLayer.renderSettings.enableScrollDelta = false;

    this.collisionMap = this.game.add.tilemap('level4CollisionLayerMap');
    this.collisionMap.addTilesetImage('tileset');
    this.collisionLayer = this.collisionMap.createLayer('collisionLayer');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.parabg1 = this.game.add.sprite(1400, -60, "parabackgroundSky");
    this.parabg1p = this.game.add.sprite(1400, -60, "parabackgroundSkyp");

    this.pauseTexts = [];

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 000000;

    this.player = new Player(this, this.game, 5*gridSize, 41*gridSize, 'player');
    this.game.camera.follow(this.player);

    /***** TERRIBLE ****/
    this.floorbuttons = this.game.add.group();
    this.floorbutton1 = this.add.sprite(51*gridSize, 59*gridSize-5, 'floorbutton');
    this.floorbuttons.add(this.floorbutton1);
    /*******************/

    this.keyboard = this.game.input.keyboard;
    this.timerEvents = [];

    this.eventSpawns = [];
    var spawnList = JSON.parse(this.game.cache.getText('level4Spawns'));
    var ii, spawnDef;
    for(var ii=0; ii < spawnList.length; ii+=1){
      spawnDef = spawnList[ii];
      if(spawnDef.trigger){
        this.eventSpawns.push(spawnDef);
      } else {
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

    var thisEvent;
    this.events = JSON.parse(this.game.cache.getText('level4Events'));
    for(var ii=0; ii < this.events.length; ii+=1){
      thisEvent = this.events[ii];
      thisEvent.triggered = false;
      if(thisEvent.x){ thisEvent.x *= gridSize; }
      if(thisEvent.y){ thisEvent.y *= gridSize; }
      if(thisEvent.x2){ thisEvent.x2 *= gridSize; }
      if(thisEvent.y2){ thisEvent.y2 *= gridSize; }
      if(thisEvent.type=="dialogue"){
        thisEvent.resultCallbackName = "sendDialogue";
      } else if(thisEvent.type=="transition"){
        thisEvent.resultCallbackName = "touchDoor";
      } else if(thisEvent.type=="spawn"){
        thisEvent.resultCallbackName = "spawnEvent";
      } else if(thisEvent.type=="activation"){
        thisEvent.resultCallbackName = "checkActivations";
      }
    }

    this.game.world.bringToTop(this.parabg1p);
    this.game.world.bringToTop(this.parabg1);
    this.game.world.bringToTop(this.turrets);
    this.game.world.bringToTop(this.backgroundLayer);
    this.game.world.bringToTop(this.trucks);
    this.game.world.bringToTop(this.floaters);
    this.game.world.bringToTop(this.lifts);
    this.game.world.bringToTop(this.floorbuttons);
    this.game.world.bringToTop(this.player);
    this.game.world.bringToTop(this.blasts);
    this.game.world.bringToTop(this.foregroundLayer);

    if(this.debugMode){
      this.debugText = this.game.add.text(5, 50, 'DEBUG INFO ', { fontSize: '10px', fill: '#FFF' });
      this.debugText.fixedToCamera = true;
    }

    music.volume = 1;
    ambience.volume = 0.3;
  },
  update: function(){
    if(this.debugMode){
      this.debugText.text = "";
    }

    if(this.dialogue){
      this.processDialogue();
    } else {
      this.checkInput();

      this.game.physics.arcade.collide(this.trucks, this.lifts);
      if(!this.player.cState.hurt){
        this.game.physics.arcade.collide(this.player, this.trucks, this.customMobContact, null, this);
        this.game.physics.arcade.collide(this.player, this.floaters, this.customMobContact, null, this);
      }
      this.game.physics.arcade.collide(this.player, this.turrets, this.customMobContact, null, this);
      this.game.physics.arcade.collide(this.player, this.collisionLayer, this.customTileContact, null, this);
      this.game.physics.arcade.collide(this.trucks, this.collisionLayer);
      this.game.physics.arcade.collide(this.floaters, this.collisionLayer);
      this.game.physics.arcade.collide(this.player, this.lifts, this.customMobContact, null, this);

      this.game.physics.arcade.collide(this.player, this.blasts, this.customMobContactedBy, null, this);
      this.game.physics.arcade.collide(this.blasts, this.collisionLayer, this.customTileContact, null, this);
      this.game.physics.arcade.collide(this.blasts, this.blasts, this.customMobContact, null, this);
      this.game.physics.arcade.collide(this.blasts, this.turrets, this.customMobContact, null, this);
      this.game.physics.arcade.collide(this.blasts, this.trucks, this.customMobContact, null, this);

      this.checkEvents();

    }

    if(this.player.cState.outOfBounds){
      this.goToState("Level4");
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
      mob = new Truck(this, this.game, xCoord, yCoord, this.trucks, unit.facing, unit.speed, unit.paused);
    } else if(unit.type=="carrier"){
      mob = new Carrier(this, this.game, xCoord, yCoord, this.lifts, unit.facing, unit.waypoints, firstWaypoint, unit.speed, unit.paused);
    } else if(unit.type=="lift"){
      mob = new Lift(this, this.game, xCoord, yCoord, this.lifts, unit);
    } else if(unit.type=="turret"){
      mob = new Turret(this, this.game, xCoord, yCoord, this.turrets, unit);
    } else if(unit.type=="bigblast"){
      mob = new BigBlast(this, this.game, xCoord, yCoord, this.blasts, unit.facing, unit.speed, unit.paused);
    } else if(unit.type=="littleblast"){
      mob = new LittleBlast(this, this.game, xCoord, yCoord, this.blasts, unit.facing, unit.speed, unit.paused);
    } else if(unit.type=="floater"){
      mob = new Floater(this, this.game, xCoord, yCoord, this.floaters, unit.facing, unit.waypoints, firstWaypoint, unit.speed, unit.paused);
    } else if(unit.type=="flag"){
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
        this.goToState("Level4");
      }
    }
  },
  newPauseText: function(){
    var x = this.game.camera.x + this.game.camera.width/2;
    var y = this.game.camera.y + this.game.camera.height/2;
    var sprite = this.game.add.sprite(x, y-10, 'pausetext');
    sprite.anchor.setTo(0.5, 0.5);
    return sprite;
  },
  enablePause: function(){
    music.volume = 0.3;
    ambience.volume = 0;
    sfx.stop();
    this.pauseTexts.push(this.newPauseText());
    this.trucks.forEach(function(mob){
      mob.setPause(true);
    });
    this.floaters.forEach(function(mob){
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

    if(!this.paused){
       // Pause Backgrounds
      this.parabg1.visible = false;
      this.parabg1p.visible = true;

      // PAUSE TILES
      var tilecount = 54;
      for(var ii=0; ii < tilecount; ii+=1){
        this.bgMap.swap(ii, ii+tilecount);
        this.map.swap(ii, ii+tilecount);
      }
    }

    this.player.setPause(true);
    for (var i=0; i<this.timerEvents.length; i++){
      this.game.time.events.remove(this.timerEvents[i]);
    }

    this.paused = true;
  },
  checkEvents: function(){
    var nextEvent;
    for(var ii = 0; ii < this.events.length; ii += 1){
      nextEvent = this.events[ii];
      if(!nextEvent.triggered){
        if(nextEvent.triggerType == "pass"){
          if(nextEvent.x < this.player.body.x || nextEvent.y < this.player.body.y){
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
    if(!newEvent.repeats){
      newEvent.triggered = true;
    }
    this[newEvent.resultCallbackName](newEvent);
  },
  sendDialogue: function(newEvent){
    this.enablePause();
    var dialogueElement = newEvent.dialogue;
    var name = dialogueElement[0].speaker;
    var text = this.textIndent+dialogueElement[0].text;

    if(name == "Unknown"){
      this.dialogueBox = this.game.add.sprite(30, 220, 'unknownDialogBox');
      this.speakerPortrait = this.game.add.sprite(4,4, 'unknownFace');
    } else if(name == "Factory"){
      this.dialogueBox = this.game.add.sprite(30, 220, 'factoryDialogBox');
      this.speakerPortrait = this.game.add.sprite(8,8, 'factoryFace');
    }
    this.speakerPortrait.animations.add("full");
    this.speakerPortrait.animations.play('full', 10, true);
    this.dialogueBox.addChild(this.speakerPortrait);
    this.dialogueBox.fixedToCamera = true;
    this.speakerName = this.game.add.text(120, 15, name, {font: '16px Lato', fill: '#000', wordWrap: true, wordWrapWidth: 200});
    this.dialogueBox.addChild(this.speakerName);
    this.dialogueText = this.game.add.text(45, 50, text, { font: '20px Lato Black', fill: '#000', wordWrap: true, wordWrapWidth: 600});
    this.dialogueBox.addChild(this.dialogueText);
    this.dialogue = {
      index: 0,
      element: dialogueElement
    };

    if(this.keyboard.isDown(32)){
      this.justToggled = 32;
    }
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
  checkActivations: function(newEvent){
    for(var ii = 0; ii < this.eventActivations.length; ii += 1){
      if(this.eventActivations[ii].activatedBy.indexOf(newEvent.activates) >= 0){
        this.eventActivations[ii].activate(newEvent.activates);
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
    this.dialogue.index += 1;
    if(this.dialogue.element[this.dialogue.index]){
      var line = this.dialogue.element[this.dialogue.index];
      if(line.speaker == "Unknown"){
        this.dialogueBox.loadTexture('unknownDialogBox');
        this.speakerPortrait.loadTexture('unknownFace');
      } else if(line.speaker == "Factory"){
        this.dialogueBox.loadTexture('factoryDialogBox');
        this.speakerPortrait.loadTexture('factoryFace');
      }
      this.speakerName.text = line.speaker
      this.dialogueText.text = this.textIndent + line.text;

    }else{
      this.dialogueText.text = "";
      this.speakerName.text = "";
      this.dialogue = null;
      this.dialogueBox.destroy();
    }
  },
  touchDoor: function(event){
    this.player.cState.inputDisabled = true;
    this.player.steps.stop();
    this.goToState(event.target);
  },
  goToState: function(state){
    //var fadeOut;
    //if(state=="Ending3"){
    //  var fadeOut = this.game.add.tween(this.game.world).to({ alpha: 0}, 10);
    //} else {
    //  var fadeOut = this.game.add.tween(this.game.world).to({ alpha: 0}, 750);
    //}
    //fadeOut.onComplete.add(function(){
      this.events = [];
      this.eventSpawns = [];
      this.eventActivations = [];
      this.paused = false;
      this.player.steps.stop();
      this.state.start(state);
    //}, this);
    //fadeOut.start();
  }
}
