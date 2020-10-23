import { viewName } from '.././viewName';

angular
    .module('kohaLists', [])
    .component('kohaLists', {
        templateUrl: 'custom/' + viewName + '/html/koha-lists.html',
        controller: ['$scope', '$http', function($scope, $http) {
            $scope.loading = true;
            $scope.vid = viewName;
            var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/getPublicLists.php";
            $http({
                method: 'JSONP',
                url: url,
                headers: {
                    'Content-Type': 'application/json',
                    'X-From-ExL-API-Gateway': undefined
                },
                cache: true,
            }).then(function(response) {
                $scope.loading = false;
                $scope.lists = response.data;
                console.log(response.data);

            });

        }],
    });