var gridSize = 16;
var game = new Phaser.Game(gridSize*48, gridSize*32, Phaser.AUTO, 'SAGDCX', { preload: preload, create: create, update: update }, false, false);
var cursors, ground, player;
var jumpSpeed = 15;
var playerSpeed = 15;
var jumpFinished = true;
var jumpTimer;

function preload() {
  game.load.tilemap('map', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles', 'assets/level_tileset.png');
  game.load.image('player', 'assets/player1.png');
}

function create() {

  map = game.add.tilemap('map');

  map.addTilesetImage('tiles');
  
  layer = map.createLayer('Tile Layer 1');

  layer.resizeWorld();

  map.setCollisionByExclusion([1], true, layer);

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.stage.backgroundColor = 808080;


  player = game.add.sprite(0, 20, 'player');
  game.physics.arcade.enable(player);
  player.body.gravity.y = 0;
  player.body.collideWorldBounds = true;
  game.camera.follow(player);
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  game.physics.arcade.collide(player, layer);
  updatePlayer(player);
}

function updatePlayer(player){
  player.body.velocity.x *= 0.5;

  if (player.body.onFloor() && cursors.up.isDown && jumpFinished == true) {
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

  if (!player.body.onFloor())
    player.body.velocity.y += gridSize*1.2;

  if (cursors.up.isDown && !player.body.onFloor() && game.time.now - jumpTimer < 200)
    player.body.velocity.y = gridSize*-jumpSpeed;

  if (player.body.velocity.y > gridSize*15)
    player.body.velocity.y = gridSize*15;

  if (player.body.onFloor() && cursors.up.isUp)
    jumpFinished = true;
}