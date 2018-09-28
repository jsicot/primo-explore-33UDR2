angular.module('getThumbnail', []).component('prmSearchResultThumbnailContainerAfter', {
  bindings: { parentCtrl: '<' },
  controller: ['$scope', '$http', '$element', 'thumbnailService', function controller($scope, $http, $element, thumbnailService) { 
  this.$onInit = function () {
  	$scope.kohaDisplay = false; /* default hides template */
    if($scope.$ctrl.parentCtrl.item) { 
      var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var recid = obj.recordid[0];
        console.log(recid)
        var ids = obj.sourcerecordid;
        var total_ids = ids.length;
       if (total_ids > 1){
		    var bn = [];
	        angular.forEach(ids, function(value, key) {
				if(value.startsWith("$$V") && value.includes("33UDR2_KOHA")){
			        this.push(value.replace(/\$\$V.+\$\$O33UDR2_KOHA/,""));
		        }
			}, bn);
	        var source = [];
	        angular.forEach(obj.sourceid, function(value, key) {
				if(value.includes("33UDR2_KOHA")){
			        this.push("33UDR2_KOHA");
		        }
			}, source);
       }
       else {
	        var source = obj.sourceid[0];
	        var bn = obj.sourcerecordid[0];
       }
        var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
        if (bn && source == "33UDR2_KOHA" && type != "journal") {
          var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/getCover.php?biblionumbers[]=" + bn;
          var response = thumbnailService.getThumbSrc(url).then(function (response) {
	         if(response.data){
	            var thumb = response.data[0].cover;
	           if(thumb && thumb.includes("no_img")){
		           thumb = null;
	           }
				$scope.thumbnailLink = thumb;//we have the link - success
				if(thumb && !thumb.includes("no_img")){
					$element.parent().children()[0].style.display = "none";
				}
	         }
          });
        } 
      } 
     } 
    };
  }],
  templateUrl: 'custom/33UDR2_VU1/html/prmSearchResultThumbnailContainerAfter.html'
}).factory('thumbnailService', ['$http', function ($http) {
  return {
    getThumbSrc: function getThumbSrc(url) {
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

