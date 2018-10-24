Math.TAU = Math.PI*2; // i'm twice the number you'll ever be

// The poor man's jQuery
function $(query){
	return document.querySelector(query);
}
function $all(query){
	return [].slice.call(document.querySelectorAll(query));
}

function _getQueryVariable(name){
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for(var i=0;i<vars.length;i++){
		var pair = vars[i].split("=");
		if(pair[0]==name) return pair[1];
	}
	return(false);
}

function _getLabel(name){
	if(window!=window.top){
		return window.top.getLabel(name);
	}else{
		return $("#"+name).innerHTML;
	}
}

function _modifyFlashCard(fcard){

	var bg = fcard.querySelector(".fcard_bg");
	if(bg){
		var src = bg.getAttribute("src");
		bg.style.backgroundImage = "url(../../"+src+")";
		var x = bg.getAttribute("sx") || 0;
		var y = bg.getAttribute("sy") || 0;
		bg.style.backgroundPosition = (-x)+"px "+(-y)+"px";
		var w = 400;
		bg.style.backgroundSize = Math.round((1600/w)*50)+"%";
	}

}

/////////////////////////////////////////////
/////////////////////////////////////////////


function createAnimatedUIHelper(config){

	var self = this;
	self.dom = document.createElement("div");
	
	var dom = self.dom;
	var s = dom.style;

	var frame = 0;

	// Append to body
	s.position = "absolute";
	s.left = config.x+"px";
	s.top = config.y+"px";
	s.pointerEvents = "none";
	document.body.appendChild(dom);

	// Animate
	s.width = config.width+"px";
	s.height = config.height+"px";
	s.backgroundImage = "url("+config.img+")";
	s.backgroundSize = "auto 100%";

	var delay = config.delay || 500;
	var nextFrame = function(){
		if(!DEAD){
			frame++;
			s.backgroundPosition = (-1*frame*config.width)+"px 0px";
			setTimeout(nextFrame,delay);
		}
	};
	setTimeout(nextFrame,delay);

	// DISAPPEAR
	var DEAD = false;
	self.kill = function(){
		if(!DEAD){
			document.body.removeChild(dom);
			DEAD = true;
		}
	};

}

function createSlider(config){

	var self = this;

}

function playSound(name){
	if(window!=window.top){
		if(window.top.playSound){
			window.top.playSound(name);
		}
	}
}

