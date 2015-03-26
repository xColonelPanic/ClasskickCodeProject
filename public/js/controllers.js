(function(){
	var app = angular.module('appControllers',[]);
	// set up references to locations in Firebase
	var ref = new Firebase('https://dazzling-heat-6655.firebaseio.com/');
	var cells = new Firebase('https://dazzling-heat-6655.firebaseio.com/cells');
	var lines = new Firebase('https://dazzling-heat-6655.firebaseio.com/lines');
	var connected = new Firebase('https://dazzling-heat-6655.firebaseio.com/.info/connected');
	// set up number of columns in grid
	// TODO make this dynamic
	var k = 3;

	app.controller('MatrixController', [function(){

		$('.matrixbutton').css('color', 'rgb(100,200,100)');
		$('.canvasbutton').css('color', 'white');

		// detect if connected to Firebase or not
		connected.on('value', function(snapshot){
			if(snapshot.val() === true)
			{
				// make some indicator green
				$('.indicator').addClass('connected');
				console.log("connected to Firebase");
			}
			else
			{
				// make the indicator red
				$('.indicator').removeClass('connected');
				console.log("disconnected from Firebase");
			}
		});
		//on page load, set all squares' color according to the data in Firebase
		cells.once('value', function(snapshot){
			var allCells = snapshot.val();
			for(i = 0 ; i < 2*k ; i ++)
			{
				for(j = 0; j < k ; j ++)
				{
					var id = "cell" + i + j;
					// use jquery to set each cell's color initially
					if(allCells[id].value == 0)
					{
						// set color to grey
						$('#'+id).removeClass("activated");
					}
					else
					{
						// set color to green
						$('#'+id).addClass("activated");
					}
				}
			}
		});

		// when a square's data changes in Firebase, update its color
		cells.on('child_changed', function(snapshot){
			var changedCell = snapshot.val();
			if(changedCell.value == 0)
			{
				// set color to grey
				$('#'+changedCell.name).removeClass("activated");
			}
			else
			{
				// set color to green
				$('#'+changedCell.name).addClass("activated");

			}
		});

		// when you click a square, update the corresponding data in the Firebase.
		$('.column').fastClick(function(e){
			e.preventDefault();
			var id = $(this).attr('id');
			var cell = cells.child(id);
			cell.once('value', function(snapshot){
				if(snapshot.val().value == 0)
				{
					cell.update({
						"name": id,
						"value": 1
					});
				}
				else
				{
					cell.update({
						"name": id,
						"value": 0
					});
				}
			});
		});
	}]);

	app.controller('CanvasController', [function(){

		$('.canvasbutton').css('color', 'rgb(100,200,100)');
		$('.matrixbutton').css('color', 'white');

		// set up some globals
		var lastPoint = null, mouseDown = 0, pixSize = 1, currentColor = "000";
		var newref = null;

		// set up some buttons
		$('#pen').fastClick(function(){
			currentColor = "000";
			$('#pen').addClass('activated');
			$('#eraser').removeClass('activated');
		});
		$('#eraser').fastClick(function(){
			currentColor = "fff";
			$('#eraser').addClass('activated');
			$('#pen').removeClass('activated');
		});
		$('#clear').fastClick(function(){
			lines.set(null);
		});

		// set up the canvas
		var canvas = document.getElementById('myCanvas');
		var context = canvas.getContext ? canvas.getContext('2d') : null;
	    if (context == null) {
			alert("You must use a browser that supports HTML5 Canvas to run this demo.");
			return;
	    }
		// resize canvas based on window size
		var container = $('#myCanvas').parent();
		$(window).resize(resizeCanvas);
		function resizeCanvas()
		{
			$('#myCanvas').attr('width', $(container).width());
			$('#myCanvas').attr('height', $(container).height());
		}
		// resize on page load
		resizeCanvas();

		/*--V--V-------------------drawing functions-------------------V--V--*/

		// local set of pixels; we will add pixels to this while drawing, then push them all into the database at once after the stroke is complete. This should reduce client-side lag while drawing.
		var pixelObj = {};

		// these functions manipulate global variables based on mouse down or mouse up
		canvas.onmousedown = function() {
			mouseDown = 1;
			// create a new stroke
			if(currentColor != "fff")
				newref = lines.push({"-10:-10" : "000"});
		}
		canvas.onmouseout = canvas.onmouseup = function()
		{
			// push current stroke into the database
			if(newref != null)
				newref.set(pixelObj);
			pixelObj = {};
			mouseDown = 0;
			lastPoint = null;
			newref = null;
		}
		function onTouchStart(e)
		{
			// create a new stroke
			if(currentColor != "fff")
				newref = lines.push({"-10:-10" : "000"});
			drawLineOnMouseMove(e);
		}
		function onTouchEnd(e)
		{
			// push current stroke into the database
			if(newref != null)
				newref.set(pixelObj);
			pixelObj = {};
			newref = null
			lastPoint = null;

		}

		// let's draw pictures. lifted partially from the Firebase tutorial, modified to work for touch and to store strokes in addition to pixels.
		var drawLineOnMouseMove = function(e) {
			if(!e.touches)
			{
				if (!mouseDown) return;
			}

			e.preventDefault();

			// Bresenham's line algorithm. We use this to ensure smooth lines are drawn
			var offset = $('canvas').offset();

			// calculating the coordinates is slightly different for mobile and desktop, so this figures it out
			var x1 = e.touches ? Math.floor((e.touches[0].pageX - e.touches[0].target.offsetParent.offsetLeft) / pixSize - 1) : Math.floor((e.pageX - offset.left) / pixSize - 1),
			y1 = e.touches ? Math.floor((e.touches[0].pageY - e.touches[0].target.offsetParent.offsetTop) / pixSize - 1) : Math.floor((e.pageY - offset.top) / pixSize - 1);

			var x0 = (lastPoint == null) ? x1 : lastPoint[0];
			var y0 = (lastPoint == null) ? y1 : lastPoint[1];
			var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
			var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
			while (true) {

			// draw a pixel, store it in our pixel object. when the stroke ends, we will push that object into the database.
				if(currentColor != "fff")
				{
					context.fillStyle = "#" + currentColor;
					context.fillRect(x0 * pixSize, y0 * pixSize, pixSize, pixSize);
					pixelObj[x0 + ":" + y0] = currentColor;
				}
				else
				{
					// erase entire strokes
					lines.once('value', function(snapshot)
					{
						snapshot.forEach(function(childSnapshot)
						{
							if(childSnapshot.val()[x0 + ":" + y0] != null)
								childSnapshot.ref().remove();
						});
					});
				}

				if (x0 == x1 && y0 == y1) break;
				var e2 = 2 * err;
				if (e2 > -dy) {
					err = err - dy;
					x0 = x0 + sx;
				}
				if (e2 < dx) {
					err = err + dx;
					y0 = y0 + sy;
				}
			}
			lastPoint = [x1, y1];
		};


		$(myCanvas).mousemove(drawLineOnMouseMove);
		$(myCanvas).mousedown(drawLineOnMouseMove);
		canvas.addEventListener('touchstart', onTouchStart, false);
		canvas.addEventListener('touchmove', drawLineOnMouseMove, false);
		canvas.addEventListener('touchend', onTouchEnd, false);

		// Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
		// Note that child_added events will be fired for initial pixel data as well.
		var drawPixel = function(snapshot) {
			// due to the way Firebase handles the child_added event and how I set up the database, this loop iterates over all pixels in the stroke and redraws it. 
			for(e in snapshot.val())
			{
				var coords = e.split(":");
				context.fillStyle = "#" + e;
				context.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);	
			}
		};
		var clearPixel = function(snapshot) {
			// clear every pixel associated with a particular stroke
			for(e in snapshot.val())
			{
				var coords = e.split(":");
				context.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
			}
			// redraw all strokes, just in case strokes overlap and erasing one line leaves some pixels from the other lines missing
			lines.once('value', function(snapshot)
			{
				snapshot.forEach(function(e){
					drawPixel(e);
				});
			});
		};
		lines.on('child_added', drawPixel);
		lines.on('child_changed', drawPixel);
		lines.on('child_removed', clearPixel);
	}]);
})();