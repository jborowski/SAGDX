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

  this.animations.add('left', [0,1,2,3,4,5,12,13,14,15,16,17,24,25,26,27,28,29,36,37,38,39,40,41,48,49,50,51,52,53]);
  this.animations.add('right', [6,7,8,9,10,11,18,19,20,21,22,23,30,31,32,33,34,35,42,43,44,45,46,47,54,55,56,57,58,59]);

  this.cConstants = {
    speed: speed*gridSize,
    animationPausedOffset: 60
  };

  this.cState = {
    markDestroyed: false,
    paused: false,
    facing: facing
  };

  if(this.cState.facing == 1) this.animations.play('right', 20, true);
  else if (this.cState.facing == -1) this.animations.play('left', 20, true);

  this.update = function(){
    if(this.cState.paused){
      this.body.velocity.x = 0;
    } else {
      this.body.velocity.x = this.cConstants.speed*this.cState.facing;
    }
    if(this.cState.markDestroyed){
      new LittleBlast(this.conflux, this.game, this.x, this.y, this.conflux.blasts, this.cState.facing * -1, this.cConstants.speed/gridSize*2, false);

      this.destroy();
    }
  };

  this.mobContact = function(mob){
    mob.hit();
    this.cState.markDestroyed = true;
  };

  this.hit = function(){
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
