var Player = function(conflux, game, x, y, key, group) {
  if(typeof group === 'undefined'){ group = game.world; }
  Phaser.Sprite.call(this, game, x, y, key);
  game.physics.arcade.enable(this);
  group.add(this);
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.collideWorldBounds = true;

  this.cursors = this.game.input.keyboard.createCursorKeys();
  
  this.conflux = conflux;

  this.customConstants = {
    runSpeed: 15*gridSize,
    maxJumpHeight: 4*gridSize,
    minJumpHeight: 1*gridSize,
    jumpSpeed: 20*gridSize,
    maxJumpReduction: 0.7,
    fallSpeed: 20*gridSize
  };

  this.customState = {
    jumping: false,
    jumpStart: 0,
    jumpHeight: 0,
    jumpReduction: 0,
    landed: false,
    facing: 1
  };

  this.against = {
    left: null,
    top: null,
    bottom: null,
    right: null,
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
    return "Position: [x="+this.body.x+"/px="+this.body.prev.x+"] [y="+this.body.y+"/px="+this.body.prev.y+"]"
  };

  this.update = function(){
    this.game.physics.arcade.collide(this, this.conflux.collisionLayer, this.tileContact, null, this);
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;

    this.move();
  };

  this.move = function(){
    // If moving left or right, change facing and move forward
    if(this.cursors.left.isDown){
      this.customState.facing = -1;
    } else if(this.cursors.right.isDown){
      this.customState.facing = 1;
    }

    if(this.cursors.left.isDown || this.cursors.right.isDown){
      this.body.velocity.x = this.customConstants.runSpeed * this.customState.facing;
    }

    if(this.cursors.up.isDown){
      this.body.velocity.y = -this.customConstants.runSpeed;
    } else if(this.cursors.down.isDown){
      this.body.velocity.y = this.customConstants.runSpeed;
    }
  };

  this.fall = function(){
  };
  
  this.tileContact = function(player, tile){
    player.was.below = player.body.prev.y >= tile.bottom;
    player.was.above = player.body.prev.y+player.body.height <= tile.top;
    player.was.left = player.body.prev.x+player.body.width <= tile.left;
    player.was.right = player.body.prev.x >= tile.right;
    var newX=player.body.position.x;
    if(!(player.was.above || player.was.below) && (player.was.left || player.was.right)){
      if (player.body.overlapX < 0){
        player.body.blocked.left = true;
        player.against.left = tile;

        var newX = tile.right+1;
        player.body.position.x = newX;
      } else if (player.body.overlapX > 0){
        player.body.blocked.right = true;
        player.against.right = tile;
        newX = tile.left - player.body.width - 1;
        player.body.position.x = newX;
      }
    }
    if(Math.abs(newX-player.body.prev.x) > 6){
      console.log(player.was);
      alert("uh oh!");
    }
    
    var newY=player.body.position.y;
    if(!(player.was.left || player.was.right) ||
        (player.was.left && player.was.right && player.was.below && player.was.above)){
      if (player.body.overlapY < 0 && tile.faceBottom){
        player.body.blocked.top = true;
        player.against.top = tile;
        newY = tile.bottom+1;
        player.body.position.y = newY;
      } else if (player.body.overlapY > 0 && tile.faceTop){
        player.body.blocked.bottom = true;
        player.against.bottom = tile;
        newY = tile.top-player.body.height-1;
        player.body.position.y = newY;
      }
    }
    player.resetWasDirections();
  }

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
