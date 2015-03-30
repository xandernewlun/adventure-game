// http://paulirish.com/2011/requestanimationframe-for-smart-animating
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var Player = {
	x: 5,
	y: 5,

	sect_x:0,
	sect_y:0,
	isMoving: true,
	currentFrame: 1,
	currentDirection: 'r',
	speed: 1,
	isLeft: false,
	
	images: null,
	init: function(){
		Player.images = {
			pr0: GAME.loadImage('res/pr0.png', 2),
			pr1: GAME.loadImage('res/pr1.png', 2),
			pr2: GAME.loadImage('res/pr2.png', 2),
			pl0: GAME.loadImage('res/pl0.png', 2),
			pl1: GAME.loadImage('res/pl1.png', 2),
			pl2: GAME.loadImage('res/pl2.png', 2)
		};

		Player.move();

		return Player;
	},
	getCurrentAnimationFrame: function(){
		//Added double quote to ensure string concatenation, not addition as an integer
		return "p" + Player.currentDirection + "" + Player.currentFrame;
	},
	move: function(){
		Player.isMoving = false;

		var newX = Player.x;
		var newY = Player.y;
		var newSectX = Player.sect_x;
		var newSectY = Player.sect_y;

		if(GAME.keys[GAME.KeyCode.right_arrow]){
			newX += Player.speed;
			Player.currentDirection = 'r';
		}else if(GAME.keys[GAME.KeyCode.left_arrow]){
			newX -= Player.speed;
			Player.currentDirection = 'l';
		}

		if(GAME.keys[GAME.KeyCode.up_arrow]){
			newY -= Player.speed;
			//Player.currentDirection = 'u';
		}else if(GAME.keys[GAME.KeyCode.down_arrow]){
			newY += Player.speed;
			//Player.currentDirection = 'd';
		}

		if(newX != Player.x || newY != Player.y)
			Player.isMoving = true;

		// We are assuming all maps are square, same size
		var mapSize = MAP.map[Player.sect_y][Player.sect_x].length - 1;
		if(newX > mapSize){
			newX = 0;
			newSectX++;
		}else if(newX < 0){
			newX = mapSize;
			newSectX--;
		}
		if(newY > mapSize){
			newY = 0;
			newSectY++;
		}else if(newY < 0){
			newY = mapSize;
			newSectY--;
		}

		if(MAP.isOpenSpot(newSectX, newSectY, newX, newY)){
			Player.x = newX;
			Player.y = newY;
			Player.sect_x = newSectX;
			Player.sect_y = newSectY;
		}
		//Animate Sprite
		if(Player.isMoving)
			Player.currentFrame = (Player.currentFrame + 1) % 3;

		setTimeout(Player.move, 100);
	},
	render: function(draw){
		draw.img(
			Player.images[Player.getCurrentAnimationFrame()],
			Player.x,
			Player.y,
			1, 1
		);
	}
};

var GAME = {
	canvas: null,
	ctx: null,
	width: 500,
	height: 500,

	player: null,
	keys: [],

	init: function(){
		GAME.canvas = document.getElementById('canvas');
		GAME.canvas.width = GAME.width;
		GAME.canvas.height = GAME.height;
		GAME.ctx = GAME.canvas.getContext('2d');
		GAME.ctx.scale(25, 25);
		GAME.ctx.mozImageSmoothingEnabled = false;
		GAME.ctx.msImageSmoothingEnabled = false;

		GAME.bindInput();

		GAME.player = Player.init();
		GAME.loop();
	},
	bindInput: function(){
		document.addEventListener('keydown', function(e){
			GAME.keys[e.keyCode] = true;
		}, false);
		document.addEventListener('keyup', function(e){
			GAME.keys[e.keyCode] = false;
		}, false);
	},
	loop: function(){
		window.requestAnimFrame(GAME.loop);

		GAME.update();
		GAME.render();
	},
	update: function(){
		MAP.update();
	},
	loadImage: function(src, scale){
		image = new Image();
		image.src = src;

		return image;
	},
	render: function(){
		GAME.Draw.clear();
		//Render current map
		MAP.render(GAME.Draw, GAME.player.sect_x, GAME.player.sect_y);
		//Render player
		GAME.player.render(GAME.Draw);
	}
};

GAME.Draw = {
	clear: function(){
		GAME.Draw.rect(0, 0, GAME.width, GAME.height, 'white');
	},
	rect: function(x, y, width, height, color){
		GAME.ctx.fillStyle = color;
		GAME.ctx.fillRect(x, y, width, height);
	},
	img: function(image, x, y, width, height){
		GAME.ctx.drawImage(image, x, y, width, height);
	},
	flippedImg: function(image, x, y, width, height){
		GAME.ctx.save();
		GAME.ctx.scale(-25, 25);
		GAME.ctx.drawImage(image, y * -1, x, 1, 1);
		GAME.ctx.restore();
	}
};

GAME.KeyCode = {
	left_arrow: 37,
	right_arrow: 39,
	up_arrow: 38,
	down_arrow: 40
};

window.addEventListener('load', GAME.init, false);