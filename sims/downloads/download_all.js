/**********************************

- Draw text box in correct position @done
- With word wrap @done

- Detect device
- Download a wallpaper/lockscreen

**********************************/

// CARDS TO LOAD
var CARDNAMES = [

	"intro_a",
	"intro_b",
	"intro_c",
	
	"sci_a",
	"sci_b",
	"sci_c",

	"leit_a",
	"leit_b",
	"leit_c",
	"leit_d",

	"you_what",
	"you_why",
	"you_how",
	"you_when"

];

var download_btn = $("#download");
download_btn.innerHTML = "&nbsp;"+_getLabel("download_all");
download_btn.onclick = function(){

	// disable while we wait...
	download_btn.innerHTML = "&nbsp;"+_getLabel("download_all_downloading");
	download_btn.style.opacity = 0.5;

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
			//document.body.appendChild(canvas);
		});

		// Download...
		zip.generateAsync({type:"blob"})
			.then(function(content) {
				
				saveAs(content, "flashcards.zip");

				// Done!
				download_btn.innerHTML = "&nbsp;"+_getLabel("download_all_done");
				download_btn.style.opacity = 1.0;
				download_btn.style.fontSize = "22px";

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

			// Get font size
			var words = dom.querySelector("#fc_words"); 
			var fontsize = words.style.fontSize || 40;
			fontsize = parseInt(fontsize);
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.fillStyle = "#000";
			ctx.font = fontsize+"px PatrickHand, Helvetica, Arial";

			// Line Height
			var lineHeight = words.style.lineHeight || "1.1em";
			if(lineHeight.includes("em")){
				lineHeight = fontsize * parseFloat(lineHeight);
			}

			// Width & Lineheight
			var maxWidth = words.style.width || 360;
			maxWidth = parseInt(maxWidth);

			// Get position
			var position = {x:0, y:0};
			if(words.classList.contains("fcard_center")){
				var h = words.style.height || "44px";
				if(h.includes("em")){
					h = fontsize * parseFloat(h);
				}else if(h.includes("px")){
					h = parseFloat(h);
				}

				// Editable?
				if(words.getAttribute("editable")){
					var numLines = testHowManyLines(ctx, dom.innerText.trim(), maxWidth);
					h = fontsize * numLines;
				}

				position.x = 200;
				position.y = (240-h-10)/2;
			}else{
				var x = parseFloat(words.style.left)
				var y = parseFloat(words.style.top)
				position.x = x + maxWidth/2;
				position.y = y;
			}

			// Draw the innerText, w/e
			wrapText(
				ctx,
				dom.innerText.trim(),
				position.x, position.y,
				maxWidth,
				lineHeight
			);

			// Return it!
			resolveCanvas([filename, canvas]);

		});

	});

}


function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.replace(/\n/g," ").split(' ');
	words = words.map(word => word.trim());
	var line = '';
	for(var n=0; n<words.length; n++){
		
		var testLine;
		if(n==0){
			testLine = line + words[n];
		}else{
			testLine = line + " " + words[n];
		}

		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;

		if(testWidth>maxWidth && n>0){
			context.fillText(line, x, y);
			line = words[n];
			y += lineHeight;
		}else{
			line = testLine;
		}

	}
	context.fillText(line, x, y);
}

function testHowManyLines(context, text, maxWidth){
	var numLines = 1;
	var words = text.replace(/\n/g," ").split(' ');
	words = words.map(word => word.trim());
	var line = '';
	for(var n=0; n<words.length; n++){
		
		var testLine;
		if(n==0){
			testLine = line + words[n];
		}else{
			testLine = line + " " + words[n];
		}

		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;

		if(testWidth>maxWidth && n>0){
			//context.fillText(line, x, y);
			line = words[n];
			numLines++;
		}else{
			line = testLine;
		}

	}
	//context.fillText(line, x, y);

	return numLines;
}
