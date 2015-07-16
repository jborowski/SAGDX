var Player = function(conflux, game, x, y, key, group) {
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  group.add(this);
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


  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.conflux = conflux;

  this.riding = null;

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
    this.game.physics.arcade.collide(this, this.conflux.mobs, this.mobContact, this.checkmobs, this);
    this.game.physics.arcade.collide(this, this.conflux.lifts, this.mobContact, this.checkmobs, this);
    this.game.physics.arcade.collide(this, this.conflux.collisionLayer, this.tileContact, null, this);
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    this.moveX();
    this.moveY();
    this.setAnimation();
    this.resetAgainst();
    this.riding = null;
  };

  this.setAnimation = function(){
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
  };

  this.moveX = function(){
    animationToRun = 0;
    // If moving left or right, change facing and move forward
    if(this.cursors.left.isDown){
      this.cState.facing = -1;
    } else if(this.cursors.right.isDown){
      this.cState.facing = 1;
    }

    if(this.cursors.left.isDown || this.cursors.right.isDown){
      this.body.velocity.x = this.cConstants.runSpeed * this.cState.facing;
    }

    // If player is riding a mob, add velocity according to mob movement
    if(this.riding != null){
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
    if(reachedMax || this.against.top || stopByChoice){
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

  this.tileContact = function(player, tile){
    player.was.below = player.body.prev.y >= tile.bottom;
    player.was.above = (player.body.prev.y+player.body.height) <= tile.top;
    player.was.left = (player.body.prev.x+player.body.width) <= tile.left;
    player.was.right = player.body.prev.x >= tile.right;
    var newX=player.body.position.x;
    var newY=player.body.position.y;
    if(!(player.was.above || player.was.below) && (player.was.left || player.was.right)){
      if (player.body.overlapX < 0){
        player.body.blocked.left = true;
        player.against.left = tile;
        newX = tile.right + 1;
        player.body.position.x = newX;
      } else if (player.body.overlapX > 0){
        player.body.blocked.right = true;
        player.against.right = tile;
        newX = tile.left - player.body.width - 1;
        player.body.position.x = newX;
      }
    } else if(!(player.was.left || player.was.right)){
      if (player.body.overlapY < 0){
        player.body.blocked.top = true;
        player.against.top = tile;
        newY = tile.bottom + 1;
        player.body.position.y = newY;
      } else if (player.body.overlapY > 0){
        player.body.blocked.bottom = true;
        player.against.bottom = tile;
        newY = tile.top - player.body.height - 1;
        player.body.position.y = newY;
      }
    }
    player.resetWasDirections();
  }

  this.mobContact = function(player, mob){
    player.was.below = player.body.prev.y >= (mob.body.prev.y + mob.body.height);
    player.was.above = (player.body.prev.y+player.body.height) <= mob.body.prev.y;
    player.was.left = (player.body.prev.x+player.body.width) <= mob.body.prev.x;
    player.was.right = player.body.prev.x >= (mob.body.prev.x + mob.body.width);
    var newX=player.body.position.x;
    var newY=player.body.position.y;
    if(!(player.was.above || player.was.below) && (player.was.left || player.was.right)){
      if (player.body.overlapX < 0){
        player.body.blocked.left = true;
        player.against.left = mob;
        newX = mob.body.x + mob.body.width + 1;
        player.body.position.x = newX;
      } else if (player.body.overlapX > 0){
        player.body.blocked.right = true;
        player.against.right = mob;
        newX = mob.body.x - player.body.width - 1;
        player.body.position.x = newX;
      }
    } else if(!(player.was.left || player.was.right)){
      if (player.body.overlapY < 0){
        player.body.blocked.top = true;
        player.against.top = mob;
        newY = mob.body.y + mob.body.height + 1;
        player.body.position.y = newY;
      } else if (player.body.overlapY > 0){
        player.body.blocked.bottom = true;
        player.against.bottom = mob;
        player.riding = mob;
        newY = mob.body.y - player.body.height - 1;
        player.body.position.y = newY;
      }
    }
    player.resetWasDirections();
  }

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
