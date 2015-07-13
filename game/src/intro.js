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

    this.game.load.spritesheet('player', 'assets/player/prototype.png', 16, 64);
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
      this.spawnMob(spawnDef.unit, spawnDef.x*gridSize, spawnDef.y*gridSize);
    }

    if(this.debug){
      this.debugText = this.game.add.text(5, 50, 'DEBUG INFO ', { fontSize: '10px', fill: '#000' });
    }
  },
  update: function(){
    this.game.physics.arcade.collide(this.mobs, this.collisionLayer);
    this.mobs.forEach(this.updateMob);

    if(this.debug){
      this.debugText.text = this.player.debugString();
    }
  },
  spawnMob: function(unit, xCoord, yCoord){
    var mob;
    if(unit.type=="truck"){
      mob = this.mobs.create(xCoord, yCoord, 'truck');
      mob.mobType = "truck";
    } else if(unit.type=="carrier"){
      mob = this.mobs.create(xCoord, yCoord, 'carrier');
      mob.mobType = "carrier";
      mob.waypoints = unit.waypoints;
      mob.nextWaypointIndex = 0;
      mob.nextWaypoint = function(){
      };
    }
    this.game.physics.arcade.enable(mob);
    mob.body.immovable = true;
    mob.outOfBoundsKill = true;
    mob.facing = unit.facing;
    mob.groupRef = this;
    return mob;
  },
  updateMob: function(mob){
    if(mob.mobType == "truck"){
      mob.groupRef.updateTruck(mob);
    } else if(mob.mobType == "carrier"){
      mob.groupRef.updateCarrier(mob);
    }
  },
  updateCarrier: function(carrier){
    if(!carrier.waypointDirectionX){
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
  }
}
