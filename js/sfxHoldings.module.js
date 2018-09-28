angular.module('sfxHoldings', []).component('prmViewOnlineAfter', {
  bindings: { parentCtrl: '<' },
    controller: ['$scope', '$http', '$element', 'sfxholdingsService', function controller($scope, $http, $element, sfxholdingsService) {
      this.$onInit = function () {
      var obj = $scope.$ctrl.parentCtrl.item.linkElement.links[0];
      if (obj.hasOwnProperty("getItTabText") && obj.hasOwnProperty("displayText") && obj.hasOwnProperty("isLinktoOnline") && obj.hasOwnProperty("link")) {
        if (obj['displayText'] == "openurlfulltext") {
	      $scope.sfxloading = true;
	      console.log(obj);
	      console.log(obj['link']);
          var openurl = obj['link'];
          var openurlSvc = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb","https://catalogue.bu.univ-rennes2.fr/r2microws/getSfx.php");
          var response = sfxholdingsService.getSfxData(openurlSvc).then(function (response) {
            var holdings = response.data;
            if (holdings === null) {
	            
            } else {
 	          
 	         if(angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme')).length > 0) {
	 	         angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme'))[0].style.display = "none"; 
 	         }
	          $scope.sfxloading = false;
 	          console.log(holdings);
              $scope.sfxholdings = holdings;
            }
          });
        } 
      } 
    };
  }],
  templateUrl: 'custom/33UDR2_VU1/html/prmViewOnlineAfter.html'
}).factory('sfxholdingsService', ['$http', function ($http) {
  return {
    getSfxData: function getSfxData(url) {
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
