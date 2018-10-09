// WHAT'S THIS CARD?
window.cardname = _getQueryVariable("card");

// THE QUESTION
var qDOM = document.createElement("div");
qDOM.innerHTML = _getLabel("flashcard_"+window.cardname+"_front");
var questionText = qDOM.innerText.trim();
questionText = _getLabel("type_question").trim() + " " + questionText;
$("#question").innerText = questionText;

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
			answer.oninput();
		};
	})(s);

}