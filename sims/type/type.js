// WHAT'S THIS CARD?
window.cardname = _getQueryVariable("card");

// THE QUESTION
var qDOM = document.createElement("div");
qDOM.innerHTML = _getLabel("flashcard_"+window.cardname+"_front");
var questionText = qDOM.innerText.trim();
questionText = _getLabel("type_question").trim() + " " + questionText;
$("#question").innerHTML = questionText;

// THE ANSWER
var answer = $("#answer");
answer.placeholder = _getLabel("type_placeholder").trim();
answer.oninput = function(){

	// Also, send message (when flipped for first time)
	if(window.top.broadcastMessage){
		setTimeout(function(){
			window.top.broadcastMessage("answer_edit_"+cardname, [$("#answer").value]);
		},1);
	}

	// kill
	window.pointy.kill();

	// type sound, random
	if(!window.NO_TYPE_SOUND){
		var randomNumber = Math.floor(1+Math.random()*5);
		playSound("type"+randomNumber);
	}

};

// THE SUGGESTIONS
$("#suggestion_header").innerText = _getLabel("type_suggestions").trim();

var suggestionsDOM = $("#suggestions_list");
var suggestionsUL = document.createElement("ul");
var suggestions_list_name = window.cardname+"_suggestions";
suggestionsUL.innerHTML = _getLabel(suggestions_list_name);
for(var i=0; i<suggestionsUL.children.length; i++){

	// suggestion 
	var suggestion = document.createElement("div");
	var s = suggestionsUL.children[i].innerText.trim();
	suggestion.innerText = s;
	suggestionsDOM.appendChild(suggestion);

	// on click
	(function(s){
		suggestion.onclick = function(){
			answer.value = s;

			window.NO_TYPE_SOUND = true;
			answer.oninput();
			answer.focus();
			window.NO_TYPE_SOUND = false;

			alternateBoops();

		};
	})(s);

}

var boop = -1;
function alternateBoops(){
	boop++;
	if(boop%2==0){
		playSound("button_down");
	}else{
		playSound("button_up");
	}
}

//////////////////////////////////

window.pointy = new createAnimatedUIHelper({
	x: 480,
	y: 80,
	width: 100,
	height: 100,
	img: "../../pics/ui_point.png"
});
