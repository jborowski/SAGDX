var Turret = function(conflux, game, x, y, group, unit){
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, 'turret');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(48, 74, 2, 0);
  if(this.game.debugMode){
    var hitboxG = new Phaser.Graphics().beginFill(0x898989).drawRect(0,0,48,74);
    var hitbox = game.add.sprite(2,0,hitboxG.generateTexture());
    hitbox.alpha = 0.5;
    this.addChild(hitbox);
  }
  this.mobType = "turret";
  this.conflux = conflux;

  this.body.allowGravity = false;

  this.animations.add('left', [0]);
  this.animations.add('right', [1]);
  if(unit.facing == -1){
    this.animations.play('left');
  } else {
    this.animations.play('right');
  }

  // Normalize units
  var action;
  for(var ii=0; ii < unit.actions.length; ii+=1){
    action = unit.actions[ii];
    if(action.y){ action.y *= gridSize; }
    if(action.speed){ action.speed *= gridSize; }
    if(action.duration){ action.duration *= conflux.timeMultiplier; }
  }

  this.cConstants = {
    animationPausedOffset: 2,
    actions: unit.actions,
    actionLoopIndex: unit.loopTo
  };

  this.cState = {
    paused: false,
    facing: unit.facing
  }

  this.update = function(){
    if(!this.cState.paused){
      this.processAction();
    }
  }

  this.nextAction = function(){
    // Halt previous movement
    this.body.velocity.y = 0;

    var lastAction = this.cState.currentAction;

    // Load the first or next action
    var nextIndex;
    if(!lastAction){
      nextIndex=0;
    } else {
      var nextIndex = lastAction.index+1;
      if(nextIndex >= this.cConstants.actions.length){
        nextIndex = this.cConstants.actionLoopIndex;
      }
    }
    var nextAction = this.cConstants.actions[nextIndex];
    console.log(nextAction+"/"+nextIndex);
    nextAction.index = nextIndex;

    // Start the next action
    if(nextAction.type == "moveTo"){
      if(nextAction.y < this.body.y){
        nextAction.direction = -1 
      } else {
        nextAction.direction = 1
      }
    } else if(nextAction.type == "wait"){
      nextAction.timeout = this.game.time.now + nextAction.duration;
    } else if(nextAction.type == "turn"){
      this.turn();
    } else if(nextAction.type == "fire"){
      this.fire(nextAction.speed);
    }

    // Make this official and finish
    this.cState.currentAction = nextAction;
    
    // Once we've set the next action, begin processing it
    this.processAction();
  }

  this.processAction = function(){
    var action = this.cState.currentAction;
    if(action){
      if(action.type == "moveTo"){
        if((action.direction == 1 && this.body.y > action.y) || (action.direction == -1 && this.body.y < action.y)){
          this.nextAction();
        } else {
          this.body.velocity.y = action.speed * action.direction;
        }
      } else if(action.type == "wait"){
        if(action.timeout < this.game.time.now){
          this.nextAction();
        }
      } else if(action.type == "turn" || action.type == "fire"){
        // For all instaneous actions, immediately move to the next item in the list
        this.nextAction();
      }
    } else {
      this.nextAction();
    }
  };

  this.turn = function(){
    this.cState.facing *= -1;
    if(this.cState.facing == -1){
      this.animations.play('left');
    } else {
      this.animations.play('right');
    }
  };

  this.fire = function(speed){
    var x, y;
    y = this.body.y - 32;
    if(this.cState.facing == -1){
      x = this.body.x - 61;
    } else {
      x = this.body.right - 19;
    }
    new BigBlast(this.conflux, this.game, x, y, this.conflux.blasts, this.cState.facing, speed/gridSize, false);
  };
    
  this.debugString = function(){
    return "[pos:"+Math.floor(this.x)+"/"+Math.floor(this.y)+"]";
  };

  this.setPause = function(pause){
    if(this.cState.paused != pause){
      if(pause){
        this.animations.frame = this.animations.frame + this.cConstants.animationPausedOffset;
      } else {
        this.animations.frame = this.animations.frame - this.cConstants.animationPausedOffset;
      }
      this.animations.paused = pause;
      this.cState.paused = pause;
    }
  };
  this.setPause(!!unit.startPaused);
}

Turret.prototype = Object.create(Phaser.Sprite.prototype);
Turret.prototype.constructor = Turret;
