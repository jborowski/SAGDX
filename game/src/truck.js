var Truck = function(conflux, game, x, y, group, facing){
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, 'truck');
  game.physics.arcade.enable(this);
  group.add(this);
  this.mobType = "truck";
  this.facing = facing;
  this.conflux = conflux;
  this.paused = false;

  this.cConstants = {
    groundSpeed: 3*gridSize,
    fallSpeed: 20*gridSize
  };

  this.update = function(){
    if(this.paused){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.body.gravity.y = 0;
    } else {
      this.body.velocity.x = this.cConstants.groundSpeed*this.facing;
      this.body.gravity.y = 40*gridSize;

      if(this.body.velocity.y > this.cConstants.fallSpeed){
        this.body.velocity.y = this.cConstants.fallSpeed;
      }

      if(this.body.onFloor()){
        this.y = Math.ceil(this.y);
      }
    }
  };

  this.debugString = function(){
    return "[pos:"+Math.floor(this.x)+"/"+Math.floor(this.y)+"]";
  };

  this.setPause = function(pause){
    this.paused = pause;
  };
}

Truck.prototype = Object.create(Phaser.Sprite.prototype);
Truck.prototype.constructor = Truck;
