angular.module('kohaItems', []).component('prmFullViewServiceContainerAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaitemsService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
	  var section = $scope.$parent.$ctrl.service.scrollId;
      var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
/*
        console.log("source:" + bn);
        console.log("biblionumber:" + bn);
*/
        if (bn && section == "getit_link1_0" && source == "33UDR2_KOHA" && type != "journal") {
          var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
          var response = kohaitemsService.getKohaData(url).then(function (response) {
            console.log("it worked");
            //console.log(response);
            var items = response.data.record[0].item;
            console.log(items);
            var kohaid = response.data.record[0].biblionumber;
            var imagePath = response.data.record[0].cover;
            console.log(kohaid);
            if (kohaid === null) {
              $scope.kohaDisplay = false;
              console.log("it's false");
              $scope.kohaClass = "ng-hide";
            } else {
              $scope.kohaid = kohaid;
              $scope.items = items;
              $scope.kohaDisplay = true;
              $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
              $scope.kohaClass = "ng-show";
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
 <!--<pre>{{items | json}}</pre>-->
<div class="padding-left-medium">
<md-list class="separate-list-items margin-bottom-medium padding-bottom-zero md-primoExplore-theme"" role="list">
<md-list-item class="md-2-line _md-no-proxy _md" ng-repeat="item in items track by $index" role="listitem" ng-show="{{kohaDisplay}}" class="{{kohaClass}} role="listitem"">
<div class="layout-full-width layout-display-flex md-ink-ripple layout-row" layout="flex">
	<div layout="row" flex="100" layout-align="space-between center" class="layout-align-space-between-center layout-row flex-100">
		<div class="md-list-item-text layout-wrap layout-row flex" layout="row" layout-wrap="" flex="">
			<div flex="" flex-xs="100" class="flex-xs-100 flex">
   			<h3>{{item.homebranch}}</h3>
				<p>
					<span ng-if="item.istatus" class="availability-status {{item.statusClass}}">{{item.istatus}}</span> 
					<span>,</span> 
					<span>{{item.location}}</span>
					<span>;</span> 
					<span>{{item.itemcallnumber}}</span>
				</p>
			</div>
	</div>
</div>
</div>
</md-list-item>
</md-list>
</div>
  `
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

