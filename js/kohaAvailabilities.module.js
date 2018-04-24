angular.module('kohaAvailabilities', []).component('prmSearchResultAvailabilityLineAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaavailService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
      var obj = $scope.$ctrl.parentCtrl.result.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var recordid = obj.recordid[0];
        var type = $scope.$ctrl.parentCtrl.result.pnx.display.type[0];
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
	              $scope.kohaDisplay = false;
	              console.log("it's false");
	              $scope.kohaClass = "ng-hide";
	            } else {
	              $scope.kohaDisplay = true;
	              $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
	              $scope.kohaClass = "ng-show";
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
        } else {
          $scope.kohaDisplay = false;
        }
      } else {
        $scope.kohaClass = "ng-hide";
      }
    };
  },
  
  template: ` 
<a class="neutralized-button arrow-link-button md-button md-primoExplore-theme md-ink-ripple" type="button" prm-brief-internal-button-marker="">
<span class="button-content">
	<span ng-if="status" class="availability-status {{class}}">{{status}} 
	<span ng-if="branch"  class="best-location-library-code locations-link">{{branch}}</span>
	<span ng-if="location"  class="best-location-sub-location locations-link">{{location}}</span> 
	<span ng-if="callnumber"  class="best-location-delivery locations-link">{{callnumber}}</span>
</span>
<span ng-if="otherLocations > 0" ng-bind-html="&nbsp;"></span>
<span ng-if="otherLocations > 0">et {{otherLocations}} autre<span ng-if="otherLocations > 1">s</span> exemplaire<span ng-if="otherLocations > 1">s</span></span>
<div class="md-ripple-container" style=""></div></a>
 `
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

