var Carrier = function(conflux, game, x, y, group, facing, waypoints){
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, 'carrier');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(64,32,5,0);
  this.mobType = "carrier";
  this.body.immovable = true;
  this.outOfBoundsKill = true;
  this.facing = facing;
  this.waypoints = waypoints;
  this.conflux = conflux;
  this.paused = false;

  this.cConstants = {
    speed: 10*gridSize
  }

  this.nextWaypoint = {
    index: 0,
    x: this.waypoints[0].x*gridSize,
    y: this.waypoints[0].y*gridSize
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
    if(this.paused){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    } else {
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
        if(this.nextWaypoint.destroy){
          this.destroy();
        } else {
          this.setNextWaypoint();
        }
      } else {
        if(!reachedX){
          this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.speed;
        }
        if(!reachedY){
          this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.speed;
        }
      }
    }
  }

  this.setNextWaypoint = function(){
    this.nextWaypoint.index += 1;
    if(this.nextWaypoint.index >= this.waypoints.length){
      this.nextWaypoint.index = 0;
    }
    this.nextWaypoint.x = this.waypoints[this.nextWaypoint.index].x*gridSize;
    this.nextWaypoint.y = this.waypoints[this.nextWaypoint.index].y*gridSize;
    if(this.waypoints[this.nextWaypoint.index].destroy){
      this.nextWaypoint.destroy = true;
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
  }

  this.debugString = function(){
    return "CARRIER: [pos:"+Math.floor(this.body.x)+"/"+Math.floor(this.body.y)+"][target:"+this.nextWaypoint.x+"/"+this.nextWaypoint.y+"]"+
      "[looking:"+this.nextWaypoint.directionX+"/"+this.nextWaypoint.directionY+"][moving:"+this.body.velocity.x+"/"+this.body.velocity.y+"]";
  }

  this.setPause = function(pause){
    this.paused = pause;
  }
}

Carrier.prototype = Object.create(Phaser.Sprite.prototype);
Carrier.prototype.constructor = Carrier;
