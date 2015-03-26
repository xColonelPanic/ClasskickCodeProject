(function(){
	var app = angular.module('appControllers',[]);
	var ref = new Firebase('https://dazzling-heat-6655.firebaseio.com/');
	var connected = new Firebase('https://dazzling-heat-6655.firebaseio.com/.info/connected');
	var cells = new Firebase('https://dazzling-heat-6655.firebaseio.com/cells');
	var lines = new Firebase('https://dazzling-heat-6655.firebaseio.com/lines');
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
				console.log("connected");
			}
			else
			{
				// make the indicator red
				$('.indicator').removeClass('connected');
				console.log("disconnected");
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
		$('.column').click(function(){
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


		var lastPoint = null, mouseDown = 0, pixSize = 2, currentColor = "000";

		$('#pen').click(function(){
			currentColor = "000";
			$('#pen').addClass('activated');
			$('#eraser').removeClass('activated');
		});
		$('#eraser').click(function(){
			currentColor = "fff";
			$('#eraser').addClass('activated');
			$('#pen').removeClass('activated');
		});
		$('#clear').click(function(){
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
		// set up other canvas things
		canvas.onmousedown = function() {mouseDown = 1;}
		canvas.onmouseout = canvas.onmouseup = function()
		{
			mouseDown = 0;
			lastPoint = null;
		}
		// let's draw pictures
		var drawLineOnMouseMove = function(e) {
			if (!mouseDown) return;

			e.preventDefault();

			// Bresenham's line algorithm. We use this to ensure smooth lines are drawn
			var offset = $('canvas').offset();
			var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
			y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
			var x0 = (lastPoint == null) ? x1 : lastPoint[0];
			var y0 = (lastPoint == null) ? y1 : lastPoint[1];
			var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
			var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
			while (true) {
			//write the pixel into Firebase, or if we are drawing white, remove the pixel
				lines.child(x0 + ":" + y0).set(currentColor === "fff" ? null : currentColor);

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


	 //    var start = function(e) {
	 //        var touchEvent = e.originalEvent.changedTouches[0];
	 //        context.beginPath();  
	 //        context.moveTo(touchEvent.pageX, touchEvent.pageY);
	 //    };
		// var move = function(e) {
		//     var touchEvent = e.originalEvent.changedTouches[0];
		//     e.preventDefault();
		//     context.lineTo(touchEvent.pageX, touchEvent.pageY);
		//     context.stroke();
		// };
		// $(myCanvas).touchstart(start);
		// $(myCanvas).touchmove(move);


		// Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
		// Note that child_added events will be fired for initial pixel data as well.
		var drawPixel = function(snapshot) {
			var coords = snapshot.key().split(":");
			context.fillStyle = "#" + snapshot.val();
			context.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
		};
		var clearPixel = function(snapshot) {
			var coords = snapshot.key().split(":");
			context.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
		};
		lines.on('child_added', drawPixel);
		lines.on('child_changed', drawPixel);
		lines.on('child_removed', clearPixel);
	}]);
})();