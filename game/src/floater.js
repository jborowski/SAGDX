var Floater = function(conflux, game, x, y, group, facing, waypoints, firstWaypointIndex, speed, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof firstWaypointIndex === 'undefined') { firstWaypointIndex = 0; }
  if(typeof speed === 'undefined') { speed = 10; }
  Phaser.Sprite.call(this, game, x, y, 'floater');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(32,32);
  this.mobType = "floater";
  this.body.immovable = true;
  this.outOfBoundsKill = false;
  this.waypoints = waypoints;
  this.conflux = conflux;
  this.animations.add('plain', [0]);
  this.animations.play('plain');

  this.cConstants = {
    speed: speed*gridSize,
    chaseDistance: 10*gridSize,
    boostDistance: 5*gridSize,
    chaseAccel: 20*gridSize,
    maxChaseVelocity: 15*gridSize,
    maxBoostVelocity: 30*gridSize,
    animationPausedOffset: 1
  }

  this.cState = {
    waiting: false,
    waitUntil: 0,
    paused: false,
    boosting: false,
    distanceBoosted: 0,
    maxBoostDistance: 0,
    boostTimeout: 0,
    boostStart: [],
    facing: facing
  }

  this.nextWaypoint = {
    index: firstWaypointIndex,
    x: this.waypoints[firstWaypointIndex].x*gridSize,
    y: this.waypoints[firstWaypointIndex].y*gridSize
  }

  if(this.nextWaypoint.x < this.body.x){
    this.nextWaypoint.directionX = -1;
  } else if(this.nextWaypoint.x > this.body.x) {
    this.nextWaypoint.directionX = 1;
  } else {
    this.nextWaypoint.directionX = 0;
  }
  if(this.nextWaypoint.y < this.body.y){
    this.nextWaypoint.directionY = -1;
  } else if(this.nextWaypoint.y > this.body.y) {
    this.nextWaypoint.directionY = 1;
  } else {
    this.nextWaypoint.directionY = 0;
  }

  this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.speed;
  this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.speed;

  this.update = function(){
    if(this.cState.paused){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    } else if(this.cState.boosting){
      if( (this.reachedBoostX() || (this.body.blocked.left || this.body.blocked.right) ) &&
          (this.reachedBoostY() || (this.body.blocked.down || this.body.blocked.up) ) ){
        this.cState.boosting = false;
      }
    } else {
      if(Phaser.Math.distance(this.body.x, this.body.y, conflux.player.body.x, conflux.player.body.y+16) <= this.cConstants.boostDistance){
        this.cState.boosting = true;
        this.cState.distanceBoosted = 0;
        this.game.physics.arcade.accelerateToXY(this, conflux.player.body.x, conflux.player.body.y+16, this.cConstants.chaseAccel, this.cConstants.maxBoostVelocity, this.cConstants.maxBoostVelocity);
        this.cState.maxBoostDistance = 2 * Phaser.Math.distance(this.body.x, this.body.y, conflux.player.body.x, conflux.player.body.y+16);
        this.cState.boostStart = [this.body.x, this.body.y];
        this.cState.boostStop = [(2 * conflux.player.body.x) - this.body.x,
                                 (2 * conflux.player.body.y+16) - this.body.y]
        this.cState.boostTimeout = 0;
      } else if(Phaser.Math.distance(this.body.x, this.body.y, conflux.player.body.x, conflux.player.body.y+16) <= this.cConstants.chaseDistance){
        this.game.physics.arcade.accelerateToXY(this, conflux.player.body.x, conflux.player.body.y+16, this.cConstants.chaseAccel, this.cConstants.maxChaseVelocity, this.cConstants.maxChaseVelocity);
      } else if(this.cState.waiting){
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        if(this.game.time.now > this.cState.waitUntil){
          this.cState.waiting = false;
          this.setNextWaypoint();
        }
      } else {
        this.moveToWaypoint();
      }
    }
  }

  this.moveToWaypoint = function(){
    reachedX = this.nextWaypoint.directionX == 0 || (this.nextWaypoint.directionX < 0 && this.body.x < this.nextWaypoint.x)
    reachedX = reachedX || (this.nextWaypoint.directionX > 0 && this.body.x > this.nextWaypoint.x)

    reachedY = this.nextWaypoint.directionY == 0 || (this.nextWaypoint.directionY < 0 && this.body.y < this.nextWaypoint.y)
    reachedY = reachedY || (this.nextWaypoint.directionY > 0 && this.body.y > this.nextWaypoint.y)

    // Don't go past our target point
    if(reachedX){
      this.body.velocity.x = 0;
    }
    if(reachedY){
      this.body.velocity.y = 0;
    }

    // Move, unless we've reached our target, in which case set next target
    if(reachedX && reachedY){
      this.setNextWaypoint();
    } else {
      if(!reachedX){
        this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.speed;
      }
      if(!reachedY){
        this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.speed;
      }
    }
  }

  this.setNextWaypoint = function(){
    this.nextWaypoint.index += 1;
    if(this.nextWaypoint.index >= this.waypoints.length){
      this.nextWaypoint.index = 0;
    }
    var next = this.waypoints[this.nextWaypoint.index];
    if(next.wait){
      this.cState.waiting = true;
      this.cState.waitUntil = this.game.time.now + next.wait*conflux.timeMultiplier;
    } else if(next.destroy){
      this.destroy();
    } else {
      this.nextWaypoint.x = next.x*gridSize;
      this.nextWaypoint.y = next.y*gridSize;
      if(this.nextWaypoint.x < this.body.x){
        this.nextWaypoint.directionX = -1;
      } else if(this.nextWaypoint.x > this.body.x) {
        this.nextWaypoint.directionX = 1;
      } else {
        this.nextWaypoint.directionX = 0;
      }
      if(this.nextWaypoint.y < this.body.y){
        this.nextWaypoint.directionY = -1;
      } else if(this.nextWaypoint.y > this.body.y) {
        this.nextWaypoint.directionY = 1;
      } else {
        this.nextWaypoint.directionY = 0;
      }
      this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.speed;
      this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.speed;
    }
  };

  this.debugString = function(){
    return "FLOATER: [pos:"+Math.floor(this.body.x)+"/"+Math.floor(this.body.y)+"][target:"+this.nextWaypoint.x+"/"+this.nextWaypoint.y+"]"+
      "[looking:"+this.nextWaypoint.directionX+"/"+this.nextWaypoint.directionY+"][moving:"+this.body.velocity.x+"/"+this.body.velocity.y+"]";
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

  this.reachedBoostX = function(){
    var ret = false;
    if(this.body.velocity.x > 0){
      if(this.body.x > this.cState.boostStop[0]) ret = true;
    } else if(this.body.velocity.x < 0) {
      if(this.body.x < this.cState.boostStop[0]) ret = true;
    }
    return ret;
  };

  this.reachedBoostY = function(){
    var ret = false;
    if(this.body.velocity.y > 0){
      if(this.body.y > this.cState.boostStop[0]) ret = true;
    } else if(this.body.velocity.y < 0) {
      if(this.body.y < this.cState.boostStop[0]) ret = true;
    }
    return ret;
  };

  this.setPause(!!startPaused);
}

Floater.prototype = Object.create(Phaser.Sprite.prototype);
Floater.prototype.constructor = Floater;
