angular.module('kohaItems', []).component('prmOpacAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: ['$scope', '$mdDialog', '$http', '$element', 'kohaitemsService', function controller($scope, $mdDialog, $http, $element, kohaitemsService) {
        this.$onInit = function () {
            if ($scope.$ctrl.parentCtrl.item) {
                var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
                var openurl;
                //init loading
                $scope.loading = true;
                if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
                    var recid = obj.recordid[0];
                    var ids = obj.sourcerecordid;
                    var total_ids = ids.length;
                    var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
                    if (total_ids > 0) {
                        var items = [];
                        var journalholdings = [];
                        var branches = [];
                        var status = [];
                        for (var i = 0; i < ids.length; i++) {
                            if (ids[i].startsWith("$$V") && ids[i].includes("33UDR2_KOHA")) {
                                var source = "33UDR2_KOHA";
                                var bn = ids[i].replace(/\$\$V.+\$\$O33UDR2_KOHA/, "");
                            } else {
                                var source = obj.sourceid[0];
                                var bn = obj.sourcerecordid[0];
                            }
                            if (bn && source == "33UDR2_KOHA") {
                                console.log("biblionumber:" + bn)
                                var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
                                var response = kohaitemsService.getKohaData(url).then(function (response) {
                                    if (response.data.record[0]) {
                                        //Book Items
                                        if (response.data.record[0].item && type !== "journal") {
                                            $scope.kohaitems_loading = true;
                                            $scope.loading = false;
                                            var kohaitems = response.data.record[0].item
                                            for (var i = 0; i < kohaitems.length; i++) {
                                                if (kohaitems[i].withdrawnstatus == 'false' && kohaitems[i].itemlost == "0") {
                                                    items.push(kohaitems[i]);
                                                    $scope.kohaitems_loading = false;

                                                    var itemstatus = kohaitems[i].istatus;
                                                    if (itemstatus.startsWith("Emprunt")) {
                                                        itemstatus = "Emprunt\u00e9";
                                                    }
                                                    if (!(branches.indexOf(kohaitems[i].homebranch) !== -1)) {
                                                        branches.push(kohaitems[i].homebranch);
                                                    }
                                                    if (!(status.indexOf(itemstatus) !== -1)) {
                                                        status.push(itemstatus);
                                                    }
                                                }
                                            }
                                        //Journal Holdings   
                                        } else if (response.data.record[0].holdings && type === "journal") {
                                            $scope.kohajholdings_loading = true;
                                            if (recid.startsWith("dedupmrg")) {
                                                if (angular.element(document.querySelector('#getit_link1_0')).length > 0) {
                                                    angular.element(document.querySelector('#getit_link1_0'))[0].style.display = "none";
                                                }
                                            }
                                            var kohaholdings = [];
                                            for (var i = 0; i < response.data.record[0].holdings.length; i++) {
                                                var holding = response.data.record[0].holdings[i]
                                                console.log(response.data.record[0]);
                                                kohaholdings[i] = {
                                                    "library": holding["rcr"],
                                                    "holdings": holding["holdings"]
                                                };
                                                if (holding["holdings"].length > 80) {
                                                    kohaholdings[i]["holdingsSummary"] = holding["holdings"].substring(0, 77) + "...";
                                                }
                                                for (var j = 0; j < response.data.record[0].locations.length; j++) {
                                                    if (response.data.record[0].locations[j]["rcr"] == holding["rcr"]) {
                                                        kohaholdings[i]["callnumber"] = response.data.record[0].locations[j]["callnumber"];
                                                        kohaholdings[i]["location"] = response.data.record[0].locations[j]["location"];
                                                    }
                                                }
                                                journalholdings.push(kohaholdings[i]);
                                                $scope.kohajholdings_loading = false;
                                                $scope.loading = false;
                                            }

                                        } else {
                                            console.log("journal : no holdings");
                                            if (!angular.element(document.querySelector('#getit_link1_1 > div > prm-full-view-service-container > div.section-body prm-view-online')).length > 0) {
                                                angular.element(document.querySelector('#getit_link1_1')).addClass("hide");
                                            }
                                            if (!angular.element(document.querySelector('#getit_link1_0 > div > prm-full-view-service-container > div.section-body prm-view-online')).length > 0) {
                                                angular.element(document.querySelector('#getit_link1_0')).addClass("hide");
                                            }
                                        }
                                    }
                                }, function (response) {
                                    $scope.loading = false;
                                });
                            }
                            else {
                                $scope.loading = false;
                            } 
                        }

                        if (items) {                           
                            $scope.items = items;
                            $scope.branches = branches;
                            $scope.status = status;                            
                        }
                        if (journalholdings) {
                            $scope.kohaholdings = journalholdings;
                        }

                        var delivery = $scope.$ctrl.parentCtrl.item.delivery;
                        if (delivery != undefined) {
                            for (var i = 0; i < delivery.link.length; i++) {
                                if (delivery.link[i].displayLabel == "openurl") {
                                    openurl = delivery.link[i].linkURL;
                                    console.log("openurl : " + openurl);
                                }
                            }
                        }

                        if (openurl != undefined) {
                            $scope.sfxloading = true;
                            $scope.proxifiedurl = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", "https://catalogue.bu.univ-rennes2.fr/r2microws/getSfx.php");
                            $http.jsonp($scope.proxifiedurl).then(function (response) {
                                if (response.data.error == undefined) {
                                    var keys = Object.keys(response.data);
                                    var len = keys.length;
                                    console.log("SFX results: " + len);
                                    if (len > 0) {
                                        $scope.sfxholdings = response.data
                                        $scope.sfxloading = false;
                                    }
                                }
                            }, function (response) {
                                $scope.sfxloading = false;
                            });
                        }

                        $scope.showRequestItem = function ($event) {
                            $mdDialog.show({
                                parent: angular.element(document.body),
                                clickOutsideToClose: true,
                                fullscreen: false,
                                targetEvent: $event,
                                templateUrl: 'custom/33UDR2_VU1/html/requestItem.html',
                                controller: function ($scope, $mdDialog, $http) {
                                    $scope.cancelReport = function () {
                                        $mdDialog.cancel();
                                    }
                                }
                            });
                        };



                    }
                }
            }
        };
    }],
    templateUrl: 'custom/33UDR2_VU1/html/prmOpacAfter.html'
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
    $http.defaults.headers.common = {
        'X-From-ExL-API-Gateway': undefined
    };
});