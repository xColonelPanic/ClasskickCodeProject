(function(){
	var app = angular.module('appControllers',[]);
	var ref = new Firebase('https://dazzling-heat-6655.firebaseio.com/');
	var connected = new Firebase('https://dazzling-heat-6655.firebaseio.com/.info/connected');
	var cells = new Firebase('https://dazzling-heat-6655.firebaseio.com/cells');
	var k = 3;

	app.controller('MatrixController', [function(){

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

	app.controller('CanvasController', ['$scope', '$http', '$filter', function($scope, $http, $filter){

	}]);
})();