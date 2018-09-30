/**********************************

1. ONLY when you press the button, does it take labels & pics & such... @done

2. Loads 'em all...

3. Draws html to canvasses!
- draw SOMETHING @done
- draw background image (if any) @done
- draw text box in correct position & text align with word wrap

4. Lets you download all of 'em, as a .zip! @done

**********************************/

// CARDS TO LOAD
var CARDNAMES = [
	"sci_a",
	"mitochondria_7",
	"mitochondria_8",
	"sci_c"
];


var download_btn = $("#download");
download_btn.onclick = function(){

	// disable while we wait...
	download_btn.disabled = true;

	// Loads
	var CARD_HTMLS = [];
	for(var i=0; i<CARDNAMES.length; i++){
		
		var cardname = CARDNAMES[i];

		var front = document.createElement("div");
		front.innerHTML = _getLabel("flashcard_"+cardname+"_front");
		
		var back = document.createElement("div");
		back.innerHTML = _getLabel("flashcard_"+cardname+"_back");

		var htmls = { front:front, back:back };
		CARD_HTMLS.push(htmls);

	}

	// DRAW TO CANVASSES (with Promises, coz loading)
	var canvasPromises = [];
	for(var i=0; i<CARD_HTMLS.length; i++){
		var html = CARD_HTMLS[i];
		var cardname = CARDNAMES[i];
		canvasPromises.push( _drawToCanvas(cardname+"_front", html.front) );
		canvasPromises.push( _drawToCanvas(cardname+"_back", html.back) );
	}

	// When all Promises fulfilled...
	Promise.all(canvasPromises).then(function(canvasses){

		// ZIP
		var zip = new JSZip();

		// Canvasses
		canvasses.forEach(function(results){
			var filename = results[0];
			var canvas = results[1];
			zip.file(filename+".png", canvas.toDataURL().substr(22), {base64: true});
		});

		// Download...
		zip.generateAsync({type:"blob"})
			.then(function(content) {
			saveAs(content, "flashcards.zip");
		});

	});


};

function _drawToCanvas(filename, dom){

	return new Promise(function(resolveCanvas){

		// Canvas & Context
		var canvas = document.createElement("canvas");
		canvas.width = 400*2;
		canvas.height = 240*2;
		var ctx = canvas.getContext("2d");
		ctx.scale(2,2);

		// White background
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw background (with offset, if any)
		var drawBG = new Promise(function(resolveBG){

			// Any BG?
			var bg = dom.querySelector(".fcard_bg");
			if(bg){

				var bgSrc = "../../" + bg.getAttribute("src");
				var bgImage = new Image();
				bgImage.onload = function(){

					var sx = parseInt( bg.getAttribute("sx") ) || 0;
					var sy = parseInt( bg.getAttribute("sy") ) || 0;
					var dx = parseInt( bg.style.left ) || 0;
					var dy = parseInt( bg.style.top ) || 0;
					var width = 400;
					var height = 240;

					ctx.drawImage(bgImage,
						sx*2, sy*2, width*2, height*2,
						dx, dy, width, height);

					resolveBG(); // donzeo

				};
				bgImage.src = bgSrc;

			}else{
				resolveBG(); // donzeo
			}

		});

		// Draw text
		drawBG.then(function(){

			// Draw the innerText, w/e
			ctx.fillStyle = "#000";
			ctx.font = "20px PatrickHand";
			ctx.fillText(dom.innerText, 10, 50);

			// Return it!
			resolveCanvas([filename, canvas]);

		});

	});

}
