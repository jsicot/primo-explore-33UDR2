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
<prm-search-result-availability-koha ng-if="status">
  <div layout="row" layout-align="start start" class="layout-align-start-start layout-row"><!---->
  <div layout="flex" class="layout-row"><!---->
  <!---->
 <prm-icon  availability-type="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="book-open">
 	<md-icon md-svg-icon="primo-ui:book-open" alt="" class="md-primoExplore-theme" aria-hidden="true">
 		<svg id="book-open" width="100%" height="100%" viewBox="0 0 24 24" y="480" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V7.5L21,13V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,19.15 12,20V13L12,8.5V6.5C10.55,5.4 8.45,5 6.5,5V5Z"></path></svg>
    </md-icon>
  <prm-icon-after parent-ctrl="$ctrl"></prm-icon-after></prm-icon>
  <!---->
  <button class="neutralized-button md-button md-primoExplore-theme md-ink-ripple" type="button"  prm-brief-internal-button-marker="" ng-click="$ctrl.handleAvailability($index, $event);$event.preventDefault();" aria-label="{{status}} {{branch}}" title="{{status}} {{branch}}">
  <span class="button-content">
	  <span ng-if="status" class="availability-status {{class}}" ng-class="{'text-rtl': $ctrl.switchToLtrString()}">{{status}} 
		  <span ng-if="branch"  class="best-location-library-code locations-link">{{branch}}</span> 
		  <span ng-if="location" class="best-location-sub-location locations-link">{{location}}</span>
		  <span ng-if="callnumber" class="best-location-delivery locations-link">{{callnumber}}</span>
		  <span ng-if="otherLocations > 0" ng-bind-html="&nbsp;"></span>
		  <span ng-if="otherLocations > 0">et {{otherLocations}} autre<span ng-if="otherLocations > 1">s</span> exemplaire<span ng-if="otherLocations > 1">s</span></span>
	  </span><!----> 
	  <!---->
  <!---->
 </span>
 <!---->

 <prm-icon link-arrow="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="chevron-right">
 	<md-icon md-svg-icon="primo-ui:chevron-right" alt="" class="md-primoExplore-theme" aria-hidden="true">
 		<svg id="chevron-right" width="100%" height="100%" viewBox="0 0 24 24" y="384" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>
        </md-icon>
		<prm-icon-after parent-ctrl="$ctrl"></prm-icon-after>
 </prm-icon>
 <div class="md-ripple-container" style=""></div></button>
</div><!----></div><!----></prm-search-result-availability-koha>
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

