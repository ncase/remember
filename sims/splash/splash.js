var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth*2;
canvas.height = window.innerHeight*2;
canvas.style.width = window.innerWidth+"px";
canvas.style.height = window.innerHeight+"px";

document.body.appendChild(canvas);

var cardImage = new Image();
cardImage.src = "card.png";

/////////////////////////////////////////

// Make a whole bunch of cards. Randomly place 'em
var cards = [];
var PADDING = 50;
var RADIUS = 60;
var R2 = RADIUS*RADIUS;
var N = (window.innerWidth*window.innerHeight)/4000;
for(var i=0; i<N; i++){
	
	// Find position that's not too close to others
	var x,y;
	for(var j=0; j<1000; j++){
		x = (Math.random()*(window.innerWidth+PADDING*2))-PADDING;
		y = (Math.random()*(window.innerHeight+PADDING*2))-PADDING;
		if(!_tooClose(x,y)){
			break;
		}
	}

	// Place new card
	var c = new Card(x,y);
	cards.push(c);

}
var FALL_SPEED = 0.5;
function Card(x,y){

	var self = this;
	
	self.x = x;
	self.y = y;
	self.velX = 0;
	self.velY = 0;
	self.rotation = (Math.random()-0.5)*0.4;

	self.update = function(){

		// MOUSE
		if(Mouse.velX!==undefined){
			
			var speed = 0.05;
			if(Mouse.pressed) speed*=4;

			var dx = Mouse.x-self.x;
			var dy = Mouse.y-self.y;
			var d = Math.sqrt(dx*dx+dy*dy);
			var r = 100;
			var relativeSpeed = Math.max( (r-d)/r, 0 );
			speed *= relativeSpeed;

			self.velX += Mouse.velX*speed;
			self.velY += Mouse.velY*speed;
		}
	
		// VELOCITY
		self.x += self.velX;
		self.y += self.velY;
		self.velX *= 0.9;
		self.velY *= 0.9;

		// FALL
		self.y += FALL_SPEED;

		// LOOP
		if(self.y>window.innerHeight+PADDING){
			
			var x,y;
			for(var j=0; j<100; j++){
				x = (Math.random()*(window.innerWidth+PADDING*2))-PADDING;
				y = -PADDING;
				if(!_tooClose(x,y)){
					break;
				}
			}

			self.x = x;
			self.y = y;

		}
		//if(Mouse.x/2<self.x) self.x++;

	};

	var w = 60;
	var h = w*(240/400);
	self.draw = function(ctx){
		
		ctx.save();

		ctx.translate(self.x, self.y);
		ctx.rotate(self.rotation);

		//ctx.fillStyle = "rgba(255,255,255,0.15)";
		ctx.drawImage(cardImage, -w/2, -h/2, w, h);

		ctx.restore();

	};

}
function _tooClose(x1,y1){
	for(var i=0; i<cards.length; i++){
		
		var c = cards[i];
		var x2 = c.x;
		var y2 = c.y;

		var dx = x1-x2;
		var dy = y1-y2;
		var d2 = dx*dx+dy*dy;

		if(d2<R2){
			return true;
		}

	}
	return false;
}

/////////////////////////////////////////

window.IS_IN_SIGHT = false;
function update(){

	if(window.IS_IN_SIGHT){

		// UPDATE

		Mouse.update();

		cards.forEach(function(card){
			card.update(ctx);
		});

		// DRAW

		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.save();
		ctx.scale(2,2);

		cards.forEach(function(card){
			card.draw(ctx);
		});

		ctx.restore();

	}

	requestAnimationFrame(update);

}

requestAnimationFrame(update);