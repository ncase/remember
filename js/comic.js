
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
		if(val = b.getAttribute("h")){
			if(s.height!="auto") s.height = val+"px";
		}

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
		//iframe.src = sim.getAttribute("src");
		var src = sim.getAttribute("src");
		iframe.setAttribute("will_source", src);
		iframe.scrolling = "no";
		iframe.className = "simulation";
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

	// On scroll
	window.onscroll();

	// Load sounds
	loadSounds();

	////////////////////////
	// i hate ios so much
	// for WHATEVER reason,
	// I have to DELETE AND RE-ADD THE HTML of the chapter names
	// to get them to render at the correct size.
	// I don't know how INTERNET EXPLORER can do this properly
	// but MOBILE SAFARI can't. Gawd.
	////////////////////////

	setTimeout(function(){
		$all("#chapter_name").forEach(function(nameDOM){
			var html = nameDOM.innerHTML;
			nameDOM.innerHTML = "";
			nameDOM.style.fontSize = "100px";
			setTimeout(function(){
				nameDOM.innerHTML = html;
			},1);
		});
	},1000);

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
var _lastHow = null;
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

		// Box/App, change ONLY IF HOW CHANGED
		var currHow = $("#flashcard_you_how_back").innerText.trim().toLocaleLowerCase();
		if(_lastHow != currHow){

			var showWhat = "other";
			if(currHow.search("leit") >= 0 || currHow.search("liet") >= 0){ // for typos
				showWhat = "leitner";
			}else if(currHow.search("anki") >= 0){
				showWhat = "anki";
			}else if(currHow.search("tiny") >= 0){
				showWhat = "tiny";
			}
			$("#gift_app").innerHTML = $("#gift_app_"+showWhat).innerHTML;

		}
		_lastHow = currHow;

	},5000);
	//},1000);

	// Can't download .zip 
	if(detectmob()){
		$all(".not_on_mobile").forEach(function(dom){
			dom.style.display = "none";
		});
	}

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

var wallpaperBGImage = new Image();
wallpaperBGImage.src = "pics/wallpaper.png";
function makeWallpaper(){
	
	var canvas = document.createElement("canvas");
	canvas.width = window.screen.width * window.devicePixelRatio;
	canvas.height = window.screen.height * window.devicePixelRatio;

	var ctx = canvas.getContext("2d");

	// bg
	ctx.fillStyle = "#8296BF";
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
	//ctx.fillStyle = "rgba(255,255,255,0.2)";
	//ctx.fillRect(0, 0, SIZE, SIZE);
	ctx.drawImage(wallpaperBGImage, 0, 0, SIZE, SIZE);

	// text
	var what = getLabel("gift_wallpaper_what").trim();
	what += " " + $("#flashcard_you_what_back").innerText.trim();
	
	var why = getLabel("gift_wallpaper_why").trim();
	why += " " + $("#flashcard_you_why_back").innerText.trim();
	
	var do1 = getLabel("gift_wallpaper_do_1").trim();
	var do2 = getLabel("gift_wallpaper_do_2").trim();
	
	// draw text
	ctx.textAlign = "center";
	ctx.fillStyle = "#000";
	ctx.font = "40px PatrickHand, Helvetica, Arial";
	ctx.fillText(what, 250, 400);
	ctx.fillText(why, 250, 450);

	// draw DO ME
	ctx.font = "80px PatrickHand, Helvetica, Arial";
	ctx.fillStyle = "#000";
	ctx.fillText(do1, 400, 190);
	ctx.fillText(do2, 400, 270);

	// Return canvas;
	ctx.restore();
	return canvas;

}

///////////////////
// Chapter Links //
///////////////////

var linx = $("#label_chapter_links");
if(linx){
	$all("#chapter_links").forEach(function(linkContainer){
		linkContainer.innerHTML = linx.innerHTML;
	});
}

// HACK: Duplicate header text for absolute positioning coz CSS sucks
/*$all(".divider").forEach(function(divider){

	var html = divider.querySelector("div").innerHTML;
	divider.querySelector("#divider_container").innerHTML = html;

});*/

//////////////////////
// SOUNDS ////////////
//////////////////////

var SOUNDS_TO_LOAD = [
	["applause",1],
	["ding",1],
	["button_down",1],
	["button_up",1],
	["flip_down",1],
	["flip_up",1],
	["reset",1],
	["slider_down",0.25],
	["slider_up",0.25],
	["tada",0.5],
	["type1",1],
	["type2",1],
	["type3",1],
	["type4",1],
	["type5",1],
	["win",1],
	["win_final",1],
];
var SOUNDS = {};
function loadSounds(){
	SOUNDS_TO_LOAD.forEach(function(config){
		
		var name = config[0];
		var vol = config[1];

		SOUNDS[name] = new Howl({
			src: ["audio/"+name+".mp3"],
			volume: vol
		});

	});
}
window.playSound = function(name){
	SOUNDS[name].play();
};

subscribe("PREflip_spaced_rep",function(){
	setTimeout(function(){
		SOUNDS.tada.play();
	},500);
});
subscribe("PREflip_the_end",function(){
	SOUNDS.applause.play();
});

/////////////////////////////
// IFRAME SCROLL ////////////
/////////////////////////////

var splashes = $all("iframe.splash");

window.onscroll = function(){

	// Playables - PAUSE & UNPAUSE
	var scrollY = window.pageYOffset;
	var innerHeight = window.innerHeight;
	for(var i=0;i<splashes.length;i++){
		var s = splashes[i];
		var bounds = s.getBoundingClientRect();
		if(s.contentWindow) s.contentWindow.IS_IN_SIGHT = (bounds.top<innerHeight && bounds.top+bounds.height>0);
	}

	// Also, iframe scrollables
	var BUFFER = innerHeight/2;
	var simulations = $all("iframe.simulation");
	simulations.forEach(function(sim){
		if(!sim.src){
			var bounds = sim.getBoundingClientRect();
			if(bounds.top<innerHeight+BUFFER && bounds.top+bounds.height>-BUFFER){
				sim.src = sim.getAttribute("will_source");
				console.log("Loading "+sim.src+"...");
			}
		}
	});

	// More iframes
	var iframes = $all("iframe");
	iframes.forEach(function(iframe){
		if(!iframe.src){
			var gotoSrc = iframe.getAttribute("gotosrc");
			if(gotoSrc){

				var bounds = iframe.getBoundingClientRect();
				if(bounds.top<innerHeight+BUFFER && bounds.top+bounds.height>-BUFFER){
					iframe.src = gotoSrc;
					console.log("Loading "+iframe.src+"...");
				}

			}
		}
	});

};

setInterval(window.onscroll, 1000); // to update late-loaders


/////////////////////////////
// TRANSLATIONS /////////////
/////////////////////////////

var LANGUAGES = {};

var xhr = new XMLHttpRequest();
xhr.addEventListener("load", function(event){

	// What's user's language(s)?
	var userLang = navigator.language || navigator.userLanguage;
	var userLangs = [userLang];
	if(userLang.search("-")>=0){
		userLangs.push( userLang.split("-")[0] ); // e.g. en-US => en
	}

	// What's this page's language?
	var pathnameSplit = window.location.pathname.split("/");
	var pagename = pathnameSplit[pathnameSplit.length-1];
	var pageLang = (pagename==""||pagename=="index") ? "en" : pagename.split(".")[0];

	////////////////////////////////

	// A database of languages!
	var langs = xhr.response.split("\n\n");
	langs.forEach(function(lang){
		
		var splitup = lang.split("\n");

		while(splitup.length>0 && splitup[0]=="") splitup.shift(); // in case of extra newlines
		if(splitup.length==0) return; // no emptiness

		var code = splitup[0];

		if(code=="ex") return; // no Example
		if(code.substr(0, 2)=="//") return; // no Comments

		LANGUAGES[code] = {
			name: splitup[1],
			link: splitup[2],
			ask: splitup[3],
			yes: splitup[4],
			no: splitup[5],
			translatedBy: splitup[6],
			originalIn: splitup[7]
		};

	});

	// Show languages options in the box
	var LANGS_SORTED = [];
	for(var code in LANGUAGES){
		LANGS_SORTED.push(code);
	}
	LANGS_SORTED.sort();
	var html = "";
	LANGS_SORTED.forEach(function(code){
		var lang = LANGUAGES[code];
		if(code==pageLang) return; // no need for this page, obviously
		html += "<a href='"+lang.link+"'>"+lang.name+"</a><br>";
	});
	$("#language_options").innerHTML = html;

	// When to show prompt:
	// If browser language is supported AND it's not this page
	var l;
	l = userLangs[0];
	if(LANGUAGES[l] && l!=pageLang) _showPrompt(l);
	l = userLangs[1];
	if(LANGUAGES[l] && l!=pageLang) _showPrompt(l);

	// Translation credits if NOT english
	if(pageLang!="en"){
		var html = "";
		var lang = LANGUAGES[pageLang];
		if(lang){
			html += lang.translatedBy;
			html += " &middot; ";
			html += "<a href='./'>"+lang.originalIn+"</a>";
			$("#translation_credits").innerHTML = html;
			$("#translation_credits_2").innerHTML = lang.translatedBy;
		}
	}

});
function _showPrompt(lang){

	lang = LANGUAGES[lang];

	// Add prompt
	var promptDOM = document.createElement("div");
	promptDOM.id = "prompt";
	document.body.appendChild(promptDOM);

	// Fill in prompt
	var askDOM = document.createElement("div");
	askDOM.innerHTML = lang.ask;
	var yesDOM = document.createElement("a");
	yesDOM.innerHTML = lang.yes;
	var nbsp = document.createElement("span");
	nbsp.innerHTML = "&nbsp;";
	var noDOM = document.createElement("a");
	noDOM.innerHTML = lang.no;
	
	promptDOM.appendChild(askDOM);
	promptDOM.appendChild(yesDOM);
	promptDOM.appendChild(nbsp);
	promptDOM.appendChild(noDOM);

	// Code Logic
	yesDOM.href = lang.link;
	noDOM.onclick = function(){
		noDOM.onclick = null; // ONLY ONCE
		promptDOM.setAttribute("hide", "yes");
		setTimeout(function(){
			document.body.removeChild(promptDOM);
		},2000);
	};


}
xhr.open("GET", "translations.txt");
xhr.send();


/////////////////////////////
// SHARE BUTTONS ////////////
/////////////////////////////

var share_title = encodeURIComponent( $("#share_title").innerText.trim() );
var share_desc = encodeURIComponent( $("#share_desc").innerText.trim() );
var share_url = encodeURIComponent( window.location.origin+window.location.pathname );

var hrefs = {
	facebook: "https://www.facebook.com/sharer/sharer.php?u="+share_url,
	twitter: "https://twitter.com/intent/tweet?source="+share_url+"&text="+share_title+" – "+share_desc+":%20"+share_url,
	tumblr: "http://www.tumblr.com/share?v=3&u="+share_url+"&t=+share_title+&s=",
	reddit: "http://www.reddit.com/submit?url="+share_url+"&title="+share_title,
	email: "mailto:?subject="+share_title+"&body="+share_desc+":%20"+share_url
};
var platforms = [
	"facebook",
	"twitter",
	"tumblr",
	"reddit",
	"email"
];

platforms.forEach(function(platform){

	// Link
	var link = document.createElement("a");
	link.href = hrefs[platform];
	link.target = "_blank";
	$("#share_buttons").appendChild(link);
	
	// Image
	var img = new Image();
	img.src = "./sharing/"+platform+".svg";
	link.appendChild(img);

});
