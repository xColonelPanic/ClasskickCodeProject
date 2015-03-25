(function(){
	var app = angular.module('appControllers',[]);
	var ref = new Firebase('https://dazzling-heat-6655.firebaseio.com/');
	var cells = new Firebase('https://dazzling-heat-6655.firebaseio.com/cells');
	var k = 3;

	app.controller('MatrixController', ['$scope', '$http', '$filter', function($scope, $http, $filter){

		cells.once('value', function(snapshot){
			var allCells = snapshot.val();
			for(i = 0 ; i < 2*k ; i ++)
			{
				for(j = 0; j < k ; j ++)
				{
					var id = "cell" + i + j;
					// use jquery to set each cell's color initially
					// console.log(allCells[id].name);
					// console.log(allCells[id].value);
					// console.log(allCells[id].name + ": " + allCells[id].value);
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

		cells.on('child_changed', function(snapshot){
			var changedCell = snapshot.val();
			// console.log("changing " + changedCell.name);
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

		// $('#cell00').click(function(){
		// 	console.log("cell00");
		// });
		// $('#cell01').click(function(){
		// 	console.log("cell01");
		// });
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