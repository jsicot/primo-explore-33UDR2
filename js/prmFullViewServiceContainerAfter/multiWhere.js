import { viewName } from '../viewName';

class multiWhereController {
    constructor($scope, $http, $element, $templateCache) {
        if (typeof this.parentCtrl.service !== 'undefined') {
            this.serviceName = this.parentCtrl.service.scrollId;
            if (this.serviceName == "getit_link1_0") {
                // console.log(this);
                // console.log('---->multiWhereController');
                this.UDR2_vue = this.parentCtrl.configurationUtil.vid;
                // console.log(this.UDR2_vue);
                var ids = this.parentCtrl.item.pnx.display.identifier;
                this.ids = this.parentCtrl.item.pnx.display.identifier[0].split(';');
                this.isShowContent = {};
                for (var i = 0; i < this.ids.length; i++) {
                    //console.log(this.ids[i]);
                    //$$CPPN$$V
                    var ppn = this.ids[i].match(/(\$\$CPPN)(\$\$V)(.*)/);
                    if (ppn && ppn[3]) {
                        var ppn = ppn[3];
                        $scope.ppn = ppn;
                        // console.log(ppn);
                        var UnirRcr = new Array("350472301", "352382102", "352382103", "352382104", "352382210", "352382241", "352382305", "352382339", "352385201", "352386106");
                        var url = "https://www.sudoc.fr/services/multiwhere/" + ppn + "&format=text/json";
                        // console.log(url);
                        $scope.mwLibraries = [];
                        $http({
                            method: 'GET',
                            url: url,
                            cache: true
                        }).then(function(response) {
                                if (response.data) {
                                    var data = response.data;
                                    if (data && data.sudoc && data.sudoc.query && data.sudoc.query.result) {
                                        // console.log(data.sudoc.query.result.library);
                                        var rcrlist = '';
                                        angular.forEach(data.sudoc.query.result.library, function(data, i) {
                                            if (data.rcr && UnirRcr.indexOf(data.rcr) !== -1) {
                                                rcrlist += data.rcr + ',';
                                            }
                                        });
                                        // console.log('rcrlist', rcrlist);
                                        if (rcrlist) {
                                            var deeplinksvc = "https://www.sudoc.fr/services/multilinkrcr/" + rcrlist.replace(/,\s*$/, "");
                                            console.log(deeplinksvc);
                                            $http({
                                                method: 'GET',
                                                url: deeplinksvc,
                                                cache: true
                                            }).then(function(r) {
                                                    if (r.data && r.data.sudoc && r.data.sudoc.result) {
                                                        var l = r.data.sudoc.result;
                                                        if (angular.isArray(l)) {
                                                            $scope.mwLibraries = l;
                                                            // console.log("list", l);
                                                        } else {
                                                            var library = l.library;
                                                            console.log("library", library);
                                                            var libraries = [];
                                                            libraries.push({ 'library': library });
                                                            // console.log("libraries", libraries);
                                                            $scope.mwLibraries = libraries;
                                                        }
                                                        $scope.otherLibs = true;
                                                    }
                                                },
                                                function(data) {
                                                    console.log('multilinkrcr failed.')
                                                });
                                        }
                                    }
                                }
                            },
                            function(data) {
                                console.log('multiwhere failed.')
                            });
                    }
                }
            }
        }
    }
}

multiWhereController.$inject = ['$scope', '$http', '$element', '$templateCache']

export let multiWhereConfig = {
    bindings: { parentCtrl: '<' },
    controller: multiWhereController,
    templateUrl: 'custom/' + viewName + '/html/multiWhere.html'
}