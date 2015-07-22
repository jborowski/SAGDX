var Turret = function(conflux, game, x, y, group, facing, raiseTo, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, 'turret');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(48, 74, 2, 0);
  if(this.game.debug){
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
  if(facing == -1){
    this.animations.play('left');
  } else {
    this.animations.play('right');
  }

  this.cConstants = {
    animationPausedOffset: 2,
    liftSpeed: 2*gridSize,
    raiseTo: raiseTo*gridSize
  };

  this.cState = {
    paused: false,
    facing: facing,
    justSpawned: true,
    moving: 0
  }

  this.update = function(){
    if(this.cState.paused){
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    } else if(this.cState.moving != 0){
      this.body.velocity.y = this.cConstants.liftSpeed * this.cState.moving;
      this.checkTarget();
    } else if(this.cState.justSpawned){
      this.cState.justSpawned = false;
      this.cState.moving = -1;
    } else {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    }
  };
  
  this.checkTarget = function(){
    if(this.body.y > this.cConstants.raiseTo){
      this.cState.moving = -1;
    } else {
      this.cState.moving = 0;
    }
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
  this.setPause(!!startPaused);
}

Turret.prototype = Object.create(Phaser.Sprite.prototype);
Turret.prototype.constructor = Turret;
