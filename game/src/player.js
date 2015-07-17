var Player = function(conflux, game, x, y, key, group) {
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.setSize(16,64,26,16);
  this.body.allowGravity = true;
  this.body.gravity.y = 100*gridSize;
  this.body.collideWorldBounds = true;
  this.animations.add('standRight', [70]);
  this.animations.add('standLeft', [71]);
  this.animations.add('runRight', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  this.animations.add('runLeft', [39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20]);
  this.animations.add('fallRight', [40,41,42,43,44,45,46,47,48,49,50,51,52,53,54]);
  this.animations.add('fallLeft', [55,56,57,58,59,60,61,62,63,64,65,66,67,68,69]);

  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.conflux = conflux;

  this.cConstants = {
    runSpeed: 15*gridSize,
    maxJumpHeight: 4*gridSize,
    minJumpHeight: 1*gridSize,
    jumpSpeed: 20*gridSize,
    maxJumpReduction: 0.7,
    fallSpeed: 20*gridSize
  };

  this.cState = {
    jumping: false,
    jumpStart: 0,
    jumpHeight: 0,
    jumpReduction: 0,
    jumpReady: false,
    facing: 1,
    flying: false
  };

  this.debugString = function(){
    return "Position: [x="+Math.floor(this.body.x)+"/px="+Math.floor(this.body.prev.x)+"] [y="+Math.floor(this.body.y)+"/px="+Math.floor(this.body.prev.y)+"]"
  };

  this.update = function(){
    this.body.velocity.x = 0;

    this.moveX();
    this.moveY();
    this.setAnimation();
  };

  this.setAnimation = function(){
    if(this.body.onFloor() || this.body.touching.down){
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
  };

  this.moveX = function(){
    animationToRun = 0;
    // If moving left or right, change facing and move forward
    if(this.cursors.left.isDown){
      this.cState.facing = -1;
    } else if(this.cursors.right.isDown){
      this.cState.facing = 1;
    }

    if((!this.body.touching.left && this.cursors.left.isDown) || (!this.body.touching.right && this.cursors.right.isDown)){
      this.body.velocity.x = this.cConstants.runSpeed * this.cState.facing;
    }

    if(this.riding){
      this.body.velocity.x += this.riding.body.velocity.x;
    }
  };

  this.moveY = function(){
    // This is a debug only fly around option, not for normal gameplay
    if(this.cState.flying){
      if(this.cursors.up.isDown){
        this.body.velocity.y = -this.cConstants.runSpeed;
      } else if(this.cursors.down.isDown){
        this.body.velocity.y = this.cConstants.runSpeed;
      }
    } else {
    // Normal flow here
      if(this.cState.jumping){
        this.processJump();
      } else {
        if(this.cursors.up.isDown && this.cState.jumpReady){
          this.startJump();
        }
      }

      // If we're on the ground with the up arrow unpressed, flag us as able to jump next update.
      // If we're not on the ground or our up arrow is pressed, we know we can't be in a state where we should allow jumping
      if( !(this.body.onFloor() || this.body.touching.down) || this.cursors.up.isDown){
        this.cState.jumpReady = false
      } else if( (this.body.onFloor() || this.body.touching.down) && this.cursors.up.isUp){
        this.cState.jumpReady = true;
      }

      if (this.body.velocity.y > this.cConstants.fallSpeed){
        this.body.velocity.y = this.cConstants.fallSpeed;
      }

    }
  }

  this.processJump = function(){
    this.cState.jumpHeight = this.cState.jumpStart - this.body.y;
    var reachedMax = this.cState.jumpHeight >= this.cConstants.maxJumpHeight
    var reachedMin = this.cState.jumpHeight >= this.cConstants.minJumpHeight
    var stopByChoice = this.cursors.up.isUp && reachedMin

    // If we should stop jumping
    if(reachedMax || this.body.touching.up || stopByChoice){
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
      this.body.velocity.y = -this.cConstants.jumpSpeed;

      this.body.velocity.y = -1 * (this.cConstants.jumpSpeed - (this.cConstants.jumpSpeed * this.cState.jumpReduction));
    }
  }

  this.startJump = function(){
    this.cState.jumping = true;
    this.cState.jumpStart = this.body.y;
    this.cState.jumpHeight = 0;
    this.cState.jumpReduction = 0;
    this.body.velocity.y = -this.cConstants.jumpSpeed;
  }

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
