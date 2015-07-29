var ParaBackground = function(conflux, game, offsetX, speedX, speedY, group, image){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof speed === 'undefined') { speed = 10; }
  Phaser.Sprite.call(this, game, offsetX, game.height/3, image);
  group.add(this);

  this.cConstants = {
    offsetX: offsetX,
    speedX: speedX,
    speedY: speedY
  };

  this.cState = {
    paused: false
  };

  this.update = function(){
    this.x = this.game.camera.x + this.cConstants.offsetX - ((this.game.camera.x*this.cConstants.speedX) % 768);
    this.y = this.game.camera.y - (this.game.camera.y * this.cConstants.speedY);
  };

  this.setPause = function(pause){
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

  this.setPause(false);
}

ParaBackground.prototype = Object.create(Phaser.Sprite.prototype);
ParaBackground.prototype.constructor = ParaBackground;
