window.onload = function(){

  var game = new Phaser.Game(width, height, Phaser.CANVAS, document.getElementById("main"));

  WebFontConfig = {
    google: {
      families: ['Lato']
    }
  };

  var music = null;
  var ambience;
  var sfx;

  game.state.add('Boot', SAGDX.Boot);
  game.state.add('Preloader', SAGDX.Preloader)
  game.state.add('Intro', SAGDX.introState);
  game.state.add('Intro2', SAGDX.intro2State);
  game.state.add('Level1', SAGDX.level1State);
  game.state.add('Level2', SAGDX.level2State);
  game.state.add('Level3', SAGDX.level3State);
  game.state.add('Level4', SAGDX.level4State);
  game.state.add('Ending1', SAGDX.ending1State);
  game.state.add('Ending2', SAGDX.ending2State);
  game.state.add('Ending3', SAGDX.ending3State);
  game.state.add('Credits', SAGDX.Credits);
  game.state.start('Boot');
}
