var flashcard = $("#flashcard");
var FLIPPED = false;
flashcard.onclick = function(){

	// Flip!
	var flip = flashcard.getAttribute("flip");
	if(flip=="yes"){
		flashcard.setAttribute("flip","no");
	}else{
		flashcard.setAttribute("flip","yes");
	}

	// Also, send message (when flipped for first time)
	if(!FLIPPED && window.top.broadcastMessage){
		FLIPPED = true;
		setTimeout(function(){
			window.top.broadcastMessage("flip_"+cardname);
		},1000);
	}

};

window.cardname = _getQueryVariable("card");
var frontHTML = _getLabel("flashcard_"+cardname+"_front");
var backHTML = _getLabel("flashcard_"+cardname+"_back");
$("#front").innerHTML = frontHTML;
$("#back").innerHTML = backHTML;

_modifyFlashCard($("#front"));
_modifyFlashCard($("#back"));