angular.module('libraryhours', []).component('prmSearchBookmarkFilterAfter', {
	bindings: { parentCtrl: '<' },
	controller: ['$scope', '$mdDialog', function controller($scope, $mdDialog) {
		this.$onInit = function () {
			var alert;
			$scope.showDialog = showDialog;
			$scope.items = [1, 2, 3];	
			
			function showDialog($event) {
				var parentEl = angular.element(document.getElementsByTagName("primo-explore")[0]);
				$mdDialog.show({
					parent: parentEl,
					targetEvent: $event,
					templateUrl: 'custom/33UDR2_VU1/html/libraryHoursDialog.html',
					locals: {
						items: $scope.items
					},
					controller: function($scope, $mdDialog, $http) {
						$scope.libhoursloading = true;
						$scope.serhoursloading = true;
						$http.post("https://www.bu.univ-rennes2.fr/views/ajax","view_name=libraries_views&view_display_id=hours_sidebar_libraries_tab&view_args=",{
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded ; charset=UTF-8'
							}
						}).then(function mySuccess(response) {
							if (response.data != undefined) {
								$scope.libhoursloading = false;
								var librarieshours = response.data[1].data.replace(/<a.+>/g,'').replace(/<\/a>/g,'');
								$scope.librarieshours = parseTimes(librarieshours);
							}
						}, function myError(response) {
							$scope.libhoursloading = false;
							$scope.libhourserror = response;
						});
						$http.post("https://www.bu.univ-rennes2.fr/views/ajax","view_name=services_views&view_display_id=hours_sidebar_services_tab&view_args=",{
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded ; charset=UTF-8'
							}
						}).then(function mySuccess(response) {
							if (response.data != undefined) {
								$scope.serhoursloading = false;
								var serviceshours = response.data[1].data.replace(/<a.+>/g,'').replace(/<\/a>/g,'');
								$scope.serviceshours = parseTimes(serviceshours);
							}
						}, function myError(response) {
							$scope.serhoursloading = false;
							$scope.serhourserror = response;
						});
						$scope.closeDialog = function() {
							$mdDialog.hide();
						}
					}
				});
			}
			
			function parseTimes(myDomString) {
				var d = new Date();
				var now = d.getHours()*100+d.getMinutes();
				var parser = new DOMParser();
				var doc = parser.parseFromString(myDomString, "text/html");
				var lis = doc.getElementsByTagName("li");
				[].forEach.call(lis, function(li) {
					var hourtext = li.getElementsByClassName("hour-text")[0];
					if (hourtext.textContent == "Fermée") {
						hourtext.classList.add("closed");
						li.getElementsByClassName("menu-icon")[0].classList.add("closed");
					} else {
						var times = hourtext.getElementsByTagName("time");
						var open = 0;
						for( var i = 0 ; i < times.length ; i++) {
							var time = times[i]
							var split = time.textContent.split(":");
							var t = split[0]+split[1];
							console.log(t);
							if (time.classList.contains("starttime")) {
								if (now >= t) {
									open++;
								}
							} else if (time.classList.contains("endtime")) {
								if (now <= t) {
									open++;
								}
								if (open == 2) {
									hourtext.classList.add("open");
									li.getElementsByClassName("menu-icon")[0].classList.add("open");
									i = 9000;
								} else {
									open = 0;
								}
							}
						}
						if (open == 0) {
							hourtext.classList.add("closed");
							li.getElementsByClassName("menu-icon")[0].classList.add("closed");
						}
					}
				});
				var serializer = new XMLSerializer();
				return serializer.serializeToString(doc);
			}
		}
	}],
	templateUrl: 'custom/33UDR2_VU1/html/prmSearchBookmarkFilterAfter.html'
});