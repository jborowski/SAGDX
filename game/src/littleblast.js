var LittleBlast = function(conflux, game, x, y, group, facing, speed, startPaused){
  if(typeof group === 'undefined'){ group = game.world; }
  if(typeof speed === 'undefined') { speed = 3; }
  Phaser.Sprite.call(this, game, x, y, 'littleblast');
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(48,16,16,32);
  if(this.game.debug){
    var hitboxG = new Phaser.Graphics().beginFill(0x898989).drawRect(0,0,48,16);
    var hitbox = game.add.sprite(16,32,hitboxG.generateTexture());
    hitbox.alpha = 0.5;
    this.addChild(hitbox);
  }
  this.mobType = "littleblast";
  this.facing = facing;
  this.conflux = conflux;
  this.paused = false;

  this.cConstants = {
    speed: speed*gridSize,
  };

  this.update = function(){
    if(this.paused){
      this.body.velocity.x = 0;
    } else {
      this.body.velocity.x = this.cConstants.speed*this.facing;
    }
  };

  this.mobContact = function(mob){
    mob.hit();
    this.destroy();
  };

  this.tileContact = function(tile){
    this.destroy();
  };

  this.debugString = function(){
    return "[pos:"+Math.floor(this.x)+"/"+Math.floor(this.y)+"]";
  };

  this.setPause = function(pause){
    this.paused = pause;
  };
  this.setPause(!!startPaused);
}

LittleBlast.prototype = Object.create(Phaser.Sprite.prototype);
LittleBlast.prototype.constructor = LittleBlast;
