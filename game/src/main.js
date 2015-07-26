window.onload = function(){

  var game = new Phaser.Game(width, height, Phaser.CANVAS, document.getElementById("main"));

  WebFontConfig = {
    google: {
      families: ['Lato']
    }
  };
  game.state.add('Boot', SAGDX.Boot);
  game.state.add('Preloader', SAGDX.Preloader)
  game.state.add('Intro', SAGDX.introState);
  game.state.add('Level1', SAGDX.level1State);
  game.state.add('Level2', SAGDX.level2State);
  game.state.add('Credits', SAGDX.Credits);
  game.state.start('Boot');
}
