angular.module('kohaItems', []).component('prmOpacAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaitemsService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
      var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
      var openurl;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
        if (bn && source == "33UDR2_KOHA" && type != "journal") {
          var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
          var response = kohaitemsService.getKohaData(url).then(function (response) {
            var items = response.data.record[0].item;
            var kohaid = response.data.record[0].biblionumber;
            var imagePath = response.data.record[0].cover;
            if (kohaid === null) {
              $scope.kohaDisplay = false;
              $scope.kohaClass = "ng-hide";
            } else {
              $scope.kohaid = kohaid;
              $scope.items = items;
              $scope.kohaDisplay = true;
              $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
              $scope.kohaClass = "ng-show";
            }
          });
        } else if (bn && source == "33UDR2_KOHA" && type == "journal") {
	      	var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=journals&q="+ bn;
		  	var response = kohaitemsService.getKohaData(url).then(function (response) {
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
				 $window.open('https://catalogue.bu.univ-rennes2.fr/bib/'+ bn, '_blank');
			};
		} 
		
		var delivery = $scope.$ctrl.parentCtrl.item.delivery;
		if (delivery != undefined) {
			for (var i = 0 ; i < delivery.link.length ; i++){
				if (delivery.link[i].displayLabel == "openurl") {
					openurl = delivery.link[i].linkURL;
				}
			}
		}
		if (openurl != undefined){
			openurl = openurl.replace(/.+\?/, "");
			$scope.proxifiedurl = "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/getSfx.php?"+openurl;
			$http.jsonp($scope.proxifiedurl).then(function(response) {
				if (response.data.error == undefined) {
					 var keys = Object.keys(response.data);
					 var len = keys.length;
					 console.log("SFX results: "+len);
					 if(len > 0) {
						  $scope.sfxholdings = response.data;
					 }
				}
			}).catch(function(e) {
				console.log(e);
			});
		}
		
		
      } 
    };
  },
  templateUrl: 'custom/33UDR2_VU1/html/prmOpacAfter.html'
}).factory('kohaitemsService', ['$http', function ($http) {
  return {
    getKohaData: function getKohaData(url) {
      return $http({
        method: 'JSONP',
        url: url
      });
    }
  };
}]).run(function ($http) {
  // Necessary for requests to succeed...not sure why
  $http.defaults.headers.common = { 'X-From-ExL-API-Gateway': undefined };
});

