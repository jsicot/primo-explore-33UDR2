import {
    viewName
} from '.././viewName';

angular.module('kohaItems', []).component('prmOpacAfter', {
        bindings: {
            parentCtrl: '<'
        },
        controller: ['$scope', '$rootScope', '$mdDialog', '$http', '$element', 'URLs', 'kohaitemsService', function controller($scope, $rootScope, $mdDialog, $http, $element, URLs, kohaitemsService) {
            this.$onInit = function() {
                if ($scope.$ctrl.parentCtrl.item) {
                    let self = this;
                    self.scope = $scope;
                    self.rootScope = $rootScope;
                    // console.log(self)
                    //console.log('rootScope')
                    //console.log(self.rootScope)
                    // console.log('rootScope - userSessionManagerService')
                    // console.log(self.rootScope.$$childHead.$ctrl.userSessionManagerService)
                    // console.log(self.rootScope.$$childHead.$ctrl.userSessionManagerService.isGuest())
                    let userData = self.rootScope.$$childHead.$ctrl.userSessionManagerService;
                    //console.log(userData);
                    //console.log(self.rootScope.$$childHead.$ctrl.userSessionManagerService.getUserLanguage())
                    //console.log(self.rootScope.$$childHead.$ctrl.userSessionManagerService.i18nService.getLanguage() )
                    var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
                    var openurl;
                    //init loading
                    let vm = this;
                    vm.closeDialog = closeDialog;
                    vm.parentCtrl.closeDialog = closeDialog;

                    function closeDialog() {
                        $mdDialog.hide();

                    }
                    $scope.vid = viewName;
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
                                    var url = URLs.koha + "r2microws/json.getSru.php?index=rec.id&q=" + bn;
                                    // console.log(url);
                                    $http({
                                        method: 'JSONP',
                                        url: url,
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-From-ExL-API-Gateway': undefined
                                        },
                                        cache: true,
                                    }).then(function(response) {
                                        if (response.data.record[0]) {
                                            //Book Items
                                            $scope.biblionumber = bn;
                                            if (response.data.record[0].item && type !== "journal") {
                                                $scope.kohaitems_loading = true;
                                                $scope.loading = false;
                                                var kohaitems = response.data.record[0].item

                                                var isclosedstacks = Object.keys(kohaitems).some(function(k) {
                                                    if (kohaitems[k].branchcode === "BU" && kohaitems[k].isfa === false) {
                                                        return kohaitems[k].statusClass === "status-ondemand";
                                                    }
                                                });

                                                // Course reserves Info
                                                // for items
                                                // -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -


                                                Object.keys(kohaitems).some(function(k) {
                                                    var itemnumber = kohaitems[k].itemnumber;
                                                    var coursesSvc = URLs.koha + "api/v1/contrib/course/item/" + itemnumber;
                                                    $http({
                                                        method: 'GET',
                                                        url: coursesSvc,
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'X-From-ExL-API-Gateway': undefined
                                                        },
                                                        cache: false,
                                                    }).then(function(response) {
                                                        if (response.data != undefined) {
                                                            //console.log(response.data);
                                                            var CR = response.data;
                                                            for (var i = 0; i < CR.length; i++) {
                                                                //console.log(CR[i].course.course_name);
                                                                kohaitems[k].courses = CR;
                                                                if (CR[i].public_note && CR[i].course.enabled === 'yes') {
                                                                    kohaitems[k].itemnotes = CR[i].public_note;
                                                                }
                                                                return kohaitems[k];
                                                            }
                                                        }
                                                    }, function(response) {});
                                                });

                                                var isavailableonshelf = Object.keys(kohaitems).some(function(k) {
                                                    return kohaitems[k].istatus === "Disponible";
                                                });
                                                $scope.isclosedstacks = isclosedstacks;
                                                $scope.isavailableonshelf = isavailableonshelf;
                                                for (var i = 0; i < kohaitems.length; i++) {
                                                    if (kohaitems[i].withdrawnstatus == 'false' && kohaitems[i].itemlost == "0") {
                                                        items.push(kohaitems[i]);
                                                        $scope.kohaitems_loading = false;
                                                        var itemstatus = kohaitems[i].istatus;
                                                        if (itemstatus.startsWith("Emprunté")) {
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
                                                // console.log(items);
                                                //Journal Holdings   
                                            } else if (response.data.record[0].holdings && type === "journal") {
                                                $scope.kohajholdings_loading = true;
                                                if (recid.startsWith("dedupmrg")) {
                                                    if (angular.element(document.querySelector('#getit_link1_0')).length > 0) {
                                                        angular.element(document.querySelector('#getit_link1_0'))[0].style.display = "none";
                                                    }
                                                }
                                                var kohaholdings = [];

                                                var isclosedstacks = Object.keys(response.data.record[0].locations).some(function(k) {
                                                    return response.data.record[0].locations[k].location === "En Magasin Périodiques";
                                                });

                                                $scope.isclosedstacks = isclosedstacks;

                                                for (var i = 0; i < response.data.record[0].holdings.length; i++) {
                                                    var holding = response.data.record[0].holdings[i]

                                                    kohaholdings[i] = {
                                                        "library": holding["rcr"],
                                                        "holdings": holding["holdings"]
                                                    };
                                                    if (holding["holdings"].length > 80) {
                                                        kohaholdings[i]["holdingsSummary"] = holding["holdings"].substring(0, 77) + "...";
                                                    }
                                                    if (response.data.record[0].locations) {
                                                        for (var j = 0; j < response.data.record[0].locations.length; j++) {
                                                            if (response.data.record[0].locations[j]["5"] == holding["5"]) {
                                                                if (response.data.record[0].locations[j]["callnumber"]) {
                                                                    kohaholdings[i]["callnumber"] = response.data.record[0].locations[j]["callnumber"];
                                                                }
                                                                if (response.data.record[0].locations[j]["location"]) {
                                                                    kohaholdings[i]["location"] = response.data.record[0].locations[j]["location"];
                                                                }
                                                            }
                                                        }
                                                    }

                                                    if (response.data.record[0].holdings_sup) {
                                                        for (var j = 0; j < response.data.record[0].holdings_sup.length; j++) {
                                                            if (response.data.record[0].holdings_sup[j]["5"] == holding["5"]) {
                                                                if (response.data.record[0].holdings_sup[j]["959"]) {
                                                                    kohaholdings[i]["gaps"] = response.data.record[0].holdings_sup[j]["959"];
                                                                }
                                                                if (response.data.record[0].holdings_sup[j]["990"]) {
                                                                    kohaholdings[i]["gaps"] = response.data.record[0].holdings_sup[j]["990"];
                                                                }
                                                                if (response.data.record[0].holdings_sup[j]["956"]) {
                                                                    kohaholdings[i]["sup"] = response.data.record[0].holdings_sup[j]["956"];
                                                                }
                                                                if (response.data.record[0].holdings_sup[j]["957"]) {
                                                                    kohaholdings[i]["tab"] = response.data.record[0].holdings_sup[j]["957"];
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //console.log(kohaholdings[i]);
                                                    journalholdings.push(kohaholdings[i]);
                                                    $scope.kohajholdings_loading = false;
                                                    $scope.loading = false;
                                                }

                                            } else {
                                                $scope.loading = false;
                                                angular.element(document.querySelector('#getit_link1_0 > div > prm-full-view-service-container > div.section-head > prm-service-header > div '))[0].style.display = "none";
                                            }

                                        }
                                    }).catch(function(response) {
                                        // error
                                        $scope.loading = false;
                                        angular.element(document.querySelector('prm-opac>md-tabs'))[0].style.display = "block";
                                    });

                                } else {
                                    $scope.loading = false;
                                }
                            }

                            //checking if service is opened/available
                            var availServiceSvc = URLs.koha + "r2microws/getAuthorisedValues.php?category=FERMETURE_SERVICES";
                            $http({
                                method: 'JSONP',
                                url: availServiceSvc,
                                cache: false,
                            }).then(function(response) {
                                if (response.data != undefined) {
                                    //console.log(response.data);
                                    if (response.data.COMMAG_BU != "") {
                                        //console.log(response.data.COMMAG_BU);
                                        $scope.avail_commagbu = false;
                                        $scope.returnMessage = response.data.COMMAG_BU;
                                    } else {
                                        $scope.avail_commagbu = true;
                                        $scope.returnMessage = "";
                                    }
                                } else {
                                    $scope.returnMessage = "Le services est temporairement hors-service, veuillez réessayer ultérieurement.";
                                }
                            }, function(response) {
                                $scope.returnMessage = "Le services est temporairement hors-service, veuillez réessayer ultérieurement.";
                            });


                            if (items) {
                                $scope.items = items;
                                //console.log(items);
                                $scope.branches = branches;
                                $scope.status = status;
                                $scope.userIsGuest = userData.isGuest();
                                //$scope.userIsGuest = false;
                            }
                            if (journalholdings) {
                                $scope.kohaholdings = journalholdings;
                                $scope.userIsGuest = userData.isGuest();
                                //$scope.userIsGuest = false;
                            }

                            if (!$scope.items || !$scope.kohaholdings) {
                                // console.log("no holdings");
                                if (!angular.element(document.querySelector('#getit_link1_1 > div > prm-full-view-service-container > div.section-body prm-view-online')).length > 0) {
                                    angular.element(document.querySelector('#getit_link1_1')).addClass("hide");
                                }
                                if (!angular.element(document.querySelector('#getit_link1_0 > div > prm-full-view-service-container > div.section-body prm-view-online')).length > 0) {
                                    angular.element(document.querySelector('#getit_link1_0')).addClass("hide");
                                }
                            }

                            var delivery = $scope.$ctrl.parentCtrl.item.delivery;
                            if (delivery != undefined) {
                                for (var i = 0; i < delivery.link.length; i++) {
                                    if (delivery.link[i].displayLabel == "openurl") {
                                        openurl = delivery.link[i].linkURL;
                                        // console.log("openurl : " + openurl);
                                    }
                                }
                            }

                            if (openurl != undefined) {
                                if (recid.startsWith("dedupmrg")) {
                                    if (angular.element(document.querySelector('#getit_link1_0')).length > 0) {
                                        angular.element(document.querySelector('#getit_link1_0'))[0].style.display = "none";
                                    }
                                }
                                $scope.sfxloading = true;
                                $scope.proxifiedurl = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", URLs.koha + "r2microws/getSfx.php");
                                $http.jsonp($scope.proxifiedurl).then(function(response) {
                                    if (response.data.error == undefined) {
                                        var keys = Object.keys(response.data);
                                        var len = keys.length;
                                        // console.log("SFX results: " + len);
                                        if (len > 0) {
                                            $scope.sfxholdings = response.data
                                            $scope.sfxloading = false;
                                        }
                                    }
                                }, function(response) {
                                    $scope.sfxloading = false;
                                });
                            }


                            $scope.showRequestItem = ($event, biblionumber, itemnumber, callnumber, holdings, isavailableonshelf) => {
                                $mdDialog.show({
                                    parent: angular.element(document.body),
                                    clickOutsideToClose: true,
                                    fullscreen: false,
                                    targetEvent: $event,
                                    templateUrl: 'custom/' + viewName + '/html/requestItem.html',
                                    controller: ['$scope', '$http', '$mdDialog', function controller($scope, $http, $mdDialog) {
                                        let recordData = self.parentCtrl.item
                                            // console.log(recordData.pnx.display);
                                        $scope.biblionumber = biblionumber;
                                        $scope.holdings = holdings;
                                        //console.log("call num:"+callnumber);
                                        $scope.callnumber = callnumber;
                                        $scope.itemnumber = itemnumber;
                                        $scope.isavailableonshelf = isavailableonshelf;
                                        $scope.userIsGuest = userData.isGuest();
                                        //$scope.userIsGuest = false;
                                        $scope.addata = recordData.pnx.addata;
                                        // console.log($scope.addata);
                                        $scope.title = recordData.pnx.display.title[0];

                                        $scope.cancelRequest = function() {
                                            $mdDialog.cancel();
                                        }
                                        $scope.closeRequest = function() {
                                            $mdDialog.cancel();
                                            location.reload();
                                        }
                                        $scope.request = {
                                            message: '',
                                            volume: '',
                                            issue: '',
                                            year: '',

                                        }
                                        $scope.sendRequest = function(answer) {
                                            $scope.requestSent = true;
                                            var message = $scope.request.message;

                                            const data = {
                                                biblionumber: biblionumber,
                                                itemnumber: itemnumber,
                                                callnumber: callnumber,
                                                type: recordData.pnx.addata.ristype['0'],
                                                volume: $scope.request.volume,
                                                issue: $scope.request.issue,
                                                year: $scope.request.year,
                                                message: message
                                            };

                                            var prefixSvc = URLs.koha + "api/v1/contrib/wrm/request?";
                                            var querystring = kohaitemsService.encodeQueryData(data);
                                            var url = prefixSvc + querystring;

                                            //var url = "https://cas.univ-rennes2.fr/login?service=" + encodeURIComponent(svc) ;
                                            //Example : "https://cas.univ-rennes2.fr/login?service=https%3A%2F%2Fcataloguepreprod.bu.univ-rennes2.fr%2Fapi%2Fv1%2Fcontrib%2Fwrm%2Frequest%3Fbiblionumber%3D171221%26callnumber%3DZP%2B39%26type%3DJOUR%26volume%3D2%26issue%3D25%26year%3D1996"
                                            //console.log(url);
                                            $http({
                                                method: 'JSONP',
                                                url: url,
                                                cache: false,
                                                withCredentials: true
                                            }).then(function(response) {
                                                $scope.requestSent = false;
                                                if (response.data != undefined) {
                                                    //console.log(response.data);
                                                    if (response.data.state == "success") {
                                                        // console.log(response.data.state);
                                                        $scope.request_succeed = true;
                                                    } else {
                                                        var errors = {
                                                            "LOGIN_FAILED": "Vous devez être connecté pour pouvoir envoyer le message.",
                                                            "USER_NOT_FOUND": "Erreur de connection, utilisateur non-trouvé.",
                                                            "USER_NOT_ALLOWED": "Vous n'êtes pas autorisé·e à demander ce document",
                                                            "MISSING_INFO_JOURNAL": "Merci d'indiquer au moins un volume OU un numéro ET une année.",
                                                            "ALREADY_REQUESTED": "Votre demande a déjà été transmise.",
                                                            "WS_CALL_FAILED": "Le service est temporairement hors-service, veuillez réessayer ultérieurement."
                                                        };
                                                        $scope.returnMessage = errors[response.data.error];
                                                    }
                                                } else {
                                                    $scope.returnMessage = "Le service est temporairement hors-service, veuillez réessayer ultérieurement.";
                                                }
                                            }, function(response) {
                                                $scope.requestSent = false;
                                                $scope.returnMessage = "Le service est temporairement hors-service, veuillez réessayer ultérieurement.";
                                            });
                                        }
                                    }],
                                });
                            };
                        }
                    }
                }
            };
        }],
        templateUrl: 'custom/' + viewName + '/html/prmOpacAfter.html'
    })
    .factory('kohaitemsService', ['$http',
        function($http) {
            return {
                encodeQueryData: function(data) {
                    const ret = [];
                    for (let d in data)
                        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d].replace(/[\s]+/g, "+")));
                    return ret.join('&');
                }
            }
        }
    ]);