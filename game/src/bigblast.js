var BigBlast = function(conflux, game, x, y, group, facing, speed, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof speed === 'undefined') { speed = 3; }
  Phaser.Sprite.call(this, game, x, y, 'bigblast');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(48,48,16,16);
  if(this.game.debugMode){
    var hitboxG = new Phaser.Graphics().beginFill(0x898989).drawRect(0,0,48,48);
    var hitbox = game.add.sprite(16,16,hitboxG.generateTexture());
    hitbox.alpha = 0.5;
    this.addChild(hitbox);
  }
  this.mobType = "bigblast";
  this.conflux = conflux;

  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;

  this.animations.add('plain', [0]);
  this.animations.play('plain');

  this.cConstants = {
    speed: speed*gridSize,
    animationPausedOffset: 1
  };

  this.cState = {
    markDestroyed: false,
    paused: false,
    facing: facing
  };

  this.update = function(){
    if(this.cState.paused){
      this.body.velocity.x = 0;
    } else {
      this.body.velocity.x = this.cConstants.speed*this.cState.facing;
    }
    if(this.cState.markDestroyed){
      new LittleBlast(this.conflux, this.game, this.x, this.y, this.conflux.blasts, this.cState.facing * -1, this.cConstants.speed/gridSize, false);

      this.destroy();
    }
  };

  this.mobContact = function(mob){
    mob.hit();
    this.cState.markDestroyed = true;
  };

  this.tileContact = function(tile){
    this.cState.markDestroyed = true;
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

BigBlast.prototype = Object.create(Phaser.Sprite.prototype);
BigBlast.prototype.constructor = BigBlast;
