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
		var w = 400;//p.getBoundingClientRect().width;
		bg.style.backgroundSize = Math.round((1600/w)*50)+"%";
	}

}