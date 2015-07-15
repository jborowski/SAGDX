var introState = {
  // Settings
  gravity: 40*gridSize,
  carrierSpeed: 10*gridSize,

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

    this.game.load.spritesheet('player', 'assets/player/spritesheet.png', 60, 64);
    this.game.load.image('truck', 'assets/truck.png');
    this.game.load.image('carrier', 'assets/carrier.png');
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
      this.spawnMob(this.mobs, spawnDef.unit, spawnDef.x*gridSize, spawnDef.y*gridSize);
    }

    this.game.world.bringToTop(this.mobs);
    this.game.world.bringToTop(this.player);

    if(this.debug){
      this.debugText = this.game.add.text(5, 50, 'DEBUG INFO ', { fontSize: '10px', fill: '#FFF' });
      this.debugText.fixedToCamera = true;
    }
  },
  update: function(){
    if(this.debug){
      this.debugText.text = "";
    }

    this.game.physics.arcade.collide(this.mobs, this.collisionLayer);
    this.mobs.forEach(this.updateMob);

    if(this.debug){
      this.debugText.text += "Player: "+this.player.debugString()+"\n";
    }
  },
  spawnMob: function(group, unit, xCoord, yCoord){
    var mob;
    if(unit.type=="truck"){
      mob = new Truck(this, this.game, xCoord, yCoord, group, unit.facing);
    } else if(unit.type=="carrier"){
      mob = new Carrier(this, this.game, xCoord, yCoord, group, unit.facing, unit.waypoints);
    }
    return mob;
  },
  updateMob: function(mob){
    mob.update();
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
  }
}
