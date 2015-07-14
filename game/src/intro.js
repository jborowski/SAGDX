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
      this.spawnMob(spawnDef.unit, spawnDef.x*gridSize, spawnDef.y*gridSize);
    }

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
  spawnMob: function(unit, xCoord, yCoord){
    var mob;
    if(unit.type=="truck"){
      mob = this.mobs.create(xCoord, yCoord, 'truck');
      this.game.physics.arcade.enable(mob);
      mob.mobType = "truck";
    } else if(unit.type=="carrier"){
      mob = this.mobs.create(xCoord, yCoord, 'carrier');
      this.game.physics.arcade.enable(mob);
      mob.mobType = "carrier";
      mob.waypoints = unit.waypoints;
      mob.nextWaypoint = { 
        index: 0,
        x: mob.waypoints[0].x*gridSize,
        y: mob.waypoints[0].y*gridSize
      };
      if(mob.nextWaypoint.x < mob.body.x){
        mob.nextWaypoint.directionX = -1;
      } else if(mob.nextWaypoint.x > mob.body.x) {
        mob.nextWaypoint.directionX = 1;
      } else {
        mob.nextWaypoint.directionX = 0;
      }
      if(mob.nextWaypoint.y < mob.body.y){
        mob.nextWaypoint.directionY = -1;
      } else if(mob.nextWaypoint.y > mob.body.y) {
        mob.nextWaypoint.directionY = 1;
      } else {
        mob.nextWaypoint.directionY = 0;
      }
      mob.body.velocity.x = mob.nextWaypoint.directionX * this.carrierSpeed;
      mob.body.velocity.y = mob.nextWaypoint.directionY * this.carrierSpeed;
    }
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
  updateCarrier: function(mob){
    reachedX = mob.nextWaypoint.directionX == 0 || (mob.nextWaypoint.directionX < 0 && mob.body.x < mob.nextWaypoint.x)
    reachedX = reachedX || (mob.nextWaypoint.directionX > 0 && mob.body.x > mob.nextWaypoint.x)

    reachedY = mob.nextWaypoint.directionY == 0 || (mob.nextWaypoint.directionY < 0 && mob.body.y < mob.nextWaypoint.y)
    reachedY = reachedY || (mob.nextWaypoint.directionY > 0 && mob.body.y > mob.nextWaypoint.y)

    // Don't go past our target point
    if(reachedX){
      mob.body.x = mob.nextWaypoint.x;
    }
    if(reachedY){
      mob.body.y = mob.nextWaypoint.y;
    }
    
    // Move, unless we've reached our target, in which case set next target
    if(reachedX && reachedY){
      this.setNextWaypoint(mob);
    } else {
      if(!reachedX){
        mob.body.velocity.x = mob.nextWaypoint.directionX * this.carrierSpeed;
      }
      if(!reachedY){
        mob.body.velocity.y = mob.nextWaypoint.directionY * this.carrierSpeed;
      }
    }
    if(this.debug){
      this.debugText.text += "CARRIER: [pos:"+Math.floor(mob.body.x)+"/"+Math.floor(mob.body.y)+"][target:"+mob.nextWaypoint.x+"/"+mob.nextWaypoint.y+"]"+
        "[looking:"+mob.nextWaypoint.directionX+"/"+mob.nextWaypoint.directionY+"][moving:"+mob.body.velocity.x+"/"+mob.body.velocity.y+"]"+
        "[reached:"+reachedX+"/"+reachedY+"]\n";
    }
  },
  setNextWaypoint: function(mob){
    mob.nextWaypoint.index += 1;
    if(mob.nextWaypoint.index >= mob.waypoints.length){
      mob.nextWaypoint.index = 0;
    }
    mob.nextWaypoint.x = mob.waypoints[mob.nextWaypoint.index].x*gridSize;
    mob.nextWaypoint.y = mob.waypoints[mob.nextWaypoint.index].y*gridSize;
    if(mob.nextWaypoint.x < mob.body.x){
      mob.nextWaypoint.directionX = -1;
    } else if(mob.nextWaypoint.x > mob.body.x) {
      mob.nextWaypoint.directionX = 1;
    } else {
      mob.nextWaypoint.directionX = 0;
    }
    if(mob.nextWaypoint.y < mob.body.y){
      mob.nextWaypoint.directionY = -1;
    } else if(mob.nextWaypoint.y > mob.body.y) {
      mob.nextWaypoint.directionY = 1;
    } else {
      mob.nextWaypoint.directionY = 0;
    }
    mob.body.velocity.x = mob.nextWaypoint.directionX * this.carrierSpeed;
    mob.body.velocity.y = mob.nextWaypoint.directionY * this.carrierSpeed;
  },
  updateTruck: function(truck){
    truck.body.velocity.x = 1*gridSize*truck.facing;

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
