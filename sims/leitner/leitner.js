/*******************************

// Step 1: a bunch of numbered, colored boxes (array) @done
// Step 2: a calendar @done
// Step 3: "cards" go up/down on STEP/day @done
// Step 4: ...with 5% failing @done

Next steps:
- Per DAY, now. @done
- labels for steps @done
- labels for day @done

Animation
- cards number @done
- box bounce @done
- multiple times... @done
- arrows for movement of cards
- + for adding cards

// Arrowheads @done
// TOTAL CARDS say...

CALCULATOR... nah.

********************************/

window.onload = function(){
	
	BOXES[0] += NEW_CARDS;
	_newStep();
	update();

	// Get Mode
	window.MODE = parseInt( _getQueryVariable("mode") );
	if(MODE==2){
		$("#MODE2_time").style.display = "inline-block";
		//$("#MODE2_sliders").style.display = "block";
	}

	// POINTY
	_addPointy(MODE==2);

};

//////////////////////////////////////////
//////////////////////////////////////////

/***************

Each day...

a. Review levels from top to bottom
   (if succeed, next level)
   (if fail, back to Level 1)
b. All cards in Level 1 go to Level 2
c. Add new cards to Level 1

****************/

var NEW_CARDS = 10;
var CARDS_WRONG = 0.05;
var _STAGE = 0;
// 0 - new day
// 1 - reviewing
// 2 - adding

// Button Labels
$("#next_step").innerHTML = _getLabel("leitner_button_next_step");
$("#next_day").innerHTML = _getLabel("leitner_button_next_day");
$("#next_week").innerHTML = _getLabel("leitner_button_next_week");
$("#next_month").innerHTML = _getLabel("leitner_button_next_month");
$("#reset").innerHTML = _getLabel("leitner_reset");

// RESET ALL
$("#reset").onclick = function(){

	BOXES = [
		0,0,0,0,
		0,0,0,0,
	];
	DAY = 0;
	//ANIM_CARDS = BOXES.concat(); // clone
	//ANIM_BOXES = BOXES.concat(); // clone
	CURRENTLY_REVIEWED = -1;
	QUEUE = [];

	BOXES[0] += NEW_CARDS;
	_STAGE = 0;
	_newStep();
	//update();

	//_killPointy();
	if(window.pointy) window.pointy.kill();
	playSound("reset");

};

// UI Sliders

var slider_new = $("#slider_new");
slider_new.oninput = function(){
	NEW_CARDS = parseInt(slider_new.value);
	$("#slider_new_label").innerHTML = _getLabel("leitner_slider_new").replace("[N]",NEW_CARDS);
};
slider_new.oninput();

var slider_wrong = $("#slider_wrong");
slider_wrong.oninput = function(){
	CARDS_WRONG = parseFloat(slider_wrong.value);
	$("#slider_wrong_label").innerHTML = _getLabel("leitner_slider_wrong").replace("[N]",Math.round(CARDS_WRONG*100));
};
slider_wrong.oninput();

// Sliders have SOUNDS
slider_new.onmousedown = slider_new.ontouchstart = function(){
	playSound("slider_down");
};
slider_new.onmouseup = slider_new.ontouchend = function(){
	playSound("slider_up");
};
slider_wrong.onmousedown = slider_wrong.ontouchstart = function(){
	playSound("slider_down");
};
slider_wrong.onmouseup = slider_wrong.ontouchend = function(){
	playSound("slider_up");
};

var boop = -1;
function alternateBoops(){
	boop++;
	if(boop%2==0){
		playSound("button_down");
	}else{
		playSound("button_up");
	}
}


function _updateLabels(){

	// Step
	var html;
	switch(_STAGE){
		case 2:
			html = _getLabel("leitner_step_new").replace("[N]",NEW_CARDS);
			break;
		case 0:
			html = _getLabel("leitner_step_to_review") + QUEUE.toString();
			break;
		case 1:
			html = _getLabel("leitner_step_reviewing").replace("[N]",CURRENTLY_REVIEWED+1);
			break;
	}
	$("#label_step").innerHTML = html;

	// Day
	$("#label_day").innerHTML = _getLabel("leitner_day").replace("[N]",DAY);

	// Stats
	var sum = 0;
	var vlt = 0;
	BOXES.forEach(function(n, i){
		sum += n;
		if(i>=7) vlt += n; // Level 6 and up
	});
	html = _getLabel("leitner_step_stats").replace("[N]", sum);
	if(vlt>0){
		html += _getLabel("leitner_step_stats_2").replace("[N]", vlt);
	}
	$("#label_stats").innerHTML = html;

}

$("#next_step").onclick = function(){
	_newStep();
	_killPointy();
};
function _newStep(skipLabels){
	
	// If queue's empty, start a new day!
	if(QUEUE.length==0){
		if(_STAGE==1){
			_STAGE = 2; // add new cards
			BOXES[0] += NEW_CARDS;

			// Annotate
			_clearAnnotations();
			_annotateAdd(NEW_CARDS);

		}else{
			_newDay();
			_STAGE = 0; // new day!

			_clearAnnotations();

		}
		CURRENTLY_REVIEWED = -1;
	}else{

		// review
		_STAGE = 1;

		// But if not, pop off the queue.
		var reviewedLevel = QUEUE.shift();
		var rIndex = reviewedLevel-1;
		CURRENTLY_REVIEWED = rIndex;

		// Is this Level 1?
		var total, passed, failed;
		total = BOXES[rIndex];
		if(reviewedLevel==1){
			// ALL goes to Level 2
			passed = total;
			failed = 0;
		}else{
			// 95% goes to next level
			// the rest goes to ONE
			passed = Math.round(total*(1-CARDS_WRONG));
			failed = total-passed;
		}
		BOXES[rIndex+1] += passed;
		BOXES[0] += failed;
		BOXES[rIndex] = 0;

		// Annotations
		_clearAnnotations();
		_annotatePass(rIndex, passed);
		_annotateFail(rIndex, failed);

	}

	// Label
	if(!skipLabels) _updateLabels();

	window.REDRAW = 60;

};

$("#next_day").onclick = function(){
	_newDay();
	_updateLabels();
	_killPointy();
};
function _newDay(skipLabels){

	// Any previous stuff in queue? Finish it!
	if(QUEUE.length>0){
		while(QUEUE.length>0 || _STAGE==1){
			_newStep(true); // until queue's done AND past "adding new cards"
		}
	}
	
	// Increase day, add stuff to queue
	DAY++; 
	var d = (DAY-1)%CALENDAR.length; // -1 for offset, also loop around.
	QUEUE = QUEUE.concat(CALENDAR[d]); // to clone it.

	// Redraw
	window.REDRAW = 60;

	// Label
	_STAGE = 0; // new day!
	_clearAnnotations();
	if(!skipLabels) _updateLabels();

};

function _reviewMultipleDays(days){
	for(var i=0;i<days;i++) _newDay();
	_updateLabels()
}

$("#next_week").onclick = function(){
	_reviewMultipleDays(7);
	_killPointy();
};
$("#next_month").onclick = function(){
	_reviewMultipleDays(30);
	_killPointy();
};

//////////////////////////////////////////
//////////////////////////////////////////

var canvas = document.getElementById("sim");
var ctx = canvas.getContext('2d');

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
var BOXES = [
	0,0,0,0,
	0,0,0,0,
];
var ANIM_CARDS = BOXES.concat(); // clone
var ANIM_BOXES = BOXES.concat(); // clone
var CURRENTLY_REVIEWED = -1;
var ANIM_EASE = 0.8;

var DAY = 0;
var QUEUE = [];
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

function _calculateCardLabelPosition(boxN){

	var x = 0;
	var y = 0;

	x += boxN*62.5;
	y += canvas.height/2 - 60;

	y += -ANIM_BOXES[boxN];
	y += -ANIM_CARDS[boxN]/3;

	x += 60/2;
	y -= 13;

	if(y<50) y=50;

	return {
		x:x,
		y:y
	};

}

var annPass = null;
var annFail = null;
var annAdd = null;
function _clearAnnotations(){
	annPass = null;
	annFail = null;
	annAdd = null;
};
function _annotatePass(from, N){
	if(N>0) annPass = {from:from, N:N};
}
function _annotateFail(from, N){
	if(N>0) annFail = {from:from, N:N};
}
function _annotateAdd(N){
	annAdd = {N:N};
}

window.REDRAW = 0;
function update(){

	// Don't re-draw unnecessarily!
	if(window.REDRAW>0){

		window.REDRAW -= 1;

		// Clear & Retina
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.save();
		ctx.scale(2,2);

		// Draw boxes, 1 to 7
		for(var i=0;i<BOXES.length;i++){
			
			var w = 60;
			var h = 60;

			// ANIMATED!
			ANIM_CARDS[i] = ANIM_CARDS[i]*ANIM_EASE + BOXES[i]*(1-ANIM_EASE);
			// Card labels...
			ctx.fillStyle = "#bbb";
			ctx.font = "20px PatrickHand";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			var pos = _calculateCardLabelPosition(i);
			ctx.fillText(Math.round(ANIM_CARDS[i]), pos.x, pos.y);


			// Transform...
			ctx.save();
			ctx.translate(i*62.5, canvas.height/2-h);

			// Bounce! ANIMATED!
			var elevation = (CURRENTLY_REVIEWED==i) ? 10 : 0;
			ANIM_BOXES[i] = ANIM_BOXES[i]*ANIM_EASE + elevation*(1-ANIM_EASE);
			ctx.translate(0, -ANIM_BOXES[i]);

			// The cards inside me
			var cardsHeight = ANIM_CARDS[i]/3;
			ctx.save();
			ctx.translate(0, -cardsHeight);
			ctx.fillStyle = "rgba(0,0,0,0.2)";
			ctx.fillRect(5, 0, w-10, cardsHeight);
			ctx.restore();



			// Am I active today?
			var activeToday = (QUEUE.indexOf(i+1)>=0); // +1 coz offset
			if(CURRENTLY_REVIEWED==i) activeToday=true; // also if CURRENTLY reviewed...
			var color = COLORS[i];

			// Fill
			ctx.fillStyle = activeToday ? color : "#fff";
			ctx.fillRect(0, 0, 60, 60);

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
			var num = i<7 ? (i+1) : "👼"; // 8 = RETIRED.
			ctx.fillText(num, w/2, h/2);

			ctx.restore();

		}

		// Draw Annotations!
		if(annFail){
			_drawArrow(true);
		}
		if(annPass){
			_drawArrow();
		}
		if(annAdd){

			// The number...
			ctx.fillStyle = "#000";
			ctx.font = "18px PatrickHand";
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			var label = "+" + annAdd.N;
			var pos = _calculateCardLabelPosition(0);
			ctx.fillText(label, pos.x, pos.y-15);

		}

		// And, again...
		ctx.restore();

	}

	requestAnimationFrame(update);

}

function _drawArrow(fail){

	var ann = fail ? annFail : annPass;

	// Points
	var pos1 = _calculateCardLabelPosition(ann.from);
	var pos2 = _calculateCardLabelPosition(fail ? 0 : ann.from+1);
	var xOffset = fail ? -5 : 5;
	pos1.x += xOffset;
	pos1.y -= 15;
	pos2.x -= xOffset;
	pos2.y -= 15;
	var cp = {
		x: (pos1.x+pos2.x)/2,
		y: Math.min(pos1.y,pos2.y)-30
	};

	// Color!
	var color = fail ? COLORS[0] : COLORS[3]; // red/green

	// Arrow
	ctx.beginPath();
	ctx.moveTo(pos1.x, pos1.y);
	ctx.quadraticCurveTo(cp.x, cp.y, pos2.x, pos2.y);
	ctx.strokeStyle = color;
	var w = ann.N/10;
	if(w<1) w=1;
	if(w>7) w=7;
	ctx.lineWidth = w;
	ctx.stroke();

	// ArrowHEAD
	ctx.save();
	ctx.translate(pos2.x, pos2.y);
	var dy = pos2.y - cp.y;
	var dx = pos2.x - cp.x;
	var rotation = Math.atan2(dy,dx);
	ctx.rotate(rotation-Math.PI/2);
	ctx.beginPath();
	var arrSize = w*1.5;
	if(arrSize<5) arrSize=5;
	ctx.moveTo(-arrSize,-arrSize);
	ctx.lineTo(0,0);
	ctx.lineTo(arrSize,-arrSize);
	ctx.stroke();
	ctx.restore();

	// The number...
	ctx.fillStyle = color;
	ctx.font = "18px PatrickHand";
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	var label = (fail ? "-" : "+") + ann.N;
	ctx.fillText(label, cp.x, cp.y+15);

}

//////////////////////////////////////////
//////////////////////////////////////////

function _addPointy(mode2){

	window.pointy = new createAnimatedUIHelper({
		x: mode2 ? 380 : 120,
		y: 50,
		width: 100,
		height: 100,
		img: "../../pics/ui_point.png"
	});

}
function _killPointy(){
	if(window.pointy) window.pointy.kill();
	alternateBoops();
}