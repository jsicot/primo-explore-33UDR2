import { viewName } from './viewName';

angular.module('embedVideo', []).component('prmServiceDetailsAfter', {
    bindings: { parentCtrl: '<' },
    controller: ['$scope', '$http', '$element', function controller($scope, $http, $element) {
        this.$onInit = function() {
            var obj = $scope.$ctrl.parentCtrl.item.pnx.links;
            if (obj.hasOwnProperty("addlink")) {
                var links = obj['addlink'];
                var total_links = links.length;
                if (total_links > 0) {
                    for (var i = 0; i < links.length; i++) {
                        if (links[i].includes("mp4") && links[i].includes("canal-u")) {
                            var embedUrl = links[i];
                            $scope.embedUrl = embedUrl;
                            var embedObject = '<video ng-if="embedUrl" width="320" height="240" controls><source ng-if="embedUrl" src="' + embedUrl + '" type="video/mp4">Your browser does not support the video tag.</video>'
                            var myElements = angular.element(document.querySelector('#getit_link1_0 > div > prm-full-view-service-container > div.section-body'));
                            myElements.append(embedObject);
                        }
                        break;
                    }
                }
            }
        };
    }],
});