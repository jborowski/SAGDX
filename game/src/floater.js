var Floater = function(conflux, game, x, y, group, facing, waypoints, firstWaypointIndex, speed, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof firstWaypointIndex === 'undefined') { firstWaypointIndex = 0; }
  if(typeof speed === 'undefined') { speed = 10; }
  Phaser.Sprite.call(this, game, x, y, 'floater');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(40,40, 10, 6);
  this.mobType = "floater";
  this.body.immovable = true;
  this.outOfBoundsKill = false;
  this.waypoints = waypoints;
  this.conflux = conflux;
  this.animations.add('right', [0,1,2,6,7,8,12,13,14]);
  this.animations.add('left', [3,4,5,9,10,11,15,16,17]);

  this.sfx = this.game.add.audio('sfx');
  this.sfx.addMarker('floaterChase', 0.5, 2.5, 1, false);
  this.sfx.addMarker('idle', 9.5, 0.5, 0.05, true);

  this.cConstants = {
    speed: speed*gridSize,
    chaseDistance: 30*gridSize,
    boostDistance: 8*gridSize,
    chaseAccel: 10*gridSize,
    maxChaseVelocity: 15*gridSize,
    maxBoostVelocity: 30*gridSize,
    dropSpeed: 5*gridSize,
    boostTime: 60,
    animationPausedOffset: 18
  }

  this.cState = {
    waiting: false,
    waitUntil: 0,
    paused: false,
    boosting: false,
    boostTimer: 0,
    playerOnTop: false,
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

  this.processAnimation = function(){
    if(!this.cState.paused){
      if(this.body.x < this.conflux.player.body.x) this.animations.play('left');
      else if (this.body.x > this.conflux.player.body.x) this.animations.play('right');
    }
  }

  this.update = function(){
    if(!this.cState.paused && !this.sfx.isPlaying) this.sfx.play('idle');
    this.processAnimation();
    if(this.cState.paused){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.body.x = this.pauseCoords[0];
      this.body.y = this.pauseCoords[1];
    } else if(this.cState.playerOnTop){
      var direction = this.conflux.player.cState.facing;
      this.body.velocity.x = direction * this.cConstants.speed / 2;
      this.body.velocity.y = this.cConstants.dropSpeed;
      console.log(this.conflux.player.facing);
    } else if(this.cState.boosting){
      this.cState.boostTimer++;
      if(this.cState.boostTimer > this.cConstants.boostTime){
        this.cState.boosting = false;
      }
    } else {
      if(Phaser.Math.distance(this.body.x, this.body.y, this.conflux.player.body.x+this.conflux.player.body.width/2, this.conflux.player.body.y+16) <= this.cConstants.boostDistance){
        this.sfx.play('floaterChase');
        this.cState.boosting = true;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.game.physics.arcade.accelerateToXY(this, this.conflux.player.body.x+this.conflux.player.body.width/2, this.conflux.player.body.y+16, 2*this.cConstants.chaseAccel, this.cConstants.maxBoostVelocity, this.cConstants.maxBoostVelocity);
        this.cState.boostTimer = 0;
      } else if(Phaser.Math.distance(this.body.x, this.body.y, this.conflux.player.body.x+this.conflux.player.body.width/2, this.conflux.player.body.y+16) <= this.cConstants.chaseDistance){
        this.game.physics.arcade.accelerateToXY(this, this.conflux.player.body.x+this.conflux.player.body.width/2, conflux.player.body.y+16, this.cConstants.chaseAccel, this.cConstants.maxChaseVelocity, this.cConstants.maxChaseVelocity);
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
    this.cState.playerOnTop = false;
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
      this.cState.waitUntil = this.game.time.now + next.wait*this.conflux.timeMultiplier;
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

  this.hit = function(){
    this.setPause(false);
  };

  this.debugString = function(){
    return "FLOATER: [pos:"+Math.floor(this.body.x)+"/"+Math.floor(this.body.y)+"][target:"+this.nextWaypoint.x+"/"+this.nextWaypoint.y+"]"+
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
      this.pauseCoords = [this.body.x, this.body.y];
      this.animations.paused = pause;
      this.cState.paused = pause;
    }
  };

  this.setPause(!!startPaused);
}

Floater.prototype = Object.create(Phaser.Sprite.prototype);
Floater.prototype.constructor = Floater;
