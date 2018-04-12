(function () {
    "use strict";
    'use strict';

    var app = angular.module('viewCustom', ['angularLoad']);

    /****************************************************************************************************/

        /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

        /*var app = angular.module('centralCustom', ['angularLoad']);*/

    /****************************************************************************************************/

    app.config([
        '$sceDelegateProvider', function ($sceDelegateProvider) {
            var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
            urlWhitelist.push('https://catalogue.bu.univ-rennes2**');
			urlWhitelist.push('https://cataloguepreprod.bu.univ-rennes2**');
			urlWhitelist.push('http://sfx-univ-rennes2.hosted.exlibrisgroup**');
            $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
        }
    ]);
	
	app.controller('prmOpacAfterController', ['$scope', '$http', '$window', function($scope, $http, $window) {
		var vm = this;
        var openurl;
		console.log(vm.parentCtrl.item.pnx);
		angular.element(document).ready(function () {
			if (!(vm.parentCtrl.item.pnx.display.type[0] == "journal") || !(vm.parentCtrl.item.pnx.control.sourceid[0] == "33UDR2_KOHA")) {	
				angular.element(document.querySelector('prm-opac > md-tabs'))[0].style.display = "block";
			}
		});
		/*var links = vm.parentCtrl.item.linkElement.links;
		if (links != undefined) {
			for (var i = 0 ; i < links.length ; i++){
				if (links[i].displayText == "openurl") {
					openurl = links[i].link;
				}
			}
		}*/
		var delivery = vm.parentCtrl.item.delivery;
		if (delivery != undefined) {
			for (var i = 0 ; i < delivery.link.length ; i++){
				if (delivery.link[i].displayLabel == "openurl") {
					openurl = delivery.link[i].linkURL;
				}
			}
		}
		if (vm.parentCtrl.item.pnx.control.sourceid[0] == "33UDR2_KOHA") {
			$scope.sruUrl = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=journals&q="+vm.parentCtrl.item.pnx.control.sourcerecordid[0];
			$http.jsonp($scope.sruUrl).then(function(response) {
				if (response.data.record != undefined && response.data.record.length > 0) {
					console.log(response.data.record);
					$scope.kohaholdings = [];
					for (var i = 0 ; i < response.data.record[0].holdings.length ; i++) {
						var holding = response.data.record[0].holdings[i]
						$scope.kohaholdings[i] = {
							"library" : holding["rcr"],
							"holdings" : holding["holdings"]
						};
						if (holding["holdings"].length > 80) {
							$scope.kohaholdings[i]["holdingsSummary"] = holding["holdings"].substring(0,77)+"...";
						}
						if (response.data.record[0].locations[i]["rcr"] ==  holding["rcr"]) {
							$scope.kohaholdings[i]["callnumber"] =  response.data.record[0].locations[i]["callnumber"];
							$scope.kohaholdings[i]["location"] =	response.data.record[0].locations[i]["location"];
						}
					}
				}
			});
			this.onClick = function() {
				 $window.open('https://catalogue.bu.univ-rennes2.fr/bib/'+vm.parentCtrl.item.pnx.control.sourcerecordid[0], '_blank');
			};
		}
		if (openurl != undefined){
			openurl = openurl.replace(/.+\?/, "");
			$scope.proxifiedurl = "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/sfxproxy.php?"+openurl;
			$http.jsonp($scope.proxifiedurl).then(function(response) {
				if (response.data.error == undefined) {
					 $scope.sfxholdings = response.data.content;
				}
			}).catch(function(e) {
				console.log(e);
			});
		}
	}]);
	
	app.component('prmOpacAfter', {
        bindings: {parentCtrl: '<'},
        controller: 'prmOpacAfterController',
        templateUrl: 'custom/33UDR2_VU1/html/prmOpacAfter.html'
    });
})();

   
