angular
  .module('kohaLists', [])
  .component('kohaLists', {
    templateUrl: 'custom/33UDR2_VU1/html/koha-lists.html',
    controller: ['$scope', 'kohalistsService', function ($scope, kohalistsService) {
      $scope.loading = true;
      var url = "https://catalogue.bu.univ-rennes2.fr/data/publiclists.json";
      var response = kohalistsService.getLists(url).then(function (response) {
	       $scope.loading = false;
	       $scope.lists =response.data;
	       console.log(response.data);
      
        });
      
    }],
  })
  .factory('kohalistsService', ['$http', function ($http) {
  return {
    getLists: function getLists(url) {
      return $http({
        method: 'JSONP',
        url: url
      });
    }
  };
}])
.run(function ($http) {
  // Necessary for requests to succeed...not sure why
  $http.defaults.headers.common = { 'X-From-ExL-API-Gateway': undefined };
});