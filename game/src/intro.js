var introState = {
  // Settings
  gravity: 40*gridSize,

  // State Variables
  debug:false,
  preload: function(){
    this.game.load.tilemap('foregroundLayerMap', 'data/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('backgroundLayerMap', 'data/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('collisionLayerMap', 'data/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('foregroundTileset', 'assets/levels/act1/foregroundTileset.png');
    this.game.load.image('backgroundTileset', 'assets/levels/act1/backgroundTileset.png');
    this.game.load.image('collisionTileset', 'assets/levels/act1/collisionTileset.png');

    this.game.load.text('spawns', 'data/spawns.json');

    this.game.load.image('player', 'assets/player1.png');
    this.game.load.image('truck', 'assets/truck.png');
  },
  create: function(){
    this.mobs = this.game.add.group();
    this.mobPieces = this.game.add.group();
    this.game.renderer.renderSession.roundPixels = true;
    this.map = this.game.add.tilemap('foregroundLayerMap');
    this.map.addTilesetImage('foregroundTileset');
    this.foregroundLayer = this.map.createLayer('foregroundLayer');
    this.foregroundLayer.resizeWorld();
    this.foregroundLayer.renderSettings.enableScrollDelta = false;

    this.bgMap = this.game.add.tilemap('backgroundLayerMap');
    this.bgMap.addTilesetImage('backgroundTileset');
    this.backgroundLayer = this.bgMap.createLayer('backgroundLayer');
    this.backgroundLayer.renderSettings.enableScrollDelta = false;

    this.collisionMap = this.game.add.tilemap('collisionLayerMap');
    this.collisionMap.addTilesetImage('collisionTileset');
    this.collisionLayer = this.collisionMap.createLayer('collisionLayer');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 808080;
  
    this.player = new Player(this, this.game, 0, 15*gridSize, 'player');
    this.game.camera.follow(this.player);

    var spawnList = JSON.parse(this.game.cache.getText('spawns'));
    var ii, spawnDef;
    for(var ii=0; ii < spawnList.length; ii+=1){
      spawnDef = spawnList[ii];
      this.spawnMob(spawnDef.unit.type, spawnDef.x*gridSize, spawnDef.y*gridSize, spawnDef.unit.facing);
    }

    if(this.debug){
      this.debugText = this.game.add.text(5, 50, 'DEBUG INFO ', { fontSize: '10px', fill: '#000' });
    }
  },
  update: function(){
    this.game.physics.arcade.collide(this.mobs, this.collisionLayer);
    this.game.physics.arcade.collide(this.player, this.mobs, null, this.mobContact, this);
    this.mobs.forEach(this.updateTruck);

    if(this.debug){
      this.debugText.text = this.player.debugString();
    }
  },
  updatePlayer: function(){
    // Riding?
    if(this.player.riding){
      this.checkLock();
    }

    // Jumps
    /// Check if we can jump
    if(this.player.body.blocked.down && this.landed){
      this.landed = true;
    } else if(this.player.body.blocked.down && this.cursors.up.isUp){
      this.landed = true;
    } else if(this.player.locked){
      this.landed = true;
    } else {
      this.landed = false;
    }

    /// Start a Jump
    if(this.landed && this.cursors.up.isDown) {
      this.jumping = true;
      this.jumpStart = this.player.body.y;
      this.cancelLock();
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
    
    if(this.player.locked){
      this.checkLock();
    }
  },
  spawnMob: function(type, xCoord, yCoord, direction){
    var mob;
    if(type=="truck"){
      mob = this.mobs.create(xCoord, yCoord, 'truck');
      this.game.physics.arcade.enable(mob);
      mob.body.immovable = true;
      mob.outOfBoundsKill = true;
      mob.facing = direction;
      return mob;
    }
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
  },
  mobContact: function(player, mob){
    if(player.right > mob.left && player.left < mob.right && player.bottom < mob.top){
      player.y = mob.top - player.height;
      player.riding = mob;
      return false;
    } else {
      return true;
    }
  },
  checkLock: function () {
    if(this.player.body.right < this.player.riding.body.left || this.player.body.left > this.player.riding.body.right){
      this.cancelLock();
    }
  },
  cancelLock: function () {
    this.player.riding = null;
  },
}
