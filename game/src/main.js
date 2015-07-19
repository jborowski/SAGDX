window.onload = function(){
  var game = new Phaser.Game(width, height, Phaser.CANVAS, document.getElementById("main"));
  game.state.add('Act1', SAGDX.act1State);
  game.state.add('Act2', SAGDX.act2State);
  game.state.start('Act1');
}
