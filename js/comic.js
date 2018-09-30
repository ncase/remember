
// The poor man's jQuery
function $(query){
	return document.querySelector(query);
}
function $all(query){
	return [].slice.call(document.querySelectorAll(query));
}

window.onload = function(){

	var panels = $all("panel");
	var pics = $all("pic");
	var sims = $all("sim");
	var words = $all("words");

	// Adjust positions & dimensions of all the things
	var boxes = panels.concat(pics).concat(words).concat(sims);
	boxes.forEach(function(b){
		
		var s = b.style;
		var val;
		if(val = b.getAttribute("x")) s.left = val+"px";
		if(val = b.getAttribute("y")) s.top = val+"px";
		if(val = b.getAttribute("w")) s.width = val+"px";
		if(val = b.getAttribute("h")) s.height = val+"px";

	});

	// Pics have image (and maybe crop it?)
	pics.forEach(function(p){
		
		var s = p.style;
		var val;
		if(val = p.getAttribute("src")){
			s.backgroundImage = "url("+val+")";
			var x = p.getAttribute("sx") || 0;
			var y = p.getAttribute("sy") || 0;
			s.backgroundPosition = (-x)+"px "+(-y)+"px";
			var w = p.getBoundingClientRect().width;
			s.backgroundSize = Math.round((3000/w)*50)+"%";
		}

	});

	// Sims have iframes in them. (Pass in the labels!)
	sims.forEach(function(sim){

		// Create & append iframe
		var iframe = document.createElement("iframe");
		iframe.src = sim.getAttribute("src");
		iframe.scrolling = "no";
		sim.appendChild(iframe);

	});

	// Words... no bg? And, fontsize, color?
	words.forEach(function(word){
		var s = word.style;
		var val;
		if(val = word.getAttribute("bg")) s.background = val;
		if(val = word.getAttribute("fontsize")) s.fontSize = s.lineHeight = val+"px";
		if(val = word.getAttribute("color")) s.color = val;
	});

	// Panels... Any MESSAGES?
	panels.forEach(function(panel){
		
		var msg;

		// Fade in!
		if(msg = panel.getAttribute("fadeInOn")){
			subscribe(msg, function(){
				panel.style.opacity = 1;
			});
		}

		// BG?
		var s = panel.style;
		var val;
		if(val = panel.getAttribute("bg")) s.background = val;

	});

};

window.getLabel = function(name){
	return $("#"+name).innerHTML;
}

window.broadcastMessage = function(message, args){
	publish(message, args);
};

// Editable Flashcard Labels
$all("div[editable]").forEach(function(dom){

	var cardname = dom.getAttribute("editable");
	subscribe("answer_edit_"+cardname, function(text){
		dom.innerText = text;
	});

});
