angular.module('kohaItems', []).component('prmOpacAfter',  {
    bindings: {
        parentCtrl: '<'
    },
    controller: function controller($scope, $mdDialog, $http, $element, kohaitemsService) {
        this.$onInit = function() {
            if ($scope.$ctrl.parentCtrl.item) {
                $scope.kohaDisplay = false; /* default hides template */
                var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
                var openurl;
                $scope.loading = true;
                if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
                    var recid = obj.recordid[0];
                    var ids = obj.sourcerecordid;
                    var total_ids = ids.length;
                    var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
                    if (total_ids > 0) {
                        var items = [];
                        var branches = [];
                        var holdings = [];
                        for (var i = 0; i < ids.length; i++) {
                            if (ids[i].startsWith("$$V") && ids[i].includes("33UDR2_KOHA")) {
                                var source = "33UDR2_KOHA";
                                var bn = ids[i].replace(/\$\$V.+\$\$O33UDR2_KOHA/, "");
                            } else {
                                var source = obj.sourceid[0];
                                var bn = obj.sourcerecordid[0];
                            }

                            if (bn && source == "33UDR2_KOHA") {
                                var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
                                var response = kohaitemsService.getKohaData(url).then(function(response) {
                                    if (response.data.record[0]) {
                                        if (response.data.record[0].item && type !== "journal") {
                                            var kohaitems = response.data.record[0].item
                                            for (var i = 0; i < kohaitems.length; i++) {
                                                items.push(kohaitems[i]);
                                                
                                               if(!(branches.indexOf(kohaitems[i].homebranch) !== -1)) { 
                                                
                                                branches.push(kohaitems[i].homebranch);
                                                }
												//branches[kohaitems[i].branchcode] = kohaitems[i].homebranch;
                                                $scope.loading = false;
                                                $scope.onshelves = true;
                                                
                                            }
                                        } else if (response.data.record[0].holdings && type === "journal") {

	                                            if(recid.startsWith("dedupmrg")) {
													 if(angular.element(document.querySelector('#getit_link1_0')).length > 0) {
										 		       	angular.element(document.querySelector('#getit_link1_0'))[0].style.display = "none";
											         }
												}
										                                            $scope.kohaholdings = [];
                                            for (var i = 0; i < response.data.record[0].holdings.length; i++) {
                                                var holding = response.data.record[0].holdings[i]
                                                $scope.kohaholdings[i] = {
                                                    "library": holding["rcr"],
                                                    "holdings": holding["holdings"]
                                                };
                                                if (holding["holdings"].length > 80) {
                                                    $scope.kohaholdings[i]["holdingsSummary"] = holding["holdings"].substring(0, 77) + "...";
                                                }
                                                if (response.data.record[0].locations[i]["rcr"] == holding["rcr"]) {
                                                    $scope.kohaholdings[i]["callnumber"] = response.data.record[0].locations[i]["callnumber"];
                                                    $scope.kohaholdings[i]["location"] = response.data.record[0].locations[i]["location"];
                                                }
                                            }
                                        } else {
                                            console.log("journal : no print holding");
                                            $scope.loading = false;
                                        }
                                    }
                                }, function(response) {
                                    $scope.loading = false;
                                });

                            } else {
                                $scope.loading = false;
                            }
                        }
                        if(items){
	                       $scope.items = items;
						   $scope.branches = branches; 
                        }
                        
         
                        
			$scope.showRequestItem = function($event){
	            $mdDialog.show( {
	                parent: angular.element(document.body),
	                clickOutsideToClose: true,
	                fullscreen: false,
	                targetEvent: $event,
	                templateUrl: 'custom/33UDR2_VU1/html/requestItem.html', controller: function ($scope, $mdDialog, $http) {
	                    $scope.cancelReport = function () {
	                        $mdDialog.cancel();
	                    }
	                }
	            });
	        };
                        
                        
                        
                    }
                    var delivery = $scope.$ctrl.parentCtrl.item.delivery;
                    if (delivery != undefined) {
                        for (var i = 0; i < delivery.link.length; i++) {
                            if (delivery.link[i].displayLabel == "openurl") {
                                openurl = delivery.link[i].linkURL;
                            }
                        }
                    }
                    if (openurl != undefined) {
                        openurl = openurl.replace(/.+\?/, "");
                        $scope.proxifiedurl = "https://catalogue.bu.univ-rennes2.fr/r2microws/getSfx.php?" + openurl;
                        $http.jsonp($scope.proxifiedurl).then(function(response) {
                            if (response.data.error == undefined) {
                                var keys = Object.keys(response.data);
                                var len = keys.length;
                                console.log("SFX results: " + len);
                                $scope.loading = false;
                                if (len > 0) {
                                    $scope.sfxholdings = response.data
                                    
                                }
                            }
                        }, function(response) {
                                    $scope.loading = false;
                        	});
                    }
                }
            }
        };
    },
    templateUrl: 'custom/33UDR2_VU1/html/prmOpacAfter.html'
}).factory('kohaitemsService', ['$http', function($http) {
    return {
        getKohaData: function getKohaData(url) {
            return $http({
                method: 'JSONP',
                url: url
            });
        }
    };
}]).run(function($http) {
    // Necessary for requests to succeed...not sure why
    $http.defaults.headers.common = {
        'X-From-ExL-API-Gateway': undefined
    };
});