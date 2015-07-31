var Carrier = function(conflux, game, x, y, group, facing, waypoints, firstWaypointIndex, speed, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof firstWaypointIndex === 'undefined') { firstWaypointIndex = 0; }
  if(typeof speed === 'undefined') { speed = 10; }
  Phaser.Sprite.call(this, game, x, y, 'carrier');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(64,31,5,0);
  this.mobType = "carrier";
  this.body.immovable = true;
  this.outOfBoundsKill = true;
  this.waypoints = waypoints;
  this.conflux = conflux;
  this.animations.add('plain', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  this.animations.play('plain', 20, true);

  this.sfx = this.game.add.audio('sfx');
  this.sfx.addMarker('idle', 9.5, 0.5, 0.05, true);

  this.cConstants = {
    speed: speed*gridSize,
    animationPausedOffset: 16
  }

  this.cState = {
    waiting: false,
    waitUntil: 0,
    paused: false,
    facing: facing
  }

  this.nextWaypoint = {
    index: firstWaypointIndex,
    x: this.waypoints[firstWaypointIndex].x*gridSize,
    y: this.waypoints[firstWaypointIndex].y*gridSize
  }

  this.update = function(){
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    if(!this.cState.paused){
      if(!this.sfx.isPlaying) this.sfx.play('idle');
      if(this.cState.waiting){
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
      this.body.x = this.nextWaypoint.x;
    }
    if(reachedY){
      this.body.y = this.nextWaypoint.y;
    }

    // Move, unless we've reached our target, in which case set next target
    if(reachedX && reachedY){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.setNextWaypoint();
    } else {
      if(!reachedX){
        this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.speed;
      }
      if(!reachedY){
        this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.speed;
      }
    }
  };

  this.hit = function(){
    this.setPause(false);
  };

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
      this.setWaypointDirection();
      this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.speed;
      this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.speed;
    }
  };

  this.setWaypointDirection = function(){
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
  };
  this.setWaypointDirection();



  this.debugString = function(){
    return "CARRIER: [pos:"+Math.floor(this.body.x)+"/"+Math.floor(this.body.y)+"][target:"+this.nextWaypoint.x+"/"+this.nextWaypoint.y+"]"+
      "[looking:"+this.nextWaypoint.directionX+"/"+this.nextWaypoint.directionY+"][moving:"+this.body.velocity.x+"/"+this.body.velocity.y+"]";
  };

  this.setPause = function(pause){
    this.sfx.stop();
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
  this.setPause(!!startPaused);
}

Carrier.prototype = Object.create(Phaser.Sprite.prototype);
Carrier.prototype.constructor = Carrier;
