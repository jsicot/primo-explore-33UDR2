angular.module('kohaAvailabilities', []).component('prmBriefResultAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaavailService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
      var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var recordid = obj.recordid[0];
        var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
/*
        console.log("source:" + bn);
        console.log("biblionumber:" + bn);
*/
        if (bn && source == "33UDR2_KOHA" && type != "journal") {
          var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getItems.php?biblionumber=" + bn;
          var response = kohaavailService.getKohaData(url).then(function (response) {
	         if(response){
	            console.log("it worked");
	//             console.log(response);
	            var items = response.data;
	            console.log(items);
	            var availability = items.available;
	            console.log(availability);
	            if (availability === null) {
	              console.log("it's false");
	            } else {
	              $scope.kohaDisplay = true;
	              $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
	              $scope.status = items.status;
	              $scope.recordid = recordid;
	              $scope.branch = items.homebranch;
	              $scope.location = items.location;
	              $scope.class = items.class;
	              $scope.callnumber = items.itemcallnumber;
	              $scope.otherLocations = (items.total - 1);

	            }
	         }
          });
        } 
      } 
    };
  },
  templateUrl: 'custom/33UDR2_VU1/html/prmBriefResultAfter.html'
}).factory('kohaavailService', ['$http', function ($http) {
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

