var canvas = document.getElementById("sim");
var ctx = canvas.getContext('2d');

var BOXES = [
	0,0,0,0,
	0,0,0//,0
];
var ANIM_CARDS = BOXES.concat(); // clone
var ANIM_BOXES = BOXES.concat(); // clone
var ANIM_EASE = 0.8;

var COLORS = [
	"#ee4035", // red
	"#f37736", // orange
	"#ffdb13", // yellow
	"#7bc043", // green
	"#0392cf", // blue
	"#673888", // indigo-ish
	"#ef4f91", // violet-ish
	"#e0e0e0"  // white. VALHALLA.
];

var DAY = 1;
var CALENDAR = [
	[2,1],	[3,1],	[2,1],	[4,1], [2,1],	[3,1],	[2,1],	[1], 
	[2,1],	[3,1],	[2,1],	[5,1], [4,2,1],	[3,1],	[2,1],	[1], 
	[2,1],	[3,1],	[2,1],	[4,1], [2,1],	[3,1],	[2,1],	[6,1], 
	[2,1],	[3,1],	[2,1],	[5,1], [4,2,1],	[3,1],	[2,1],	[1],
	[2,1],	[3,1],	[2,1],	[4,1], [2,1],	[3,1],	[2,1],	[1], 
	[2,1],	[3,1],	[2,1],	[5,1], [4,2,1],	[3,1],	[2,1],	[1],
	[2,1],	[3,1],	[2,1],	[4,1], [2,1],	[3,1],	[2,1],	[7,1], 
	[2,1],	[3,1],	[6,2,1],[5,1], [4,2,1],	[3,1],	[2,1],	[1], 
];
/*
var CALENDAR = [
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[5,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[6,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[5,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[7,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[5,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[6,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[5,1],
	[2,1],	[3,1],	[2,1],	[4,1],	[2,1],	[3,1],	[2,1],	[1],
];*/

var daySlider = $("#day");
daySlider.oninput = function(){

	window.REDRAW = 30;
	DAY = daySlider.value;

	// Labels
	var html = "<b>" + _getLabel("calendar_day").replace("[N]", DAY) + "</b>";
	if(DAY==64) html += _getLabel("calendar_loop");
	$("#label_day").innerHTML = html;
	var QUEUE = CALENDAR[DAY-1]; // -1 offset
	$("#label_review").innerHTML = _getLabel("calendar_review").replace("[N]", QUEUE.toString() );

	// KILL SLIDEY
	if(window.slidey) window.slidey.kill();

}

// Slider has SOUNDS
daySlider.onmousedown = daySlider.ontouchstart = function(){
	playSound("slider_down");
};
daySlider.onmouseup = daySlider.ontouchend = function(){
	playSound("slider_up");
};

window.REDRAW = 0;
function update(){

	// Don't re-draw unnecessarily!
	if(window.REDRAW>0){

		window.REDRAW -= 1;

		// Clear & Retina
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.save();
		ctx.scale(2,2);

		//////////////////////////////////////////
		// DRAW SCHEDULE /////////////////////////
		//////////////////////////////////////////

		var x = 0;
		ctx.save();
		for(var i=0;i<CALENDAR.length;i++){
			x += 500/(CALENDAR.length+1);
			var levels = CALENDAR[i];
			var y = 0;
			var r = (DAY==i+1) ? 6 : 4;
			for(var j=0; j<levels.length; j++){
				var levelNum = levels[j];
				var color = COLORS[levelNum-1];
				y = (8-levelNum)*12;
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(x,y,r,0,Math.TAU,false);
				ctx.fill();
			}
		}
		ctx.restore();


		//////////////////////////////////////////
		// DRAW BOXES ////////////////////////////
		//////////////////////////////////////////

		// Draw boxes, 1 to 7
		for(var i=0;i<BOXES.length;i++){
			
			var w = 69;
			var h = 69;

			// Am I being reviewed today?
			var levels = CALENDAR[DAY-1]; // -1 offset
			var activeToday = (levels.indexOf(i+1)>=0); // +1 coz offset

			// Transform...
			ctx.save();
			ctx.translate(i*(w+2.5), canvas.height/2-h);

			// Bounce! ANIMATED!
			var elevation = activeToday ? 10 : 0;
			ANIM_BOXES[i] = ANIM_BOXES[i]*ANIM_EASE + elevation*(1-ANIM_EASE);
			ctx.translate(0, -ANIM_BOXES[i]);

			// Fill
			var color = COLORS[i];
			ctx.fillStyle = activeToday ? color : "#fff";
			ctx.fillRect(0, 0, w, h);

			// Stroke
			if(!activeToday){
				ctx.strokeStyle = color;
				var lw = 2;
				ctx.lineWidth = lw;
				ctx.beginPath();
				ctx.rect(lw/2, lw/2, w-lw, h-lw);
				ctx.stroke();
			}

			// Number
			ctx.font = "50px PatrickHand";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = activeToday ? "#fff": color;
			ctx.fillText((i+1), w/2, h/2);

			ctx.restore();

		}

		// And, again...
		ctx.restore();

	}

	requestAnimationFrame(update);

}

window.onload = function(){

	daySlider.oninput();
	update();

	window.slidey = new createAnimatedUIHelper({
		x: 8,
		y: 95,
		width: 100,
		height: 100,
		img: "../../pics/ui_slide.png"
	});

};
