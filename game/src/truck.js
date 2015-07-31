var Truck = function(conflux, game, x, y, group, facing, speed, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof speed === 'undefined') { speed = 3; }
  Phaser.Sprite.call(this, game, x, y, 'truck');
  game.physics.arcade.enable(this);
  group.add(this);
  this.mobType = "truck";
  this.conflux = conflux;
  this.animations.add('plain', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  this.animations.play('plain', 20, true);

  this.sfx = this.game.add.audio('sfx');
  this.sfx.addMarker('idle', 9.0, 0.426, 0.05, true);

  this.cConstants = {
    groundSpeed: speed*gridSize,
    fallSpeed: 20*gridSize,
    animationPausedOffset: 20
  };

  this.cState = {
    paused: false,
    facing: facing
  }

  this.update = function(){
    if(this.cState.paused){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.body.gravity.y = 0;
    } else {
      if (!this.sfx.isPlaying) this.sfx.play('idle');
      this.body.gravity.y = 40*gridSize;

      if(this.body.velocity.y > this.cConstants.fallSpeed){
        this.body.velocity.y = this.cConstants.fallSpeed;
      }

      if(this.body.onFloor() || this.body.touching.down){
        this.body.velocity.x = this.cConstants.groundSpeed*this.cState.facing;
        this.y = Math.ceil(this.y);
      }
    }
  };

  this.hit = function(){
    this.setPause(false);
  };

  this.debugString = function(){
    return "[pos:"+Math.floor(this.x)+"/"+Math.floor(this.y)+"]";
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

Truck.prototype = Object.create(Phaser.Sprite.prototype);
Truck.prototype.constructor = Truck;
