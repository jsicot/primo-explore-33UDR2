import { viewName } from '.././viewName';

angular.module('getThumbnail', []).component('prmSearchResultThumbnailContainerAfter', {
    bindings: { parentCtrl: '<' },
    controller: ['$scope', '$http', '$element', function controller($scope, $http, $element) {
        this.$onInit = function() {
            $scope.kohaDisplay = false; /* default hides template */
            if ($scope.$ctrl.parentCtrl.item) {
                var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
                if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
                    var recid = obj.recordid[0];
                    // console.log(recid)
                    var ids = obj.sourcerecordid;
                    var total_ids = ids.length;
                    if (total_ids > 1) {
                        var bn = [];
                        angular.forEach(ids, function(value, key) {
                            if (value.startsWith("$$V") && value.includes("33UDR2_KOHA")) {
                                this.push(value.replace(/\$\$V.+\$\$O33UDR2_KOHA/, ""));
                            }
                        }, bn);
                        var source = [];
                        angular.forEach(obj.sourceid, function(value, key) {
                            if (value.includes("33UDR2_KOHA")) {
                                this.push("33UDR2_KOHA");
                            }
                        }, source);
                    } else {
                        var source = obj.sourceid[0];
                        var bn = obj.sourcerecordid[0];
                    }
                    var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
                    if (bn && source == "33UDR2_KOHA" && type != "journal") {
                        var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/getCover.php?biblionumbers[]=" + bn;
                        $http({
                            method: 'JSONP',
                            url: url,
                            headers: {
                                'Content-Type': 'application/json',
                                'X-From-ExL-API-Gateway': undefined
                            },
                            cache: true,
                        }).then(function(response) {
                            if (response.data) {
                                var thumb = response.data[0].cover;
                                if (thumb && thumb.includes("no_img")) {
                                    thumb = null;
                                }
                                $scope.thumbnailLink = thumb; //we have the link - success
                                if (thumb && !thumb.includes("no_img")) {
                                    $element.parent().children()[0].style.display = "none";
                                }
                            }
                        });
                    }
                }
            }
        };
    }],
    templateUrl: 'custom/' + viewName + '/html/prmSearchResultThumbnailContainerAfter.html'
});