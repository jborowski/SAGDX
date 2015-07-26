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

    this.game.load.tilemap('introForegroundLayerMap', 'data/intro/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('introBackgroundLayerMap', 'data/intro/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('introCollisionLayerMap', 'data/intro/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.tilemap('level1ForegroundLayerMap', 'data/level1/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level1BackgroundLayerMap', 'data/level1/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level1CollisionLayerMap', 'data/level1/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.tilemap('level2ForegroundLayerMap', 'data/level2/foregroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level2BackgroundLayerMap', 'data/level2/backgroundLayer.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('level2CollisionLayerMap', 'data/level2/collisionLayer.json', null, Phaser.Tilemap.TILED_JSON);

    this.game.load.image('tileset', 'assets/levels/act1/tileset.png');
		this.game.load.image('dialogbox', 'assets/dialogBox.png');
		this.game.load.image('title', 'assets/title.png');
		this.game.load.image('pausetext', 'assets/paused.png');

    this.game.load.text('introSpawns', 'data/intro/spawns.json');
    this.game.load.text('introEvents', 'data/intro/events.json');

    this.game.load.text('level1Spawns', 'data/level1/spawns.json');
    this.game.load.text('level1Events', 'data/level1/events.json');

    this.game.load.text('level2Spawns', 'data/level2/spawns.json');
    this.game.load.text('level2Events', 'data/level2/events.json');

    this.game.load.spritesheet('player', 'assets/player/spritesheet.png', 64, 80);
    this.game.load.spritesheet('truck', 'assets/truck.png', 64, 48);
    this.game.load.spritesheet('carrier', 'assets/carrier.png', 77, 32);
    this.game.load.spritesheet('floater', 'assets/floater.png', 32, 32);
    this.game.load.spritesheet('lift', 'assets/lift.png', 64, 16);
    this.game.load.spritesheet('turret', 'assets/turret.png', 52, 74);
    this.game.load.image('flag', 'assets/flag.png');
    this.game.load.spritesheet('bigblast', 'assets/bigblast.png', 80, 80);
    this.game.load.spritesheet('littleblast', 'assets/littleblast.png', 80, 80);

    this.game.load.audio('music', 'assets/music/Alan_Singley_-_Taking_Dark_Matter_Lightly.mp3')

    this.game.load.spritesheet('parabackground1', 'assets/levels/act1/background1.png', 768, 512);

    this.game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');

	},

	create: function () {
		this.preloadBar.cropEnabled = false;
	},

	update: function () {
		if (this.cache.isSoundDecoded('music') && this.ready == false) {
			this.ready = true;
			this.state.start('Level1');
		}
	}
};