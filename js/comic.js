
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
			s.backgroundSize = ((3000/w)*50).toFixed(2)+"%";
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



//////////////////////////////////////////
// TOTAL HACK: the GIFTS /////////////////
//////////////////////////////////////////

// Wallpaper
if($("#gift_wallpaper")){

	var gw_text = detectmob() ? "gift_wallpaper_phone" : "gift_wallpaper_desktop";
	$("#gift_wallpaper").innerHTML = $("#"+gw_text).innerHTML;

	var WALLPAPER_CHANGED = true;
	subscribe("answer_edit_you_what",function(){
		WALLPAPER_CHANGED = true;
	});
	subscribe("answer_edit_you_why",function(){
		WALLPAPER_CHANGED = true;
	});

	setInterval(function(){

		// Wallpaper, re-make ONLY IF CHANGED
		if(WALLPAPER_CHANGED){
			WALLPAPER_CHANGED = false;
			var canvas = makeWallpaper();
			var dataURL = canvas.toDataURL();
			$("#wallpaper_link").href = dataURL;
			$("#wallpaper_link").download = (getLabel("gift_wallpaper_filename").trim())+".png";
			$("#wallpaper_image").src = dataURL;
		}

		// Box/App
		var showWhat = "other";
		var theHow = $("#flashcard_you_how_back").innerText.trim().toLocaleLowerCase();
		if(theHow.search("leitner") >= 0){
			showWhat = "leitner";
		}else if(theHow.search("anki") >= 0){
			showWhat = "anki";
		}else if(theHow.search("tiny") >= 0){
			showWhat = "tiny";
		}
		$("#gift_app").innerHTML = $("#gift_app_"+showWhat).innerHTML;

	},5000);

}

// From https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function detectmob(){ 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

function makeWallpaper(){
	
	var canvas = document.createElement("canvas");
	canvas.width = window.screen.width * window.devicePixelRatio;
	canvas.height = window.screen.height * window.devicePixelRatio;

	var ctx = canvas.getContext("2d");

	// bg
	ctx.fillStyle = "#ff4040";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	// in a square
	ctx.save();
	ctx.translate(canvas.width/2, canvas.height/2);
	var SIZE = 500;
	var squareSize = Math.min(canvas.width,canvas.height);
	var scale = (squareSize/SIZE)*0.8;
	ctx.scale(scale, scale);
	ctx.translate(-SIZE/2, -SIZE/2);

	// Square
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, SIZE, SIZE);

	// text
	ctx.fillStyle = "#000";
	ctx.font = "40px PatrickHand, Helvetica, Arial";
	var what = getLabel("gift_wallpaper_what").trim();
	var what2 = $("#flashcard_you_what_back").innerText.trim();
	var why = getLabel("gift_wallpaper_why").trim();
	var why2 = $("#flashcard_you_why_back").innerText.trim();
	var doo = getLabel("gift_wallpaper_do").trim();
	ctx.fillText(what, 0, 50);
	ctx.fillText(what2, 0, 100);
	ctx.fillText(why, 0, 150);
	ctx.fillText(why2, 0, 200);
	ctx.fillText(doo, 0, 250);

	// Return canvas;
	ctx.restore();
	return canvas;

}

///////////////////
// Chapter Links //
///////////////////

var linx = $("#label_chapter_links");
if(linx){
	$all(".divider > #chapter_links").forEach(function(linkContainer){
		linkContainer.innerHTML = linx.innerHTML;
	});
}

