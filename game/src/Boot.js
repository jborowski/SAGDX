var SAGDX = {};

SAGDX.Boot = function (game) {};

SAGDX.Boot.prototype = {
  preload: function () {
    //  Here we load the assets required for our preloader (in this case a background and a loading bar)
    this.load.image('loadBar', 'assets/loadBar.png', 350, 50);
    this.load.image('SAGDlogo', 'assets/SA.png', 135, 135);
  },

  create: function () {
    this.input.maxPointers = 1;
    this.stage.disableVisibilityChange = true;
    if (this.game.device.desktop) {
      this.scale.pageAlignHorizontally = true;
    } else {
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.minWidth = 384;
      this.scale.minHeight = 256;
      this.scale.maxWidth = 768;
      this.scale.maxHeight = 512;
      this.scale.forceLandscape = true;
      this.scale.pageAlignHorizontally = true;
      this.scale.setScreenSize(true);
    }
    this.state.start('Preloader');
  }
};
