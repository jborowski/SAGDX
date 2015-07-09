window.onload = function(){
  introState.debug=true;
  new Phaser.Game(width, height, Phaser.AUTO, document.getElementById("main"), introState, false, false);
}

