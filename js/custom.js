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
              console.log(holdings);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFJdGVtcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL21haW4uanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3NmeEhvbGRpbmdzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvdmlld05hbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLFFBQVEsTUFBUixDQUFlLG9CQUFmLEVBQXFDLEVBQXJDLEVBQXlDLFNBQXpDLENBQW1ELHFCQUFuRCxFQUEwRTtBQUN4RSxZQUFVLEVBQUUsWUFBWSxHQUFkLEVBRDhEO0FBRXhFLGNBQVksU0FBUyxVQUFULENBQW9CLE1BQXBCLEVBQTRCLEtBQTVCLEVBQW1DLFFBQW5DLEVBQTZDLGdCQUE3QyxFQUErRDtBQUN6RSxTQUFLLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLGFBQU8sV0FBUCxHQUFxQixLQUFyQixDQUR5QixDQUNHO0FBQzVCLFVBQUksTUFBTSxPQUFPLEtBQVAsQ0FBYSxVQUFiLENBQXdCLElBQXhCLENBQTZCLEdBQTdCLENBQWlDLE9BQTNDO0FBQ0EsVUFBSSxJQUFJLGNBQUosQ0FBbUIsZ0JBQW5CLEtBQXdDLElBQUksY0FBSixDQUFtQixVQUFuQixDQUE1QyxFQUE0RTtBQUMxRSxZQUFJLEtBQUssSUFBSSxjQUFKLENBQW1CLENBQW5CLENBQVQ7QUFDQSxZQUFJLFNBQVMsSUFBSSxRQUFKLENBQWEsQ0FBYixDQUFiO0FBQ0EsWUFBSSxXQUFXLElBQUksUUFBSixDQUFhLENBQWIsQ0FBZjtBQUNBLFlBQUksT0FBTyxPQUFP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T0FERztBQUVYLGFBQUs7QUFGTSxPQUFOLENBQVA7QUFJRDtBQU5JLEdBQVA7QUFRRCxDQVRnQyxDQTFCakMsRUFtQ0ksR0FuQ0osQ0FtQ1EsVUFBVSxLQUFWLEVBQWlCO0FBQ3ZCO0FBQ0EsUUFBTSxRQUFOLENBQWUsT0FBZixDQUF1QixNQUF2QixHQUFnQyxFQUFFLDBCQUEwQixTQUE1QixFQUFoQztBQUNELENBdENEOzs7Ozs7OztBQ0FBO0FBQ08sSUFBSSw4QkFBVyxZQUFmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFBdmFpbGFiaWxpdGllcycsIFtdKS5jb21wb25lbnQoJ3BybUJyaWVmUmVzdWx0QWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBrb2hhYXZhaWxTZXJ2aWNlKSB7XG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gZmFsc2U7IC8qIGRlZmF1bHQgaGlkZXMgdGVtcGxhdGUgKi9cbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5jb250cm9sO1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZXJlY29yZGlkXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZWlkXCIpKSB7XG4gICAgICAgIHZhciBibiA9IG9iai5zb3VyY2VyZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IG9iai5zb3VyY2VpZFswXTtcbiAgICAgICAgdmFyIHJlY29yZGlkID0gb2JqLnJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgdHlwZSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmRpc3BsYXkudHlwZVswXTtcbi8qXG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlOlwiICsgYm4pO1xuICAgICAgICBjb25zb2xlLmxvZyhcImJpYmxpb251bWJlcjpcIiArIGJuKTtcbiovXG4gICAgICAgIGlmIChibiAmJiBzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiICYmIHR5cGUgIT0gXCJqb3VybmFsXCIpIHtcbiAgICAgICAgICB2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0SXRlbXMucGhwP2JpYmxpb251bWJlcj1cIiArIGJuO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IGtvaGFhdmFpbFNlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHQgICAgICAgICBpZihyZXNwb25zZSl7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQgd29ya2VkXCIpO1xuXHQvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdCAgICAgICAgICAgIHZhciBpdGVtcyA9IHJlc3BvbnNlLmRhdGE7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW1zKTtcblx0ICAgICAgICAgICAgdmFyIGF2YWlsYWJpbGl0eSA9IGl0ZW1zLmF2YWlsYWJsZTtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coYXZhaWxhYmlsaXR5KTtcblx0ICAgICAgICAgICAgaWYgKGF2YWlsYWJpbGl0eSA9PT0gbnVsbCkge1xuXHQgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQncyBmYWxzZVwiKTtcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSB0cnVlO1xuXHQgICAgICAgICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoXCJuZy1oaWRlXCIpOyAvKiBpbml0aWFsbHkgc2V0IGJ5ICRzY29wZS5rb2hhRGlzcGxheT1mYWxzZSAqL1xuXHQgICAgICAgICAgICAgICRzY29wZS5zdGF0dXMgPSBpdGVtcy5zdGF0dXM7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLnJlY29yZGlkID0gcmVjb3JkaWQ7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmJyYW5jaCA9IGl0ZW1zLmhvbWVicmFuY2g7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uID0gaXRlbXMubG9jYXRpb247XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmNsYXNzID0gaXRlbXMuY2xhc3M7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmNhbGxudW1iZXIgPSBpdGVtcy5pdGVtY2FsbG51bWJlcjtcblx0ICAgICAgICAgICAgICAkc2NvcGUub3RoZXJMb2NhdGlvbnMgPSAoaXRlbXMudG90YWwgLSAxKTtcblxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBcbiAgICAgIH0gXG4gICAgfTtcbiAgfSxcbiAgdGVtcGxhdGVVcmw6ICdjdXN0b20vMzNVRFIyX1ZVMS9odG1sL3BybUJyaWVmUmVzdWx0QWZ0ZXIuaHRtbCdcbn0pLmZhY3RvcnkoJ2tvaGFhdmFpbFNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0S29oYURhdGE6IGZ1bmN0aW9uIGdldEtvaGFEYXRhKHVybCkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnSlNPTlAnLFxuICAgICAgICB1cmw6IHVybFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV0pLnJ1bihmdW5jdGlvbiAoJGh0dHApIHtcbiAgLy8gTmVjZXNzYXJ5IGZvciByZXF1ZXN0cyB0byBzdWNjZWVkLi4ubm90IHN1cmUgd2h5XG4gICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyAnWC1Gcm9tLUV4TC1BUEktR2F0ZXdheSc6IHVuZGVmaW5lZCB9O1xufSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdrb2hhSXRlbXMnLCBbXSkuY29tcG9uZW50KCdwcm1PcGFjQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBrb2hhaXRlbXNTZXJ2aWNlKSB7XG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gZmFsc2U7IC8qIGRlZmF1bHQgaGlkZXMgdGVtcGxhdGUgKi9cbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5jb250cm9sO1xuICAgICAgdmFyIG9wZW51cmw7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICBjb25zb2xlLmxvZyhcInNvdXJjZSA6XCIrc291cmNlKTtcbiAgICAgICAgdmFyIHR5cGUgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5kaXNwbGF5LnR5cGVbMF07XG4gICAgICAgIGlmIChibiAmJiAoc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiB8fCAhYm4uc3RhcnRzV2l0aChcImRlZHVwbXJnXCIpKSAmJiB0eXBlICE9IFwiam91cm5hbFwiKSB7XG4gICAgICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9cmVjLmlkJnE9XCIgKyBibjtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBrb2hhaXRlbXNTZXJ2aWNlLmdldEtvaGFEYXRhKHVybCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLml0ZW07XG4gICAgICAgICAgICB2YXIga29oYWlkID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uYmlibGlvbnVtYmVyO1xuICAgICAgICAgICAgdmFyIGltYWdlUGF0aCA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmNvdmVyO1xuICAgICAgICAgICAgaWYgKGtvaGFpZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyBcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFpZCA9IGtvaGFpZDtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlID09IFwiam91cm5hbFwiKSB7XG5cdCAgICAgIFx0dmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9am91cm5hbHMmcT1cIisgYm47XG5cdFx0ICBcdHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS1vcGFjID4gbWQtdGFicycpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5ncyA9IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzLmxlbmd0aCA7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGhvbGRpbmcgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5nc1tpXVxuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuLypcblx0XHRcdHRoaXMub25DbGljayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQgJHdpbmRvdy5vcGVuKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvYmliLycrIGJuLCAnX2JsYW5rJyk7XG5cdFx0XHR9O1xuKi9cblx0XHR9IFxuXHRcdFxuXHRcdHZhciBkZWxpdmVyeSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0uZGVsaXZlcnk7XG5cdFx0aWYgKGRlbGl2ZXJ5ICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAgOyBpIDwgZGVsaXZlcnkubGluay5sZW5ndGggOyBpKyspe1xuXHRcdFx0XHRpZiAoZGVsaXZlcnkubGlua1tpXS5kaXNwbGF5TGFiZWwgPT0gXCJvcGVudXJsXCIpIHtcblx0XHRcdFx0XHRvcGVudXJsID0gZGVsaXZlcnkubGlua1tpXS5saW5rVVJMO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvcGVudXJsICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRvcGVudXJsID0gb3BlbnVybC5yZXBsYWNlKC8uK1xcPy8sIFwiXCIpO1xuXHRcdFx0JHNjb3BlLnByb3hpZmllZHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvZ2V0U2Z4LnBocD9cIitvcGVudXJsO1xuXHRcdFx0JGh0dHAuanNvbnAoJHNjb3BlLnByb3hpZmllZHVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5lcnJvciA9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHQgdmFyIGxlbiA9IGtleXMubGVuZ3RoO1xuXHRcdFx0XHRcdCBjb25zb2xlLmxvZyhcIlNGWCByZXN1bHRzOiBcIitsZW4pO1xuXHRcdFx0XHRcdCBpZihsZW4gPiAwKSB7XG5cdFx0XHRcdFx0XHQgICRzY29wZS5zZnhob2xkaW5ncyA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0IH1cblx0XHRcdFx0fVxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHRcbiAgICAgIH0gXG4gICAgfTtcbiAgfSxcbiAgdGVtcGxhdGVVcmw6ICdjdXN0b20vMzNVRFIyX1ZVMS9odG1sL3BybU9wYWNBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgna29oYWl0ZW1zU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiaW1wb3J0IHsgdmlld05hbWUgfSBmcm9tICcuL3ZpZXdOYW1lJztcbmltcG9ydCB7IGtvaGFJdGVtcyB9IGZyb20gJy4va29oYUl0ZW1zLm1vZHVsZSc7XG5pbXBvcnQgeyBrb2hhQXZhaWxhYmlsaXRpZXMgfSBmcm9tICcuL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUnO1xuaW1wb3J0IHsgc2Z4SG9sZGluZ3MgfSBmcm9tICcuL3NmeEhvbGRpbmdzLm1vZHVsZSc7XG5sZXQgYXBwID0gYW5ndWxhci5tb2R1bGUoJ3ZpZXdDdXN0b20nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FuZ3VsYXJMb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAna29oYUl0ZW1zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAna29oYUF2YWlsYWJpbGl0aWVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2Z4SG9sZGluZ3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmFwcC5jb25maWcoWyckc2NlRGVsZWdhdGVQcm92aWRlcicsIGZ1bmN0aW9uICgkc2NlRGVsZWdhdGVQcm92aWRlcikge1xuICB2YXIgdXJsV2hpdGVsaXN0ID0gJHNjZURlbGVnYXRlUHJvdmlkZXIucmVzb3VyY2VVcmxXaGl0ZWxpc3QoKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMioqJyk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwczovLyoqLmJ1LnVuaXYtcmVubmVzMioqJyk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwczovL2NhdGFsb2d1ZXByZXByb2QuYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHA6Ly9zZngtdW5pdi1yZW5uZXMyLmhvc3RlZC5leGxpYnJpc2dyb3VwKionKTtcbiAgJHNjZURlbGVnYXRlUHJvdmlkZXIucmVzb3VyY2VVcmxXaGl0ZWxpc3QodXJsV2hpdGVsaXN0KTtcbn1dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdzZnhIb2xkaW5ncycsIFtdKS5jb21wb25lbnQoJ3BybVZpZXdPbmxpbmVBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIHNmeGhvbGRpbmdzU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLmxpbmtFbGVtZW50LmxpbmtzWzBdO1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShcImdldEl0VGFiVGV4dFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJkaXNwbGF5VGV4dFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJpc0xpbmt0b09ubGluZVwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJsaW5rXCIpKSB7XG4gICAgICAgIGlmIChvYmpbJ2Rpc3BsYXlUZXh0J10gPT0gXCJvcGVudXJsZnVsbHRleHRcIikge1xuXHQgICAgICBjb25zb2xlLmxvZyhvYmopO1xuXHQgICAgICBjb25zb2xlLmxvZyhvYmpbJ2xpbmsnXSk7XG4gICAgICAgICAgdmFyIG9wZW51cmwgPSBvYmpbJ2xpbmsnXTtcbiAgICAgICAgICB2YXIgb3BlbnVybFN2YyA9IG9wZW51cmwucmVwbGFjZShcImh0dHA6Ly9hY2NlZGVyLmJ1LnVuaXYtcmVubmVzMi5mci9zZnhfMzNwdWVkYlwiLFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvZ2V0U2Z4LnBocFwiKTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBzZnhob2xkaW5nc1NlcnZpY2UuZ2V0U2Z4RGF0YShvcGVudXJsU3ZjKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGhvbGRpbmdzID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIGlmIChob2xkaW5ncyA9PT0gbnVsbCkge1xuXHQgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJtLXZpZXctb25saW5lIGRpdiBhLmFycm93LWxpbmsubWQtcHJpbW9FeHBsb3JlLXRoZW1lJykpWzBdLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjsgXG5cdCAgICAgICAgICBjb25zb2xlLmxvZyhob2xkaW5ncyk7XG4gICAgICAgICAgICAgICRzY29wZS5zZnhob2xkaW5ncyA9IGhvbGRpbmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtVmlld09ubGluZUFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdzZnhob2xkaW5nc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2Z4RGF0YTogZnVuY3Rpb24gZ2V0U2Z4RGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuIiwiLy8gRGVmaW5lIHRoZSB2aWV3IG5hbWUgaGVyZS5cbmV4cG9ydCBsZXQgdmlld05hbWUgPSBcIjMzVURSMl9WVTFcIjsiXX0=
