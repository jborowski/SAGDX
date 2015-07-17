window.onload = function(){
  introState.debug=false;
  var game = new Phaser.Game(width, height, Phaser.CANVAS, document.getElementById("main"), introState, false, false);
}

