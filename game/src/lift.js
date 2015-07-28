var Lift = function(conflux, game, x, y, group, unit){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof unit.speed === 'undefined') { unit.speed = 10; }
  Phaser.Sprite.call(this, game, x, y, 'lift');
  game.physics.arcade.enable(this);
  group.add(this);
  this.mobType = "lift";
  this.body.immovable = true;
  this.actions = unit.actions;
  this.conflux = conflux;
  this.animations.add('plain', [0]);
  this.animations.play('plain');

  this.cConstants = {
    speed: unit.speed*gridSize,
    animationPausedOffset: 1
  }

  this.cState = {
    waiting: false,
    waitUntil: 0,
    paused: false
  }

  this.nextAction = {
    index: 0,
    x: this.actions[0].x*gridSize,
    y: this.actions[0].y*gridSize
  }

  this.update = function(){
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    if(!this.cState.paused){
      if(this.cState.waiting){
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        if(this.game.time.now > this.cState.waitUntil){
          this.cState.waiting = false;
          this.setNextAction();
        }
      } else {
        this.moveToWaypoint();
      }
    }
  };

  this.moveToWaypoint = function(){
    reachedX = this.nextAction.directionX == 0 || (this.nextAction.directionX < 0 && this.body.x < this.nextAction.x)
    reachedX = reachedX || (this.nextAction.directionX > 0 && this.body.x > this.nextAction.x)

    reachedY = this.nextAction.directionY == 0 || (this.nextAction.directionY < 0 && this.body.y < this.nextAction.y)
    reachedY = reachedY || (this.nextAction.directionY > 0 && this.body.y > this.nextAction.y)

    // Don't go past our target point
    if(reachedX){
      this.body.x = this.nextAction.x;
    }
    if(reachedY){
      this.body.y = this.nextAction.y;
    }

    // Move, unless we've reached our target, in which case set next target
    if(reachedX && reachedY){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.setNextAction();
    } else {
      if(!reachedX){
        this.body.velocity.x = this.nextAction.directionX * this.cConstants.speed;
      }
      if(!reachedY){
        this.body.velocity.y = this.nextAction.directionY * this.cConstants.speed;
      }
    }
  };

  this.setNextAction = function(){
    this.nextAction.index += 1;
    if(this.nextAction.index >= this.actions.length){
      this.nextAction.index = 0;
    }
    var next = this.actions[this.nextAction.index];
    if(next.type == "wait"){
      this.cState.waiting = true;
      this.cState.waitUntil = this.game.time.now + next.duration*conflux.timeMultiplier;
    } else if(next.type == "destroy"){
      this.destroy();
    } else if(next.type == "moveTo"){
      this.nextAction.x = next.x*gridSize;
      this.nextAction.y = next.y*gridSize;
      this.setWaypointDirection();
      this.body.velocity.x = this.nextAction.directionX * this.cConstants.speed;
      this.body.velocity.y = this.nextAction.directionY * this.cConstants.speed;
    }
  };

  this.setWaypointDirection = function(){
    if(this.nextAction.x < this.body.x){
      this.nextAction.directionX = -1;
    } else if(this.nextAction.x > this.body.x) {
      this.nextAction.directionX = 1;
    } else {
      this.nextAction.directionX = 0;
    }
    if(this.nextAction.y < this.body.y){
      this.nextAction.directionY = -1;
    } else if(this.nextAction.y > this.body.y) {
      this.nextAction.directionY = 1;
    } else {
      this.nextAction.directionY = 0;
    }
  };
  this.setWaypointDirection();

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

  this.debugString = function(){
    return "PLATFORM: [pos:"+Math.floor(this.body.x)+"/"+Math.floor(this.body.y)+"][target:"+this.nextAction.x+"/"+this.nextAction.y+"]"+
      "[looking:"+this.nextAction.directionX+"/"+this.nextAction.directionY+"][moving:"+this.body.velocity.x+"/"+this.body.velocity.y+"]";
  };
  this.setPause(!!unit.startPaused);
}

Lift.prototype = Object.create(Phaser.Sprite.prototype);
Lift.prototype.constructor = Lift;
