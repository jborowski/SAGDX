var introState = {
  // Settings
  runSpeed: 15,
  maxJumpHeight: 4*gridSize,
  minJumpHeight: 1*gridSize,
  jumpSpeed: 20*gridSize,
  maxJumpReduction: 0.7,
  fallSpeed: 20*gridSize,
  gravity: 40*gridSize,

  // State Variables
  jumping: false,
  jumpStart: 0,
  jumpHeight: 0,
  jumpReduction: 0,
  landed: false,
  debug:false,
  preload: function(){
    this.game.load.tilemap('map', 'data/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('bg_map', 'data/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('collision_map', 'data/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/level_tileset.png');
    this.game.load.image('bg_tiles', 'assets/bg_tileset.png');
    this.game.load.image('collision_tiles', 'assets/collision_tileset.png');
    this.game.load.image('player', 'assets/player1.png');
    this.game.load.image('truck', 'assets/truck.png');
  },
  create: function(){
    this.mobs = this.game.add.group();
    this.mobPieces = this.game.add.group();
    this.game.renderer.renderSession.roundPixels = true;
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.map = this.game.add.tilemap('map');
    this.fgLayer = this.map.createLayer('tiles_layer');
    this.map.addTilesetImage('tiles');
    this.fgLayer.resizeWorld();
    this.fgLayer.renderSettings.enableScrollDelta = false;

    this.bgMap = this.game.add.tilemap('bg_map');
    this.bgMap.addTilesetImage('bg_tiles');
    this.bgLayer = this.bgMap.createLayer('bg_tiles_layer');
    this.bgLayer.renderSettings.enableScrollDelta = false;

    this.collisionMap = this.game.add.tilemap('collision_map');
    this.collisionLayer = this.collisionMap.createLayer('collision_tiles_layer');
    this.collisionMap.addTilesetImage('collision_tiles');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 808080;

    this.player = this.game.add.sprite(5*gridSize, 16*gridSize, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 0;
    this.player.body.collideWorldBounds = true;
    this.game.camera.follow(this.player);

    this.test_truck = this.spawnTruck(7*gridSize, 15*gridSize, -1);

    if(this.debug){
      this.debugText = this.game.add.text(5, 50, 'DEBUG INFO ', { fontSize: '8px', fill: '#000' });
    }
  },
  update: function(){
    this.game.physics.arcade.collide(this.player, this.collisionLayer);
    this.game.physics.arcade.collide(this.mobs, this.collisionLayer);
    this.game.physics.arcade.collide(this.player, this.mobs);
    this.updatePlayer();
    this.mobs.forEach(this.updateTruck);

    if(this.debug){
      this.debugText.text = "DEBUG INFO - Player Info: [X:"+this.player.x+"] [Y:"+this.player.y+"]\n"+
          "[MIN JUMP HEIGHT:"+this.minJumpHeight+"] [MAX JUMP HEIGHT:"+this.maxJumpHeight+"]\n"+
          "[JUMP HEIGHT:"+this.jumpHeight+"] [JUMPING:"+this.jumping+"] [OKAY TO JUMP:"+this.landed+"] [SPEED REDUCTION:"+this.jumpReduction+"]";
    }
  },
  updatePlayer: function(){
    this.player.body.velocity.x = 0;

    // Horizontal Movement
    if(this.cursors.left.isDown){
      this.player.body.velocity.x = gridSize*-this.runSpeed;
    }
    else if(this.cursors.right.isDown){
      this.player.body.velocity.x = gridSize*this.runSpeed;
    }

    // Jumps
    /// Check if we can jump
    if(this.player.body.blocked.down && this.landed){
      this.landed = true;
    } else if(this.player.body.onFloor() && this.cursors.up.isUp){
      this.landed = true;
    } else {
      this.landed = false;
    }

    /// Start a Jump
    if(this.landed && this.cursors.up.isDown) {
      this.jumping = true;
      this.jumpStart = this.player.body.y;
    }
    
    /// Handle a Jump
    if(this.jumping){
      this.jumpHeight = Math.floor(this.jumpStart - this.player.body.y)
      if(this.jumpHeight >= this.maxJumpHeight || this.player.body.blocked.up || this.cursors.up.isUp){
        this.jumping = false;
        this.player.body.velocity.y = 0;
        if(this.jumpHeight < this.minJumpHeight){
          this.jumping = true;
          this.player.body.velocity.y = -this.jumpSpeed
        }
      } else {
        this.jumpReduction = 0;
        if(this.jumpHeight >= this.minJumpHeight){
          this.jumpReduction = (this.jumpHeight - this.minJumpHeight) / (this.maxJumpHeight - this.minJumpHeight);
          if(this.jumpReduction > this.maxJumpReduction){
            this.jumpReduction = this.maxJumpReduction;
          }
        }
        this.player.body.velocity.y = - (this.jumpSpeed - (this.jumpSpeed * this.jumpReduction));
      }
    } else {
      this.player.body.gravity.y = this.gravity;
    }
    if(this.player.body.velocity.y > this.fallSpeed){
      this.player.body.velocity.y = this.fallSpeed;
    }

    // Set our position to a solid pixel value if we're on the floor
    if(this.player.body.blocked.down){
      this.player.y = Math.ceil(this.player.y);
    }
  },
  spawnTruck: function(xCoord, yCoord, direction){
    truck = this.mobs.create(xCoord, yCoord, 'truck');
    this.game.physics.arcade.enable(truck);
    truck.body.immovable = true;
    truck.outOfBoundsKill = true;
    truck.facing = 1;
    return truck;
  },
  updateTruck: function(truck){
    truck.body.velocity.x = 5*gridSize*truck.facing;

    truck.body.gravity.y = this.gravity;
    if(truck.body.velocity.y > this.fallSpeed){
      truck.body.velocity.y = this.fallSpeed;
    }

    if(truck.body.onFloor()){
      truck.y = Math.ceil(truck.y);
    }
  }
}
