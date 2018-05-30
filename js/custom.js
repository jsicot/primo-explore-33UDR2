(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

angular.module('kohaAvailabilities', []).component('prmBriefResultAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaavailService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
      var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var recordid = obj.recordid[0];
        var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
        /*
                console.log("source:" + bn);
                console.log("biblionumber:" + bn);
        */
        if (bn && source == "33UDR2_KOHA" && type != "journal") {
          var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getItems.php?biblionumber=" + bn;
          var response = kohaavailService.getKohaData(url).then(function (response) {
            if (response) {
              console.log("it worked");
              //             console.log(response);
              var items = response.data;
              console.log(items);
              var availability = items.available;
              console.log(availability);
              if (availability === null) {
                console.log("it's false");
              } else {
                $scope.kohaDisplay = true;
                $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
                $scope.status = items.status;
                $scope.recordid = recordid;
                $scope.branch = items.homebranch;
                $scope.location = items.location;
                $scope.class = items.class;
                $scope.callnumber = items.itemcallnumber;
                $scope.otherLocations = items.total - 1;
              }
            }
          });
        }
      }
    };
  },
  templateUrl: 'custom/33UDR2_VU1/html/prmBriefResultAfter.html'
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
  $http.defaults.headers.common = { 'X-From-ExL-API-Gateway': undefined };
});

},{}],2:[function(require,module,exports){
'use strict';

angular.module('kohaItems', []).component('prmOpacAfter', {
	bindings: { parentCtrl: '<' },
	controller: function controller($scope, $http, $element, kohaitemsService) {
		this.$onInit = function () {
			$scope.kohaDisplay = false; /* default hides template */
			var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
			var openurl;
			$scope.loading = true;
			if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
				var bn = obj.sourcerecordid[0];
				var source = obj.sourceid[0];
				console.log("source :" + source);
				var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
				if (bn && (source == "33UDR2_KOHA" || !bn.startsWith("dedupmrg")) && type != "journal") {
					var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
					var response = kohaitemsService.getKohaData(url).then(function (response) {
						var items = response.data.record[0].item;
						var kohaid = response.data.record[0].biblionumber;
						var imagePath = response.data.record[0].cover;
						if (kohaid === null) {} else {
							$scope.loading = false;
							angular.element(document.querySelector('prm-opac > md-tabs'))[0].style.display = "none";
							$scope.kohaid = kohaid;
							$scope.items = items;
						}
					});
				} else if (bn && source == "33UDR2_KOHA" && type == "journal") {
					var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=journals&q=" + bn;
					var response = kohaitemsService.getKohaData(url).then(function (response) {
						if (response.data.record != undefined && response.data.record.length > 0) {
							console.log(response.data.record);
							angular.element(document.querySelector('prm-opac > md-tabs'))[0].style.display = "none";
							$scope.kohaholdings = [];
							$scope.loading = false;
							for (var i = 0; i < response.data.record[0].holdings.length; i++) {
								var holding = response.data.record[0].holdings[i];

								$scope.kohaholdings[i] = {
									"library": holding["rcr"],
									"holdings": holding["holdings"]
								};
								if (holding["holdings"].length > 80) {
									$scope.kohaholdings[i]["holdingsSummary"] = holding["holdings"].substring(0, 77) + "...";
								}
								if (response.data.record[0].locations[i]["rcr"] == holding["rcr"]) {
									$scope.kohaholdings[i]["callnumber"] = response.data.record[0].locations[i]["callnumber"];
									$scope.kohaholdings[i]["location"] = response.data.record[0].locations[i]["location"];
								}
							}
						}
					});
					/*
     			this.onClick = function() {
     				 $window.open('https://catalogue.bu.univ-rennes2.fr/bib/'+ bn, '_blank');
     			};
     */
				}

				var delivery = $scope.$ctrl.parentCtrl.item.delivery;
				if (delivery != undefined) {
					for (var i = 0; i < delivery.link.length; i++) {
						if (delivery.link[i].displayLabel == "openurl") {
							openurl = delivery.link[i].linkURL;
						}
					}
				}
				if (openurl != undefined) {
					openurl = openurl.replace(/.+\?/, "");
					$scope.proxifiedurl = "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/getSfx.php?" + openurl;
					$http.jsonp($scope.proxifiedurl).then(function (response) {
						if (response.data.error == undefined) {
							var keys = Object.keys(response.data);
							var len = keys.length;
							console.log("SFX results: " + len);
							if (len > 0) {
								$scope.sfxholdings = response.data;
							}
						}
					}).catch(function (e) {
						console.log(e);
					});
				}
			}
		};
	},
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
	$http.defaults.headers.common = { 'X-From-ExL-API-Gateway': undefined };
});

},{}],3:[function(require,module,exports){
'use strict';

var _viewName = require('./viewName');

var _kohaItems = require('./kohaItems.module');

var _kohaAvailabilities = require('./kohaAvailabilities.module');

var _sfxHoldings = require('./sfxHoldings.module');

var app = angular.module('viewCustom', ['angularLoad', 'kohaItems', 'kohaAvailabilities', 'sfxHoldings']);

app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
  var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
  urlWhitelist.push('https://catalogue.bu.univ-rennes2**');
  urlWhitelist.push('https://**.bu.univ-rennes2**');
  urlWhitelist.push('https://cataloguepreprod.bu.univ-rennes2**');
  urlWhitelist.push('http://sfx-univ-rennes2.hosted.exlibrisgroup**');
  $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
}]);

},{"./kohaAvailabilities.module":1,"./kohaItems.module":2,"./sfxHoldings.module":4,"./viewName":5}],4:[function(require,module,exports){
'use strict';

angular.module('sfxHoldings', []).component('prmViewOnlineAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, sfxholdingsService) {
    this.$onInit = function () {
      $scope.sfxloading = true;
      var obj = $scope.$ctrl.parentCtrl.item.linkElement.links[0];
      if (obj.hasOwnProperty("getItTabText") && obj.hasOwnProperty("displayText") && obj.hasOwnProperty("isLinktoOnline") && obj.hasOwnProperty("link")) {
        if (obj['displayText'] == "openurlfulltext") {
          console.log(obj);
          console.log(obj['link']);
          var openurl = obj['link'];
          var openurlSvc = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/getSfx.php");
          var response = sfxholdingsService.getSfxData(openurlSvc).then(function (response) {
            var holdings = response.data;
            if (holdings === null) {} else {
              angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme'))[0].style.display = "none";
              $scope.sfxloading = false;
              // 	          console.log(holdings);
              $scope.sfxholdings = holdings;
            }
          });
        }
      }
    };
  },
  templateUrl: 'custom/33UDR2_VU1/html/prmViewOnlineAfter.html'
}).factory('sfxholdingsService', ['$http', function ($http) {
  return {
    getSfxData: function getSfxData(url) {
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

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Define the view name here.
var viewName = exports.viewName = "33UDR2_VU1";

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFJdGVtcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL21haW4uanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3NmeEhvbGRpbmdzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvdmlld05hbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLFFBQVEsTUFBUixDQUFlLG9CQUFmLEVBQXFDLEVBQXJDLEVBQXlDLFNBQXpDLENBQW1ELHFCQUFuRCxFQUEwRTtBQUN4RSxZQUFVLEVBQUUsWUFBWSxHQUFkLEVBRDhEO0FBRXhFLGNBQVksU0FBUyxVQUFULENBQW9CLE1BQXBCLEVBQTRCLEtBQTVCLEVBQW1DLFFBQW5DLEVBQTZDLGdCQUE3QyxFQUErRDtBQUN6RSxTQUFLLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLGFBQU8sV0FBUCxHQUFxQixLQUFyQixDQUR5QixDQUNHO0FBQzVCLFVBQUksTUFBTSxPQUFPLEtBQVAsQ0FBYSxVQUFiLENBQXdCLElBQXhCLENBQTZCLEdBQTdCLENBQWlDLE9BQTNDO0FBQ0EsVUFBSSxJQUFJLGNBQUosQ0FBbUIsZ0JBQW5CLEtBQXdDLElBQUksY0FBSixDQUFtQixVQUFuQixDQUE1QyxFQUE0RTtBQUMxRSxZQUFJLEtBQUssSUFBSSxjQUFKLENBQW1CLENBQW5CLENBQVQ7QUFDQSxZQUFJLFNBQVMsSUFBSSxRQUFKLENBQWEsQ0FBYixDQUFiO0FBQ0EsWUFBSSxXQUFXLElBQUksUUFBSixDQUFhLENBQWIsQ0FBZjtBQUNBLFlBQUksT0FBTyxPQUFP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LEVBNEJpQyxDQUFDLE9BQUQsRUFBVSxVQUFVLEtBQVYsRUFBaUI7QUFDMUQsU0FBTztBQUNMLGdCQUFZLFNBQVMsVUFBVCxDQUFvQixHQUFwQixFQUF5QjtBQUNuQyxhQUFPLE1BQU07QUFDWCxnQkFBUSxPQURHO0FBRVgsYUFBSztBQUZNLE9BQU4sQ0FBUDtBQUlEO0FBTkksR0FBUDtBQVFELENBVGdDLENBNUJqQyxFQXFDSSxHQXJDSixDQXFDUSxVQUFVLEtBQVYsRUFBaUI7QUFDdkI7QUFDQSxRQUFNLFFBQU4sQ0FBZSxPQUFmLENBQXVCLE1BQXZCLEdBQWdDLEVBQUUsMEJBQTBCLFNBQTVCLEVBQWhDO0FBQ0QsQ0F4Q0Q7Ozs7Ozs7O0FDQUE7QUFDTyxJQUFJLDhCQUFXLFlBQWYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJhbmd1bGFyLm1vZHVsZSgna29oYUF2YWlsYWJpbGl0aWVzJywgW10pLmNvbXBvbmVudCgncHJtQnJpZWZSZXN1bHRBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFhdmFpbFNlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgcmVjb3JkaWQgPSBvYmoucmVjb3JkaWRbMF07XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguZGlzcGxheS50eXBlWzBdO1xuLypcbiAgICAgICAgY29uc29sZS5sb2coXCJzb3VyY2U6XCIgKyBibik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmlibGlvbnVtYmVyOlwiICsgYm4pO1xuKi9cbiAgICAgICAgaWYgKGJuICYmIHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRJdGVtcy5waHA/YmlibGlvbnVtYmVyPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWF2YWlsU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgIGlmKHJlc3BvbnNlKXtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCB3b3JrZWRcIik7XG5cdC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0ICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YTtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbXMpO1xuXHQgICAgICAgICAgICB2YXIgYXZhaWxhYmlsaXR5ID0gaXRlbXMuYXZhaWxhYmxlO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhhdmFpbGFiaWxpdHkpO1xuXHQgICAgICAgICAgICBpZiAoYXZhaWxhYmlsaXR5ID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCdzIGZhbHNlXCIpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IHRydWU7XG5cdCAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG5cdCAgICAgICAgICAgICAgJHNjb3BlLnN0YXR1cyA9IGl0ZW1zLnN0YXR1cztcblx0ICAgICAgICAgICAgICAkc2NvcGUucmVjb3JkaWQgPSByZWNvcmRpZDtcblx0ICAgICAgICAgICAgICAkc2NvcGUuYnJhbmNoID0gaXRlbXMuaG9tZWJyYW5jaDtcblx0ICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb24gPSBpdGVtcy5sb2NhdGlvbjtcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2xhc3MgPSBpdGVtcy5jbGFzcztcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2FsbG51bWJlciA9IGl0ZW1zLml0ZW1jYWxsbnVtYmVyO1xuXHQgICAgICAgICAgICAgICRzY29wZS5vdGhlckxvY2F0aW9ucyA9IChpdGVtcy50b3RhbCAtIDEpO1xuXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtQnJpZWZSZXN1bHRBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgna29oYWF2YWlsU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFJdGVtcycsIFtdKS5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFpdGVtc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICB2YXIgb3BlbnVybDtcbiAgICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlIDpcIitzb3VyY2UpO1xuICAgICAgICB2YXIgdHlwZSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmRpc3BsYXkudHlwZVswXTtcbiAgICAgICAgaWYgKGJuICYmIChzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiIHx8ICFibi5zdGFydHNXaXRoKFwiZGVkdXBtcmdcIikpICYmIHR5cGUgIT0gXCJqb3VybmFsXCIpIHtcbiAgICAgICAgICB2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0U3J1LnBocD9pbmRleD1yZWMuaWQmcT1cIiArIGJuO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaXRlbTtcbiAgICAgICAgICAgIHZhciBrb2hhaWQgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5iaWJsaW9udW1iZXI7XG4gICAgICAgICAgICB2YXIgaW1hZ2VQYXRoID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uY292ZXI7XG4gICAgICAgICAgICBpZiAoa29oYWlkID09PSBudWxsKSB7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblx0ICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyBcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFpZCA9IGtvaGFpZDtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlID09IFwiam91cm5hbFwiKSB7XG5cdCAgICAgIFx0dmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9am91cm5hbHMmcT1cIisgYm47XG5cdFx0ICBcdHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS1vcGFjID4gbWQtdGFicycpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5ncyA9IFtdO1xuXHRcdFx0XHRcdCRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAgOyBpIDwgcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaG9sZGluZ3MubGVuZ3RoIDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaG9sZGluZyA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzW2ldXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV0gPSB7XG5cdFx0XHRcdFx0XHRcdFwibGlicmFyeVwiIDogaG9sZGluZ1tcInJjclwiXSxcblx0XHRcdFx0XHRcdFx0XCJob2xkaW5nc1wiIDogaG9sZGluZ1tcImhvbGRpbmdzXCJdXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKGhvbGRpbmdbXCJob2xkaW5nc1wiXS5sZW5ndGggPiA4MCkge1xuXHRcdFx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzW2ldW1wiaG9sZGluZ3NTdW1tYXJ5XCJdID0gaG9sZGluZ1tcImhvbGRpbmdzXCJdLnN1YnN0cmluZygwLDc3KStcIi4uLlwiO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcInJjclwiXSA9PSAgaG9sZGluZ1tcInJjclwiXSkge1xuXHRcdFx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzW2ldW1wiY2FsbG51bWJlclwiXSA9ICByZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJjYWxsbnVtYmVyXCJdO1xuXHRcdFx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzW2ldW1wibG9jYXRpb25cIl0gPVx0cmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wibG9jYXRpb25cIl07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcbi8qXG5cdFx0XHR0aGlzLm9uQ2xpY2sgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0ICR3aW5kb3cub3BlbignaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL2JpYi8nKyBibiwgJ19ibGFuaycpO1xuXHRcdFx0fTtcbiovXG5cdFx0fSBcblx0XHRcblx0XHR2YXIgZGVsaXZlcnkgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLmRlbGl2ZXJ5O1xuXHRcdGlmIChkZWxpdmVyeSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IGRlbGl2ZXJ5LmxpbmsubGVuZ3RoIDsgaSsrKXtcblx0XHRcdFx0aWYgKGRlbGl2ZXJ5LmxpbmtbaV0uZGlzcGxheUxhYmVsID09IFwib3BlbnVybFwiKSB7XG5cdFx0XHRcdFx0b3BlbnVybCA9IGRlbGl2ZXJ5LmxpbmtbaV0ubGlua1VSTDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob3BlbnVybCAhPSB1bmRlZmluZWQpe1xuXHRcdFx0b3BlbnVybCA9IG9wZW51cmwucmVwbGFjZSgvLitcXD8vLCBcIlwiKTtcblx0XHRcdCRzY29wZS5wcm94aWZpZWR1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2dldFNmeC5waHA/XCIrb3BlbnVybDtcblx0XHRcdCRodHRwLmpzb25wKCRzY29wZS5wcm94aWZpZWR1cmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEuZXJyb3IgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0IHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0IHZhciBsZW4gPSBrZXlzLmxlbmd0aDtcblx0XHRcdFx0XHQgY29uc29sZS5sb2coXCJTRlggcmVzdWx0czogXCIrbGVuKTtcblx0XHRcdFx0XHQgaWYobGVuID4gMCkge1xuXHRcdFx0XHRcdFx0ICAkc2NvcGUuc2Z4aG9sZGluZ3MgPSByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHRcdCB9XG5cdFx0XHRcdH1cblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0XG4gICAgICB9IFxuICAgIH07XG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1PcGFjQWZ0ZXIuaHRtbCdcbn0pLmZhY3RvcnkoJ2tvaGFpdGVtc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0S29oYURhdGE6IGZ1bmN0aW9uIGdldEtvaGFEYXRhKHVybCkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnSlNPTlAnLFxuICAgICAgICB1cmw6IHVybFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV0pLnJ1bihmdW5jdGlvbiAoJGh0dHApIHtcbiAgLy8gTmVjZXNzYXJ5IGZvciByZXF1ZXN0cyB0byBzdWNjZWVkLi4ubm90IHN1cmUgd2h5XG4gICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyAnWC1Gcm9tLUV4TC1BUEktR2F0ZXdheSc6IHVuZGVmaW5lZCB9O1xufSk7XG5cbiIsImltcG9ydCB7IHZpZXdOYW1lIH0gZnJvbSAnLi92aWV3TmFtZSc7XG5pbXBvcnQgeyBrb2hhSXRlbXMgfSBmcm9tICcuL2tvaGFJdGVtcy5tb2R1bGUnO1xuaW1wb3J0IHsga29oYUF2YWlsYWJpbGl0aWVzIH0gZnJvbSAnLi9rb2hhQXZhaWxhYmlsaXRpZXMubW9kdWxlJztcbmltcG9ydCB7IHNmeEhvbGRpbmdzIH0gZnJvbSAnLi9zZnhIb2xkaW5ncy5tb2R1bGUnO1xubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2aWV3Q3VzdG9tJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmd1bGFyTG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFJdGVtcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFBdmFpbGFiaWxpdGllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NmeEhvbGRpbmdzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5hcHAuY29uZmlnKFsnJHNjZURlbGVnYXRlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHNjZURlbGVnYXRlUHJvdmlkZXIpIHtcbiAgdmFyIHVybFdoaXRlbGlzdCA9ICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KCk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly8qKi5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMioqJyk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwOi8vc2Z4LXVuaXYtcmVubmVzMi5ob3N0ZWQuZXhsaWJyaXNncm91cCoqJyk7XG4gICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KHVybFdoaXRlbGlzdCk7XG59XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnc2Z4SG9sZGluZ3MnLCBbXSkuY29tcG9uZW50KCdwcm1WaWV3T25saW5lQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBzZnhob2xkaW5nc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgJHNjb3BlLnNmeGxvYWRpbmcgPSB0cnVlO1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ubGlua0VsZW1lbnQubGlua3NbMF07XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwiZ2V0SXRUYWJUZXh0XCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlUZXh0XCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImlzTGlua3RvT25saW5lXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImxpbmtcIikpIHtcbiAgICAgICAgaWYgKG9ialsnZGlzcGxheVRleHQnXSA9PSBcIm9wZW51cmxmdWxsdGV4dFwiKSB7XG5cdCAgICAgIGNvbnNvbGUubG9nKG9iaik7XG5cdCAgICAgIGNvbnNvbGUubG9nKG9ialsnbGluayddKTtcbiAgICAgICAgICB2YXIgb3BlbnVybCA9IG9ialsnbGluayddO1xuICAgICAgICAgIHZhciBvcGVudXJsU3ZjID0gb3BlbnVybC5yZXBsYWNlKFwiaHR0cDovL2FjY2VkZXIuYnUudW5pdi1yZW5uZXMyLmZyL3NmeF8zM3B1ZWRiXCIsXCJodHRwczovL2NhdGFsb2d1ZXByZXByb2QuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9nZXRTZngucGhwXCIpO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IHNmeGhvbGRpbmdzU2VydmljZS5nZXRTZnhEYXRhKG9wZW51cmxTdmMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgaG9sZGluZ3MgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgaWYgKGhvbGRpbmdzID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tdmlldy1vbmxpbmUgZGl2IGEuYXJyb3ctbGluay5tZC1wcmltb0V4cGxvcmUtdGhlbWUnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyBcblx0ICAgICAgICAgICRzY29wZS5zZnhsb2FkaW5nID0gZmFsc2U7XG4vLyBcdCAgICAgICAgICBjb25zb2xlLmxvZyhob2xkaW5ncyk7XG4gICAgICAgICAgICAgICRzY29wZS5zZnhob2xkaW5ncyA9IGhvbGRpbmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtVmlld09ubGluZUFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdzZnhob2xkaW5nc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2Z4RGF0YTogZnVuY3Rpb24gZ2V0U2Z4RGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuIiwiLy8gRGVmaW5lIHRoZSB2aWV3IG5hbWUgaGVyZS5cbmV4cG9ydCBsZXQgdmlld05hbWUgPSBcIjMzVURSMl9WVTFcIjsiXX0=
