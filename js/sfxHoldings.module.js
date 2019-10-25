import { viewName } from './viewName';

angular.module('sfxHoldings', []).component('prmViewOnlineAfter', {
    bindings: { parentCtrl: '<' },
    controller: ['$scope', '$http', '$element', function controller($scope, $http, $element) {
        this.$onInit = function() {
            var obj = $scope.$ctrl.parentCtrl.item.linkElement.links[0];
            console.log(obj);
            if (obj.hasOwnProperty("getItTabText") && obj.hasOwnProperty("displayText") && obj.hasOwnProperty("isLinktoOnline") && obj.hasOwnProperty("link")) {
                if (obj['displayText'] == "openurlfulltext") {
                    $scope.sfxloading = true;
                    console.log(obj);
                    console.log(obj['link']);
                    var openurl = obj['link'];
                    var openurlSvc = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", "https://catalogue.bu.univ-rennes2.fr/r2microws/getSfx.php");
                    $http({
                        method: 'JSONP',
                        url: openurlSvc,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-From-ExL-API-Gateway': undefined
                        },
                        cache: true,
                    }).then(function(response) {
                        var holdings = response.data;
                        if (holdings === null) {

                        } else {

                            if (angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme')).length > 0) {
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
    templateUrl: 'custom/' + viewName + '/html/prmViewOnlineAfter.html'
});