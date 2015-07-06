var gridSize = 16;
var game = new Phaser.Game(gridSize*48, gridSize*32, Phaser.AUTO, 'SAGDCX', { preload: preload, create: create, update: update }, false, false);
var cursors, ground, player;
var jumpSpeed = 15;
var playerSpeed = 15;
var jumpFinished = true;
var jumpTimer;

function preload() {
  game.load.image('groundTileTop', 'assets/groundTile.png');
  game.load.image('groundTile', 'assets/groundTile1.png');
  game.load.image('player', 'assets/player1.png')
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.stage.backgroundColor = 808080;

  ground = game.add.group();
  ground.enableBody = true;

  levelData = levels.level1;
  generateGeometry(game.world, levelData, ground);

  ground.setAll('body.immovable', true);

  var playerStartX = gridSize*levelData.playerStartingPosition[0];
  var playerStartY = game.world.height-4*gridSize-gridSize*levelData.playerStartingPosition[1];

  player = game.add.sprite(playerStartX, playerStartY, 'player');
  game.physics.arcade.enable(player);
  player.body.gravity.y = 0;
  player.body.collideWorldBounds = true;
  game.camera.follow(player);
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  game.physics.arcade.collide(player,ground);
  updatePlayer(player);
}

function updatePlayer(player){
  player.body.velocity.x *= 0.5;

  if (player.body.touching.down && cursors.up.isDown && jumpFinished == true) {
    jumpTimer = game.time.now;
    player.body.velocity.y = gridSize*-jumpSpeed;
    jumpFinished = false;
  }

  if (cursors.left.isDown){
    player.body.velocity.x = gridSize*-playerSpeed;
  }
  else if (cursors.right.isDown) {
    player.body.velocity.x = gridSize*playerSpeed;
  }

  if (!player.body.touching.down)
    player.body.velocity.y += gridSize*1.2;

  if (cursors.up.isDown && !player.body.touching.down && game.time.now - jumpTimer < 200)
    player.body.velocity.y = gridSize*-jumpSpeed;

  if (player.body.velocity.y > gridSize*15)
    player.body.velocity.y = gridSize*15;

  if (player.body.touching.down && cursors.up.isUp)
    jumpFinished = true;
}

function generateGeometry(world, mapData, ground){
  world.setBounds(0, 0, gridSize*mapData.levelSize[0], gridSize*mapData.levelSize[1]);
  // find out number of floor rectangles
  for(var floorPart in mapData.geometry){
    if(mapData.geometry.hasOwnProperty(floorPart)){
      var partSizeX = mapData.geometry[floorPart].partSize[0];
      var partSizeY = mapData.geometry[floorPart].partSize[1];
      var partPositionX = mapData.geometry[floorPart].position[0];
      var partPositionY = mapData.geometry[floorPart].position[1];
      for(var i = 0; i <= partSizeX; i++)
        tile = ground.create(partPositionX*gridSize+i*gridSize,
                             world.height-gridSize*partPositionY-gridSize*partSizeY,
                             'groundTileTop');
      var nextLine = partSizeY - 1;
      for(var i = nextLine; i > 0; i--){
        for(var j = 0; j <= partSizeX; j++)
          tile = ground.create(partPositionX*gridSize+j*gridSize, 
                               world.height-gridSize*partPositionY-(gridSize*i), 
                               'groundTile');
      }
    }
  }
}