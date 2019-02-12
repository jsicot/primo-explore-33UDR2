import {
  viewName
} from './viewName';

angular.module('kohaAvailabilities', []).component('prmBriefResultAfter', {
  bindings: {
    parentCtrl: '<'
  },
  controller: ['$scope', '$http', '$element', 'kohaavailService', function controller($scope, $http, $element, kohaavailService) {
    this.$onInit = function () {
      if ($scope.$ctrl.parentCtrl.item) {
        $scope.kohaDisplay = false; /* default hides template */
        var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
        if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
          var recid = obj.recordid[0];
          var ids = obj.sourcerecordid;
          var total_ids = ids.length;
          if (total_ids > 1) {
            var bn = [];
            angular.forEach(ids, function (value, key) {
              if (value.startsWith("$$V") && value.includes("33UDR2_KOHA")) {
                this.push(value.replace(/\$\$V.+\$\$O33UDR2_KOHA/, ""));
              }
            }, bn);
            var source = [];
            angular.forEach(obj.sourceid, function (value, key) {
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
            var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getItems.php?biblionumber=" + bn;
            var response = kohaavailService.getKohaData(url).then(function (response) {
              if (response.data) {
                var items = response.data;
                $scope.kohaDisplay = true;
                if (items.available != null) {
                  $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
                  $scope.status = items.status;
                  $scope.recordid = bn;
                  var homebranch = items.homebranch;
                  // homebranch = homebranch.replace(/Bibliothèque Universitaire/,"BU");
                  // homebranch = homebranch.replace(/Bibliothèque/,"BU");
                  $scope.branch = homebranch;
                  $scope.location = items.location;
                  $scope.class = items.class;
                  $scope.callnumber = items.itemcallnumber;
                  $scope.otherLocations = (items.total - 1);
                } else {
                  console.log("it's false");
                }
              } else {
                var orderSvc = "https://catalogue.bu.univ-rennes2.fr/r2microws/getInfoOrder.php?biblionumber=" + bn;
                var response = kohaavailService.getKohaData(orderSvc).then(function (response) {
                  if (response.data.orders) {
                    console.log("notice acq");
                    var order = response.data.orders[0];
                    $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
                    $scope.status = "Prochainement disponible";
                    $scope.recordid = bn;
                    $scope.branch = "(en commande)";
                    $scope.location = "";
                    $scope.class = " status-unavailable unavailable";
                    $scope.callnumber = "";
                    $scope.otherLocations = 0;
                  }
                });
                $scope.kohaDisplay = true;
              }
            });
          }
        }
      }
    };
  }],
  templateUrl: 'custom/' + viewName + '/html/prmBriefResultAfter.html'
}).factory('kohaavailService', ['$http', function ($http) {
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
