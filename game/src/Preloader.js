SAGDX.Preloader = function (game) {
  this.loadBackground = null;
  this.preloadBar = null;
  this.SAlogo = null;
  this.loadingText = null;
  this.ready = false;
};

SAGDX.Preloader.prototype = {

  preload: function () {
    this.preloadBar = this.add.sprite(209, 356, 'loadBar');
    this.SAlogo = this.add.sprite(384, 156, 'SAGDlogo');
    this.SAlogo.anchor.setTo(0.5, 0.5);
    // this.loadingText = this.add.text(240, 450, 'now loading');

    this.load.setPreloadSprite(this.preloadBar);

    this.game.load.tilemap('introForegroundLayerMap', 'data/levels/Intro/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('introBackgroundLayerMap', 'data/levels/Intro/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('introCollisionLayerMap', 'data/levels/Intro/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.tilemap('level1ForegroundLayerMap', 'data/levels/Act-1/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level1BackgroundLayerMap', 'data/levels/Act-1/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level1CollisionLayerMap', 'data/levels/Act-1/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.tilemap('level2ForegroundLayerMap', 'data/levels/Act-2/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level2BackgroundLayerMap', 'data/levels/Act-2/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level2CollisionLayerMap', 'data/levels/Act-2/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.tilemap('level3ForegroundLayerMap', 'data/levels/Act-3/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level3BackgroundLayerMap', 'data/levels/Act-3/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level3CollisionLayerMap', 'data/levels/Act-3/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.tilemap('level4ForegroundLayerMap', 'data/levels/Act-4/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level4BackgroundLayerMap', 'data/levels/Act-4/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level4CollisionLayerMap', 'data/levels/Act-4/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.image('tileset', 'assets/tileset.png');
    this.game.load.image('factoryDialogBox', 'assets/factoryDialogBox.png');
    this.game.load.image('unknownDialogBox', 'assets/unknownDialogBox.png');
    this.game.load.image('instructionbox', 'assets/instructionBox.png');
    this.game.load.spritesheet('factoryFace', 'assets/factoryFace.png', 80, 60);
    this.game.load.spritesheet('unknownFace', 'assets/unknownFace.png', 80, 60);

    this.game.load.image('title', 'assets/title.png');
    this.game.load.image('pausetext', 'assets/paused.png');

    this.game.load.text('level1Spawns', 'data/levels/Act-1/spawns.json');
    this.game.load.text('level1Events', 'data/levels/Act-1/events.json');

    this.game.load.text('level2Spawns', 'data/levels/Act-2/spawns.json');
    this.game.load.text('level2Events', 'data/levels/Act-2/events.json');

    this.game.load.text('level3Spawns', 'data/levels/Act-3/spawns.json');
    this.game.load.text('level3Events', 'data/levels/Act-3/events.json');

    this.game.load.text('level4Spawns', 'data/levels/Act-4/spawns.json');
    this.game.load.text('level4Events', 'data/levels/Act-4/events.json');

    this.game.load.spritesheet('player', 'assets/player/spritesheet.png', 64, 80);
    this.game.load.spritesheet('suicide', 'assets/player/suicide_sheet.png', 147, 136)
    this.game.load.spritesheet('truck', 'assets/truck.png', 64, 48);
    this.game.load.spritesheet('carrier', 'assets/carrier.png', 77, 37);
    this.game.load.spritesheet('floater', 'assets/floater.png', 52, 59);
    this.game.load.spritesheet('lift', 'assets/lift.png', 64, 12);
    this.game.load.spritesheet('turret', 'assets/turret.png', 52, 74);
    this.game.load.spritesheet('bigblast', 'assets/bigblast.png', 120, 70);
    this.game.load.spritesheet('littleblast', 'assets/littleblast.png', 92, 34);
    this.game.load.spritesheet('floorbutton', 'assets/floorbutton.png', 60, 5);
    this.game.load.spritesheet('door', 'assets/door_opening_spritesheet.png', 196, 280)

    this.game.load.spritesheet('parabackground1', 'assets/levels/act1/background1.png', 768, 512);
    this.game.load.spritesheet('parabackground1p', 'assets/levels/act1/background1paused.png', 768, 512);
    this.game.load.spritesheet('parabackground3', 'assets/levels/act1/background3.png', 768, 512);
    this.game.load.spritesheet('parabackground3p', 'assets/levels/act1/background3paused.png', 768, 512);
    this.game.load.image('parabackgroundSky', 'assets/levels/act4/sky.jpg', 768, 512);
    this.game.load.image('parabackgroundSkyp', 'assets/levels/act4/skypause.jpg', 768, 512);

    this.game.load.image('overlay', 'assets/overlay.png', 100, 512);

    this.game.load.audio('music', ['assets/music/Alan_Singley_-_Taking_Dark_Matter_Lightly.mp3']);
    this.game.load.audio('ambience', ['assets/sfx/ambience_loop.ogg'])
    this.game.load.audio('sfx', ['assets/sfx/sfx.ogg']);

    music = this.game.add.audio('music');
    ambience = this.game.add.audio('ambience');
    sfx = this.game.add.audio('sfx');
    sfx.addMarker('land', 4, 0.5, 1, false);
    sfx.addMarker('suicide', 6.5, 0.5, 1, false);

    // Bonus content!
    this.game.load.spritesheet('tinroof', 'assets/tinroof.png', 154, 112);
    this.game.load.spritesheet('interstellaria', 'assets/interstellaria.png', 154, 112);
    this.game.load.spritesheet('showerwithdad', 'assets/showerwithdad.png', 154, 112);

    this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  },

  create: function () {
    this.preloadBar.cropEnabled = false;
  },

  update: function () {
    if (this.cache.isSoundDecoded('music') && this.ready == false) {
      this.ready = true;
      //this.state.start('Intro');
      this.state.start('Level1');
    }
  }
};
