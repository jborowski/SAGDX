var introState = {
  jumpSpeed: 15,
  playerSpeed: 15,
  jumpFinished: true,
  jumpTimer: 0,
  debug:false,
  preload: function(){
    this.game.load.tilemap('map', 'data/tiles_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('bg_map', 'data/bg_tiles_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('collision_map', 'data/collision_tiles_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', 'assets/level_tileset.png');
    this.game.load.image('bg_tiles', 'assets/bg_tileset.png');
    this.game.load.image('collision_tiles', 'assets/collision_tileset.png');
    this.game.load.image('player', 'assets/player1.png');
  },
  create: function(){
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.map = this.game.add.tilemap('map');
    this.layer = this.map.createLayer('tiles_layer');
    this.map.addTilesetImage('tiles');
    this.layer.resizeWorld();

    this.bgMap = this.game.add.tilemap('bg_map');
    this.bgMap.addTilesetImage('bg_tiles');
    this.bgMap.createLayer('bg_tiles_layer');

    this.collisionMap = this.game.add.tilemap('collision_map');
    this.collisionLayer = this.collisionMap.createLayer('collision_tiles_layer');
    this.collisionMap.addTilesetImage('collision_tiles');
    this.collisionMap.setCollision(1, true, this.collisionLayer);
    this.collisionLayer.visible = false;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.stage.backgroundColor = 808080;

    this.player = this.game.add.sprite(60, 200, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 0;
    this.player.body.collideWorldBounds = true;
    this.game.camera.follow(this.player);
    if(this.debug){
      this.debugText = this.game.add.text(5, 5, 'DEBUG INFO ', { fontSize: '8px', fill: '#000' });
    }
  },
  update: function(){
    this.game.physics.arcade.collide(this.player, this.collisionLayer);
    this.updatePlayer();

    if(this.debug){
      this.debugText.text = "DEBUG INFO - Player Info: [X:"+this.player.x+"] [Y:"+this.player.y+"]\n"+
          "[JUMPTIMER:"+this.jumpTimer+"] [JUMPFINISHED:"+this.jumpFinished+"]";
    }
  },
  updatePlayer: function(){
    this.player.body.velocity.x = 0;

    if (this.player.body.onFloor() && this.cursors.up.isDown && this.jumpFinished == true) {
      this.player.body.velocity.y = gridSize*-this.jumpSpeed;
      this.jumpFinished = false;
      this.jumpTimer = 0;
    }

    if (this.cursors.left.isDown){
      this.player.body.velocity.x = gridSize*-this.playerSpeed;
    }
    else if (this.cursors.right.isDown){
      this.player.body.velocity.x = gridSize*this.playerSpeed;
    }

    if (!this.player.body.onFloor()){
      this.player.body.velocity.y += gridSize*1.2;
      this.jumpTimer += this.game.time.physicsElapsed;
    }

    if (this.cursors.up.isDown && !this.player.body.onFloor() && this.jumpTimer < 0.2){
      this.player.body.velocity.y += gridSize*-1.3;
    }

    if (this.player.body.velocity.y > gridSize*15){
      this.player.body.velocity.y = gridSize*15;
    }

    if (this.player.body.blocked.down && this.cursors.up.isUp){
      this.jumpFinished = true;
      this.player.body.velocity.y = 0;
    }
  }
}
