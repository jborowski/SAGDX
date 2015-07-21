var Player = function(conflux, game, x, y, key, group) {
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  group.add(this);
  this.mobType = "player";
  this.body.setSize(16,64,26,16);
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.collideWorldBounds = true;
  this.animations.add('standRight', [70]);
  this.animations.add('standLeft', [71]);
  this.animations.add('runRight', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  this.animations.add('runLeft', [39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20]);
  this.animations.add('fallRight', [40,41,42,43,44,45,46,47,48,49,50,51,52,53,54]);
  this.animations.add('fallLeft', [55,56,57,58,59,60,61,62,63,64,65,66,67,68,69]);
  this.animations.add('hurtLeft', [72,73]);
  this.animations.add('hurtRight', [74,75]);


  this.cursors = this.game.input.keyboard.createCursorKeys();
  this.keyboard = this.game.input.keyboard;

  this.conflux = conflux;

  this.riding = null;

  this.cConstants = {
    runSpeed: 15*gridSize,
    maxJumpHeight: 5*gridSize,
    minJumpHeight: 1*gridSize,
    jumpSpeed: 20*gridSize,
    maxJumpReduction: 0.7,
    fallSpeed: 20*gridSize,
    hurtSpeed: 20*gridSize,
    hurtHeight: 3*gridSize,
    hurtWidth: 6*gridSize,
    hurtTimeout: 1000,
    maxHurtReductionY: 0.7,
    animationPausedOffset: 80
  };

  this.cState = {
    jumping: false,
    jumpStart: 0,
    jumpHeight: 0,
    jumpReduction: 0,
    jumpReady: false,
    facing: 1,
    flying: false,
    hurt: false,
    hurtStartX: 0,
    hurtDeltaX: 0,
    hurtReductionX: 0,
    hurtAscending: false,
    hurtDescending: false,
    hurtTime: 0,
    hurtTimeoutStarted: false,
    justToggled: false,
    paused: false
  };

  this.against = {
    left: null,
    top: null,
    bottom: null,
    right: null,
  };

  this.resetAgainst = function(){
    this.against.left = null;
    this.against.top = null;
    this.against.right = null;
    this.against.bottom = null;
  };

  this.resetWasDirections = function(){
    this.was = {};
    this.was.below = false;
    this.was.above = false;
    this.was.left = false;
    this.was.right = false;
  };
  this.resetWasDirections();

  this.debugString = function(){
    return "Position: [x="+Math.floor(this.body.x)+"/px="+Math.floor(this.body.prev.x)+"] [y="+Math.floor(this.body.y)+"/px="+Math.floor(this.body.prev.y)+"]"
  };

  this.update = function(){
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    if (!this.cState.paused){
      this.moveX();
      this.moveY();
      if(this.cState.hurt){
        this.processHurtTimeout();
      }
      this.setAnimation();
      this.resetAgainst();
      this.riding = null;
    }
  };

  this.setAnimation = function(){
    if(this.cState.hurt){
      if(this.cState.facing > 0){
        this.animations.play('hurtRight', 10);
      } else {
        this.animations.play('hurtLeft', 10);
      }
    }else{
      if(this.against.bottom){
        if(this.cState.facing > 0){
          if(this.cursors.right.isDown){
            this.animations.play('runRight');
          } else {
            this.animations.play('standRight');
          }
        } else {
          if(this.cursors.left.isDown){
            this.animations.play('runLeft');
          } else {
            this.animations.play('standLeft');
          }
        }
      } else {
        if(this.cState.facing > 0){
          this.animations.play('fallRight');
        } else {
          this.animations.play('fallLeft');
        }
      }
    }
  };


  this.moveX = function(){
    animationToRun = 0;

    if(this.cState.hurt){
      // Player cannot control themselves while hurt
      this.processHurtX();
    } else{
      // If moving left or right, change facing and move forward
      if(this.cursors.left.isDown){
        this.cState.facing = -1;
      } else if(this.cursors.right.isDown){
        this.cState.facing = 1;
      }

      if(this.cursors.left.isDown || this.cursors.right.isDown){
        this.body.velocity.x = this.cConstants.runSpeed * this.cState.facing;
      }

      if(this.riding != null){
        this.body.velocity.x += this.riding.body.velocity.x;
      }
    }
  };

  this.moveY = function(){
    // This is a debug only fly around option, not for normal gameplay
    if(this.cState.flying && !this.cState.hurt){
      if(this.cursors.up.isDown){
        this.body.velocity.y = -this.cConstants.runSpeed;
      } else if(this.cursors.down.isDown){
        this.body.velocity.y = this.cConstants.runSpeed;
      }
    } else {
    // Normal flow here
      if(this.cState.hurt){
        this.processHurtY();
      } else if(this.cState.jumping){
        this.processJump();
      } else {
        if(this.cursors.up.isDown && this.cState.jumpReady && !this.cState.hurt){
          this.startJump();
        } else {
          this.body.velocity.y = this.cConstants.fallSpeed;
        }
      }

      // If we're on the ground with the up arrow unpressed, flag us as able to jump next update.
      // If we're not on the ground or our up arrow is pressed, we know we can't be in a state where we should allow jumping
      if(!this.against.bottom || this.cursors.up.isDown){
        this.cState.jumpReady = false
      } else if(this.against.bottom && this.cursors.up.isUp){
        this.cState.jumpReady = true;
      }
    }
  }

  this.processJump = function(){
    this.cState.jumpHeight = this.cState.jumpStart - this.body.y;
    var reachedMax = this.cState.jumpHeight >= this.cConstants.maxJumpHeight
    var reachedMin = this.cState.jumpHeight >= this.cConstants.minJumpHeight
    var stopByChoice = this.cursors.up.isUp && reachedMin

    // If we should stop jumping
    if(reachedMax || this.against.top || stopByChoice || this.cState.hurt){
      this.cState.jumping = false;
      this.body.velocity.y = 0;
    // Otherwise, continue ascent
    } else {
      if(reachedMin){
        // Reduce jump speed as we climb, but only after a minimum height has been reached
        this.cState.jumpReduction = (this.cState.jumpHeight - this.cConstants.minJumpHeight) / (this.cConstants.maxJumpHeight - this.cConstants.minJumpHeight);
        this.cState.jumpReduction = Math.min(this.cState.jumpReduction, this.cConstants.maxJumpReduction);
      } else {
        this.cState.jumpReduction = 0;
      }
      this.body.velocity.y = -1 * (this.cConstants.jumpSpeed - (this.cConstants.jumpSpeed * this.cState.jumpReduction));
    }
  }

  this.reverseHurt = function(){
    this.cState.facing *= -1;
  }

  this.processHurtX = function(){
    if(this.against.bottom || this.against.left || this.against.right){
      this.body.velocity.x = 0;
    } else {
      this.body.velocity.x = -1 * this.cState.facing * this.cConstants.hurtSpeed;
    }
  };

  this.processHurtY = function(){
    this.cState.hurtDeltaY = this.cState.hurtStartY - this.body.y;
    var reachedMax = this.cState.hurtDeltaY >= this.cConstants.hurtHeight

    // Have we ascended high enough? If so, stop
    if(this.cState.hurtAscending && (reachedMax || this.against.top)){
      this.cState.hurtAscending = false;
      this.cState.hurtDescending = true;
      this.body.velocity.y = 0;
    }

    // Have we fallen far enough? If so, stop smoothing and just use normal fall speed
    if(this.cState.hurtDescending && (this.cState.hurtStartY < this.body.y || this.against.bottom)){
      this.cState.hurtDescending = false;
    }

    if(this.cState.hurtAscending){
    // If we are still ascending
      this.cState.hurtReductionY = (this.cState.hurtDeltaY) / (this.cConstants.hurtHeight);
      this.cState.hurtReductionY = Math.min(this.cState.hurtReductionY, this.cConstants.maxHurtReductionY);
      this.body.velocity.y = -1 * (this.cConstants.hurtSpeed - (this.cConstants.hurtSpeed * this.cState.hurtReductionY));
    } else if(this.cState.hurtDescending){
      this.cState.hurtReductionY = (this.cState.hurtDeltaY) / (this.cConstants.hurtHeight);
      this.cState.hurtReductionY = Math.min(this.cState.hurtReductionY, this.cConstants.maxHurtReductionY);
      this.body.velocity.y = (this.cConstants.hurtSpeed - (this.cConstants.hurtSpeed * this.cState.hurtReductionY));
    } else {
      this.body.velocity.y = this.cConstants.hurtSpeed;
    }
  };

  this.processHurtTimeout = function(){
    if(this.cState.hurtTimeoutStarted){
      if(this.game.time.now > this.cState.hurtTime +this.cConstants.hurtTimeout){
        this.cancelHurt();
      }
    } else if(this.against.bottom){
      this.cState.hurtTimeoutStarted = true;
      this.cState.hurtTime = this.game.time.now;
    }
    if(!this.against.bottom){
      this.cState.hurtTimeoutStarted = false;
    }
  }

  this.startJump = function(){
    this.cState.jumping = true;
    this.cState.jumpStart = this.body.y;
    this.cState.jumpHeight = 0;
    this.cState.jumpReduction = 0;
    this.body.velocity.y = -this.cConstants.jumpSpeed;
  };
  
  this.hit = function(){
    this.hurt();
  };

  this.hurt = function(){
    this.cState.hurt = true;

    this.cState.hurtAscending = true;
    this.cState.hurtDescending = false;
    this.cState.hurtStartY =  this.body.y,
    this.cState.hurtDeltaY =  0,
    this.cState.hurtReductionY =  0,

    this.cState.hurtTimeoutStarted = false;
    this.cState.hurtTime =  0,

    // Cancel other states
    this.cState.jumping = false;
  };

  this.cancelHurt = function(){
    this.cState.hurt = false;
  }

  this.tileContact = function(tile){
    this.was.below = this.body.prev.y >= tile.bottom;
    this.was.above = (this.body.prev.y+this.body.height) <= tile.top;
    this.was.left = (this.body.prev.x+this.body.width) <= tile.left;
    this.was.right = this.body.prev.x >= tile.right;
    var newX=this.body.position.x;
    var newY=this.body.position.y;
    if(!(this.was.above || this.was.below) && (this.was.left || this.was.right)){
      if (this.body.overlapX < 0){
        this.body.blocked.left = true;
        this.against.left = tile;
        newX = tile.right + 1;
        this.body.position.x = newX;
      } else if (this.body.overlapX > 0){
        this.body.blocked.right = true;
        this.against.right = tile;
        newX = tile.left - this.body.width - 1;
        this.body.position.x = newX;
      }

      // Bounce of the wall if we're hurting
      if(this.cState.hurt){
        this.reverseHurt();
      }
    } else if(!(this.was.left || this.was.right)){
      if (this.body.overlapY < 0){
        this.body.blocked.top = true;
        this.against.top = tile;
        newY = tile.bottom + 1;
        this.body.position.y = newY;
      } else if (this.body.overlapY > 0){
        this.body.blocked.bottom = true;
        this.against.bottom = tile;
        newY = tile.top - this.body.height - 1;
        this.body.position.y = newY;
      }
    }
    this.resetWasDirections();
  }

  this.mobContact = function(mob){
    this.was.below = this.body.prev.y >= (mob.body.prev.y + mob.body.height);
    this.was.above = (this.body.prev.y+this.body.height) <= mob.body.prev.y;
    this.was.left = (this.body.prev.x+this.body.width) <= mob.body.prev.x;
    this.was.right = this.body.prev.x >= (mob.body.prev.x + mob.body.width);
    var newX=this.body.position.x;
    var newY=this.body.position.y;
    if(!(this.was.above || this.was.below) && (this.was.left || this.was.right)){
      /* This may be needed again soon
      if (this.body.overlapX < 0){
        this.against.left = mob;
        newX = mob.body.x + mob.body.width + 1;
        this.body.position.x = newX;
      } else if (this.body.overlapX > 0){
        this.against.right = mob;
        newX = mob.body.x - this.body.width - 1;
        this.body.position.x = newX;
      }*/
      if(this.was.left){
        this.cState.facing = 1;
      } else {
        this.cState.facing = -1;
      }
      this.hurt();
      if(mob.cState.paused){
        mob.setPause(false);
      }
    } else if(!(this.was.left || this.was.right)){
      if (this.body.overlapY < 0){
        /*this.body.blocked.top = true;
        this.against.top = mob;
        newY = mob.body.y + mob.body.height + 1;
        this.body.position.y = newY;*/
        this.hurt();
        if(mob.paused){
          mob.setPause(false);
        }
      } else if (this.body.overlapY > 0){
        this.body.blocked.bottom = true;
        this.against.bottom = mob;
        this.riding = mob;
        newY = mob.body.y - this.body.height - 1;
        this.body.position.y = newY;
        if(mob.cState.paused){
          mob.setPause(false);
        }
      }
    }
    this.resetWasDirections();
  }

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
  }
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
