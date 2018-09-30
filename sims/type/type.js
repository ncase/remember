window.cardname = _getQueryVariable("card");

$("#answer").oninput = function(){

	// Also, send message (when flipped for first time)
	if(window.top.broadcastMessage){
		setTimeout(function(){
			window.top.broadcastMessage("answer_edit_"+cardname, [$("#answer").value]);
		},1);
	}

};