var Carrier = function(conflux, game, x, y, group, facing, waypoints){
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, 'carrier');
  game.physics.arcade.enable(this);
  group.add(this);
  this.thisType = "carrier";
  this.body.immovable = true;
  this.outOfBoundsKill = true;
  this.facing = facing;
  this.waypoints = waypoints;
  this.conflux = conflux;

  this.cConstants = {
    carrierSpeed: 15*gridSize
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

  this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.carrierSpeed;
  this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.carrierSpeed;

  this.update = function(){
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
      this.setNextWaypoint();
    } else {
      if(!reachedX){
        this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.carrierSpeed;
      }
      if(!reachedY){
        this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.carrierSpeed;
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
    this.body.velocity.x = this.nextWaypoint.directionX * this.cConstants.carrierSpeed;
    this.body.velocity.y = this.nextWaypoint.directionY * this.cConstants.carrierSpeed;
  }

  this.debugString = function(){
    return "CARRIER: [pos:"+Math.floor(mob.body.x)+"/"+Math.floor(mob.body.y)+"][target:"+mob.nextWaypoint.x+"/"+mob.nextWaypoint.y+"]"+
      "[looking:"+mob.nextWaypoint.directionX+"/"+mob.nextWaypoint.directionY+"][moving:"+mob.body.velocity.x+"/"+mob.body.velocity.y+"]"+
      "[reached:"+reachedX+"/"+reachedY+"]\n";
  }
}

Carrier.prototype = Object.create(Phaser.Sprite.prototype);
Carrier.prototype.constructor = Carrier;
