window.CARDS = [];
window.onload = function(){

	// Get cards, in order.
	var cardnames = _getQueryVariable("cards");
	cardnames = cardnames.split(",");
	window.CARDS = cardnames.map(function(cardname){
		return {
			name: cardname,
			front: _getLabel("flashcard_"+cardname+"_front"),
			back: _getLabel("flashcard_"+cardname+"_back")
		};
	});

	// Set up info
	setUpInfo();

	// Logic for flippable current card
	$("#current_card").onclick = function(){

		// Flip!
		var flipcont = $("#flip-container");
		var flip = flipcont.getAttribute("flip");
		flipcont.setAttribute("flip", (flip=="yes") ? "no" : "yes");
		playSound((flip=="yes") ? "flip_down": "flip_up");

		// Hide Info, then ask "did you get it?"
		if(INFO_MODE == "question"){
			hideInfo();
			setTimeout(showInfoAnswer, 700);
		}

		// KILL UI
		clicky.kill();

	};

	// Show first card
	showCurrentCard();

};

function showCurrentCard(infoTimeout){

	// NO MORE CARDS? guess we're DONE.

	if(CARDS.length==0){

		$("#next_card").style.display = "none";
		$("#current_card").style.display = "none";
		showInfoDone();

	}else{

		// Card
		var currentCard = CARDS[0];
		// HACK. If it's a YOU card, AUTO-REFRESH.
		if(currentCard.name.search("you_")>=0){
			currentCard.front = _getLabel("flashcard_"+currentCard.name+"_front");
			currentCard.back = _getLabel("flashcard_"+currentCard.name+"_back");
		}
		$("#ccard_front").innerHTML = currentCard.front;
		$("#ccard_back").innerHTML = currentCard.back;

		_modifyFlashCard($("#ccard_front"));
		_modifyFlashCard($("#ccard_back"));

		// INSTANT RESET
		
		var flipper = $("#flip-container .flipper");
		flipper.style.transition = "0s"; // INSTANT
		$("#flip-container").setAttribute("flip","no");

		var ccardDOM = $("#current_card");
		ccardDOM.style.transition = "0s"; // INSTANT
		ccardDOM.style.left = "";

		setTimeout(function(){
			flipper.style.transition = "";
			ccardDOM.style.transition = "";
		},PLANCK_TIME);


		// Question
		infoTimeout = infoTimeout || PLANCK_TIME;
		setTimeout(function(){
			showInfoQuestion();
		},infoTimeout);

	}

}

function showNextCard(){
	if(CARDS.length>0){
		var nextCard = CARDS[0];
		$("#next_card").style.display = "block";
		$("#next_card").innerHTML = nextCard.front;
	}else{
		$("#card_bg_smiley").style.display = "block";
		if(IS_FINAL_MULTICARD){
			$("#card_bg_smiley").style.backgroundPosition = "-150px 0px";
		}
	}
}

var PLANCK_TIME = 20;
var BUFFER_TIME = PLANCK_TIME*3;

function nextCard(removeCurrent){

	hideInfo();

	// Remove, or shuffle back?
	var currCard = CARDS.shift();
	if(!removeCurrent){
		CARDS.push(currCard); // shuffle to back.
	}

	// REMOVE... CARD TO THE RIGHT!
	if(removeCurrent){

		showNextCard();

		var currentCard = $("#current_card");
		currentCard.style.left = "500px";

		setTimeout(function(){
			$("#next_card").style.display = "none";
			showCurrentCard();
		},300+BUFFER_TIME);

	}else{

		showNextCard();

		var currentCard = $("#current_card");
		currentCard.style.left = "-400px";
		
		setTimeout(function(){

			// What card is currently showing?
			var cardShowing = ($("#flip-container").getAttribute("flip")=="yes") ? "#ccard_back" : "#ccard_front";
			var htmlShowing = $(cardShowing).innerHTML;

			// Force next card to look like past card, and teleport it out
			var ncard = $("#next_card");
			ncard.innerHTML = htmlShowing;
			ncard.style.left = "-400px";

			// Slide next card to where current card should be
			setTimeout(function(){
				ncard.style.transition = "left 0.3s ease-out";
				setTimeout(function(){
					ncard.style.left = "0px";
					setTimeout(function(){
						ncard.style.transition = "";
						ncard.style.left = "";
						ncard.style.display = "none"; // BYE.
					},300+BUFFER_TIME);
				},PLANCK_TIME);
			},PLANCK_TIME);

			// Also, show current card
			showCurrentCard(300+BUFFER_TIME);

		},300+BUFFER_TIME);

	}

}

var IS_FINAL_MULTICARD = (_getQueryVariable("final")=="yes");
function setUpInfo(){

	// Labels
	$("#a_label").innerHTML = _getLabel("multicard_a");
	$("#a_no").innerHTML = _getLabel("multicard_no");
	$("#a_yes").innerHTML = _getLabel("multicard_yes");
	$("#done").innerHTML = _getLabel( IS_FINAL_MULTICARD ? "multicard_done_2" : "multicard_done");

	// Clicking "yes" or "no"
	$("#a_yes").onclick = function(){
		nextCard(true);
		playSound("button_down");
	};
	$("#a_no").onclick = function(){
		nextCard(false);
		playSound("button_up");
	};

}

var INFO_MODE = "question";
function showInfoQuestion(){

	$("#info").style.display = "block";
	$("#question").style.display = "block";
	$("#answer").style.display = "none";

	// Show, with "(how many left)"
	var html = _getLabel("multicard_q");
	html += "<br>";
	html += "<span>";
	html += _getLabel("multicard_cards_left").replace("[N]",CARDS.length);
	html += "</span>";
	$("#question").innerHTML = html;
	
	INFO_MODE = "question";

}
function showInfoAnswer(){
	$("#info").style.display = "block";
	$("#question").style.display = "none";
	$("#answer").style.display = "block";
	INFO_MODE = "answer";

	// SHOW UI
	if(!window.pointy){
		window.pointy = new createAnimatedUIHelper({
			x: 480,
			y: 295,
			width: 100,
			height: 100,
			img: "../../pics/ui_point.png"
		});
	}

}
function showInfoDone(){
	$("#info").style.display = "block";
	$("#question").style.display = "none";
	$("#answer").style.display = "none";
	$("#done").style.display = "block";	
	INFO_MODE = "done";

	playSound( IS_FINAL_MULTICARD ? "win_final" : "win" );

}
function hideInfo(){
	$("#info").style.display = "none";

	if(window.pointy) window.pointy.kill();

}


/*
// Also, Send message when ALL DONE
if(!FLIPPED && window.top.broadcastMessage){
	FLIPPED = true;
	setTimeout(function(){
		window.top.broadcastMessage("flip_"+cardname);
	},1000);
}
*/

/////////////////////////////////////////
/////////////////////////////////////////

var clicky = new createAnimatedUIHelper({
	x: 430,
	y: 225,
	width: 100,
	height: 100,
	img: "../../pics/ui_click.png"
});
