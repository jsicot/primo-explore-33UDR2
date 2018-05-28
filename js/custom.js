(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

angular.module('kohaAvailabilities', []).component('prmSearchResultAvailabilityLineAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaavailService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
      var obj = $scope.$ctrl.parentCtrl.result.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var recordid = obj.recordid[0];
        var type = $scope.$ctrl.parentCtrl.result.pnx.display.type[0];
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
                $scope.kohaDisplay = false;
                console.log("it's false");
                $scope.kohaClass = "ng-hide";
              } else {
                $scope.kohaDisplay = true;
                $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
                $scope.kohaClass = "ng-show";
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
        } else {
          $scope.kohaDisplay = false;
        }
      } else {
        $scope.kohaClass = "ng-hide";
      }
    };
  },

  template: '\n<prm-search-result-availability-koha ng-if="status">\n  <div layout="row" layout-align="start start" class="layout-align-start-start layout-row"><!---->\n  <div layout="flex" class="layout-row"><!---->\n  <!---->\n <prm-icon  availability-type="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="book-open">\n \t<md-icon md-svg-icon="primo-ui:book-open" alt="" class="md-primoExplore-theme" aria-hidden="true">\n \t\t<svg id="book-open" width="100%" height="100%" viewBox="0 0 24 24" y="480" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n        <path d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.55,5 2.45,5.4 1,6.5V21.16C1,21.41 1.25,21.66 1.5,21.66C1.6,21.66 1.65,21.59 1.75,21.59C3.1,20.94 5.05,20.5 6.5,20.5C8.45,20.5 10.55,20.9 12,22C13.35,21.15 15.8,20.5 17.5,20.5C19.15,20.5 20.85,20.81 22.25,21.56C22.35,21.61 22.4,21.59 22.5,21.59C22.75,21.59 23,21.34 23,21.09V6.5C22.4,6.05 21.75,5.75 21,5.5V7.5L21,13V19C19.9,18.65 18.7,18.5 17.5,18.5C15.8,18.5 13.35,19.15 12,20V13L12,8.5V6.5C10.55,5.4 8.45,5 6.5,5V5Z"></path></svg>\n    </md-icon>\n  <prm-icon-after parent-ctrl="$ctrl"></prm-icon-after></prm-icon>\n  <!---->\n  <button class="neutralized-button md-button md-primoExplore-theme md-ink-ripple" type="button"  prm-brief-internal-button-marker="" ng-click="$ctrl.handleAvailability($index, $event);$event.preventDefault();" aria-label="{{status}} {{branch}}" title="{{status}} {{branch}}">\n  <span class="button-content">\n\t  <span ng-if="status" class="availability-status {{class}}" ng-class="{\'text-rtl\': $ctrl.switchToLtrString()}">{{status}} \n\t\t  <span ng-if="branch"  class="best-location-library-code locations-link">{{branch}}</span> \n\t\t  <span ng-if="location" class="best-location-sub-location locations-link">{{location}}</span>\n\t\t  <span ng-if="callnumber" class="best-location-delivery locations-link">{{callnumber}}</span>\n\t\t  <span ng-if="otherLocations > 0" ng-bind-html="&nbsp;"></span>\n\t\t  <span ng-if="otherLocations > 0">et {{otherLocations}} autre<span ng-if="otherLocations > 1">s</span> exemplaire<span ng-if="otherLocations > 1">s</span></span>\n\t  </span><!----> \n\t  <!---->\n  <!---->\n </span>\n <!---->\n\n <prm-icon link-arrow="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="chevron-right">\n \t<md-icon md-svg-icon="primo-ui:chevron-right" alt="" class="md-primoExplore-theme" aria-hidden="true">\n \t\t<svg id="chevron-right" width="100%" height="100%" viewBox="0 0 24 24" y="384" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">\n        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>\n        </md-icon>\n\t\t<prm-icon-after parent-ctrl="$ctrl"></prm-icon-after>\n </prm-icon>\n <div class="md-ripple-container" style=""></div></button>\n</div><!----></div><!----></prm-search-result-availability-koha>\n '
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
				var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
				if (bn && source == "33UDR2_KOHA" && type != "journal") {
					var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
					var response = kohaitemsService.getKohaData(url).then(function (response) {
						var items = response.data.record[0].item;
						var kohaid = response.data.record[0].biblionumber;
						var imagePath = response.data.record[0].cover;
						if (kohaid === null) {
							$scope.kohaDisplay = false;
							$scope.kohaClass = "ng-hide";
						} else {
							$scope.kohaid = kohaid;
							$scope.items = items;
							$scope.kohaDisplay = true;
							$element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
							$scope.kohaClass = "ng-show";
						}
					});
				} else if (bn && source == "33UDR2_KOHA" && type == "journal") {
					var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=journals&q=" + bn;
					var response = kohaitemsService.getKohaData(url).then(function (response) {
						if (response.data.record != undefined && response.data.record.length > 0) {
							console.log(response.data.record);
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
					this.onClick = function () {
						$window.open('https://catalogue.bu.univ-rennes2.fr/bib/' + bn, '_blank');
					};
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
        if (obj['getItTabText'] == "tab1_full" && obj['isLinktoOnline'] == true && obj['displayText'] == "openurlfulltext") {
          console.log(obj);
          console.log(obj['link']);
          var openurl = obj['link'];
          var openurlSvc = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/getSfx.php");
          var response = sfxholdingsService.getSfxData(openurlSvc).then(function (response) {
            var holdings = response.data;
            if (holdings === null) {} else {
              console.log(holdings);
              $scope.sfxholdings = holdings;
              angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme'))[0].style.display = "none";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFJdGVtcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL21haW4uanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3NmeEhvbGRpbmdzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvdmlld05hbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLFFBQVEsTUFBUixDQUFlLG9CQUFmLEVBQXFDLEVBQXJDLEVBQXlDLFNBQXpDLENBQW1ELHNDQUFuRCxFQUEyRjtBQUN6RixZQUFVLEVBQUUsWUFBWSxHQUFkLEVBRCtFO0FBRXpGLGNBQVksU0FBUyxVQUFULENBQW9CLE1BQXBCLEVBQTRCLEtBQTVCLEVBQW1DLFFBQW5DLEVBQTZDLGdCQUE3QyxFQUErRDtBQUN6RSxTQUFLLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLGFBQU8sV0FBUCxHQUFxQixLQUFyQixDQUR5QixDQUNHO0FBQzVCLFVBQUksTUFBTSxPQUFPLEtBQVAsQ0FBYSxVQUFiLENBQXdCLE1BQXhCLENBQStCLEdBQS9CLENBQW1DLE9BQTdDO0FBQ0EsVUFBSSxJQUFJLGNBQUosQ0FBbUIsZ0JBQW5CLEtBQXdDLElBQUksY0FBSixDQUFtQixVQUFuQixDQUE1QyxFQUE0RTtBQUMxRSxZQUFJLEtBQUssSUFBSSxjQUFKLENBQW1CLENBQW5CLENBQVQ7QUFDQSxZQUFJLFNBQVMsSUFBSSxRQUFKLENBQWEsQ0FBYixDQUFiO0FBQ0EsWUFBSSxXQUFXLElBQUksUUFBSixDQUFhLENBQWIsQ0FBZjtBQUNBLFlBQUksT0FBTyxPQUFP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VUQ7QUFDRjtBQUNGLEtBcEJEO0FBcUJELEdBeEIrRDtBQXlCaEUsZUFBYTtBQXpCbUQsQ0FBbEUsRUEwQkcsT0ExQkgsQ0EwQlcsb0JBMUJYLEVBMEJpQyxDQUFDLE9BQUQsRUFBVSxVQUFVLEtBQVYsRUFBaUI7QUFDMUQsU0FBTztBQUNMLGdCQUFZLFNBQVMsVUFBVCxDQUFvQixHQUFwQixFQUF5QjtBQUNuQyxhQUFPLE1BQU07QUFDWCxnQkFBUSxPQURHO0FBRVgsYUFBSztBQUZNLE9BQU4sQ0FBUDtBQUlEO0FBTkksR0FBUDtBQVFELENBVGdDLENBMUJqQyxFQW1DSSxHQW5DSixDQW1DUSxVQUFVLEtBQVYsRUFBaUI7QUFDdkI7QUFDQSxRQUFNLFFBQU4sQ0FBZSxPQUFmLENBQXVCLE1BQXZCLEdBQWdDLEVBQUUsMEJBQTBCLFNBQTVCLEVBQWhDO0FBQ0QsQ0F0Q0Q7Ozs7Ozs7O0FDQUE7QUFDTyxJQUFJLDhCQUFXLFlBQWYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsImFuZ3VsYXIubW9kdWxlKCdrb2hhQXZhaWxhYmlsaXRpZXMnLCBbXSkuY29tcG9uZW50KCdwcm1TZWFyY2hSZXN1bHRBdmFpbGFiaWxpdHlMaW5lQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBrb2hhYXZhaWxTZXJ2aWNlKSB7XG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gZmFsc2U7IC8qIGRlZmF1bHQgaGlkZXMgdGVtcGxhdGUgKi9cbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5yZXN1bHQucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgcmVjb3JkaWQgPSBvYmoucmVjb3JkaWRbMF07XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwucmVzdWx0LnBueC5kaXNwbGF5LnR5cGVbMF07XG4vKlxuICAgICAgICBjb25zb2xlLmxvZyhcInNvdXJjZTpcIiArIGJuKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJiaWJsaW9udW1iZXI6XCIgKyBibik7XG4qL1xuICAgICAgICBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlICE9IFwiam91cm5hbFwiKSB7XG4gICAgICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldEl0ZW1zLnBocD9iaWJsaW9udW1iZXI9XCIgKyBibjtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBrb2hhYXZhaWxTZXJ2aWNlLmdldEtvaGFEYXRhKHVybCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0ICAgICAgICAgaWYocmVzcG9uc2Upe1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtlZFwiKTtcblx0Ly8gICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHQgICAgICAgICAgICB2YXIgaXRlbXMgPSByZXNwb25zZS5kYXRhO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtcyk7XG5cdCAgICAgICAgICAgIHZhciBhdmFpbGFiaWxpdHkgPSBpdGVtcy5hdmFpbGFibGU7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKGF2YWlsYWJpbGl0eSk7XG5cdCAgICAgICAgICAgIGlmIChhdmFpbGFiaWxpdHkgPT09IG51bGwpIHtcblx0ICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcblx0ICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0J3MgZmFsc2VcIik7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IHRydWU7XG5cdCAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctc2hvd1wiO1xuXHQgICAgICAgICAgICAgICRzY29wZS5zdGF0dXMgPSBpdGVtcy5zdGF0dXM7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLnJlY29yZGlkID0gcmVjb3JkaWQ7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmJyYW5jaCA9IGl0ZW1zLmhvbWVicmFuY2g7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uID0gaXRlbXMubG9jYXRpb247XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmNsYXNzID0gaXRlbXMuY2xhc3M7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmNhbGxudW1iZXIgPSBpdGVtcy5pdGVtY2FsbG51bWJlcjtcblx0ICAgICAgICAgICAgICAkc2NvcGUub3RoZXJMb2NhdGlvbnMgPSAoaXRlbXMudG90YWwgLSAxKTtcblxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIFxuICB0ZW1wbGF0ZTogYFxuPHBybS1zZWFyY2gtcmVzdWx0LWF2YWlsYWJpbGl0eS1rb2hhIG5nLWlmPVwic3RhdHVzXCI+XG4gIDxkaXYgbGF5b3V0PVwicm93XCIgbGF5b3V0LWFsaWduPVwic3RhcnQgc3RhcnRcIiBjbGFzcz1cImxheW91dC1hbGlnbi1zdGFydC1zdGFydCBsYXlvdXQtcm93XCI+PCEtLS0tPlxuICA8ZGl2IGxheW91dD1cImZsZXhcIiBjbGFzcz1cImxheW91dC1yb3dcIj48IS0tLS0+XG4gIDwhLS0tLT5cbiA8cHJtLWljb24gIGF2YWlsYWJpbGl0eS10eXBlPVwiXCIgaWNvbi10eXBlPVwic3ZnXCIgc3ZnLWljb24tc2V0PVwicHJpbW8tdWlcIiBpY29uLWRlZmluaXRpb249XCJib29rLW9wZW5cIj5cbiBcdDxtZC1pY29uIG1kLXN2Zy1pY29uPVwicHJpbW8tdWk6Ym9vay1vcGVuXCIgYWx0PVwiXCIgY2xhc3M9XCJtZC1wcmltb0V4cGxvcmUtdGhlbWVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiBcdFx0PHN2ZyBpZD1cImJvb2stb3BlblwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgeT1cIjQ4MFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBmaXQ9XCJcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiIGZvY3VzYWJsZT1cImZhbHNlXCI+XG4gICAgICAgIDxwYXRoIGQ9XCJNMTksMkwxNCw2LjVWMTcuNUwxOSwxM1YyTTYuNSw1QzQuNTUsNSAyLjQ1LDUuNCAxLDYuNVYyMS4xNkMxLDIxLjQxIDEuMjUsMjEuNjYgMS41LDIxLjY2QzEuNiwyMS42NiAxLjY1LDIxLjU5IDEuNzUsMjEuNTlDMy4xLDIwLjk0IDUuMDUsMjAuNSA2LjUsMjAuNUM4LjQ1LDIwLjUgMTAuNTUsMjAuOSAxMiwyMkMxMy4zNSwyMS4xNSAxNS44LDIwLjUgMTcuNSwyMC41QzE5LjE1LDIwLjUgMjAuODUsMjAuODEgMjIuMjUsMjEuNTZDMjIuMzUsMjEuNjEgMjIuNCwyMS41OSAyMi41LDIxLjU5QzIyLjc1LDIxLjU5IDIzLDIxLjM0IDIzLDIxLjA5VjYuNUMyMi40LDYuMDUgMjEuNzUsNS43NSAyMSw1LjVWNy41TDIxLDEzVjE5QzE5LjksMTguNjUgMTguNywxOC41IDE3LjUsMTguNUMxNS44LDE4LjUgMTMuMzUsMTkuMTUgMTIsMjBWMTNMMTIsOC41VjYuNUMxMC41NSw1LjQgOC40NSw1IDYuNSw1VjVaXCI+PC9wYXRoPjwvc3ZnPlxuICAgIDwvbWQtaWNvbj5cbiAgPHBybS1pY29uLWFmdGVyIHBhcmVudC1jdHJsPVwiJGN0cmxcIj48L3BybS1pY29uLWFmdGVyPjwvcHJtLWljb24+XG4gIDwhLS0tLT5cbiAgPGJ1dHRvbiBjbGFzcz1cIm5ldXRyYWxpemVkLWJ1dHRvbiBtZC1idXR0b24gbWQtcHJpbW9FeHBsb3JlLXRoZW1lIG1kLWluay1yaXBwbGVcIiB0eXBlPVwiYnV0dG9uXCIgIHBybS1icmllZi1pbnRlcm5hbC1idXR0b24tbWFya2VyPVwiXCIgbmctY2xpY2s9XCIkY3RybC5oYW5kbGVBdmFpbGFiaWxpdHkoJGluZGV4LCAkZXZlbnQpOyRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1wiIGFyaWEtbGFiZWw9XCJ7e3N0YXR1c319IHt7YnJhbmNofX1cIiB0aXRsZT1cInt7c3RhdHVzfX0ge3ticmFuY2h9fVwiPlxuICA8c3BhbiBjbGFzcz1cImJ1dHRvbi1jb250ZW50XCI+XG5cdCAgPHNwYW4gbmctaWY9XCJzdGF0dXNcIiBjbGFzcz1cImF2YWlsYWJpbGl0eS1zdGF0dXMge3tjbGFzc319XCIgbmctY2xhc3M9XCJ7J3RleHQtcnRsJzogJGN0cmwuc3dpdGNoVG9MdHJTdHJpbmcoKX1cIj57e3N0YXR1c319IFxuXHRcdCAgPHNwYW4gbmctaWY9XCJicmFuY2hcIiAgY2xhc3M9XCJiZXN0LWxvY2F0aW9uLWxpYnJhcnktY29kZSBsb2NhdGlvbnMtbGlua1wiPnt7YnJhbmNofX08L3NwYW4+IFxuXHRcdCAgPHNwYW4gbmctaWY9XCJsb2NhdGlvblwiIGNsYXNzPVwiYmVzdC1sb2NhdGlvbi1zdWItbG9jYXRpb24gbG9jYXRpb25zLWxpbmtcIj57e2xvY2F0aW9ufX08L3NwYW4+XG5cdFx0ICA8c3BhbiBuZy1pZj1cImNhbGxudW1iZXJcIiBjbGFzcz1cImJlc3QtbG9jYXRpb24tZGVsaXZlcnkgbG9jYXRpb25zLWxpbmtcIj57e2NhbGxudW1iZXJ9fTwvc3Bhbj5cblx0XHQgIDxzcGFuIG5nLWlmPVwib3RoZXJMb2NhdGlvbnMgPiAwXCIgbmctYmluZC1odG1sPVwiJm5ic3A7XCI+PC9zcGFuPlxuXHRcdCAgPHNwYW4gbmctaWY9XCJvdGhlckxvY2F0aW9ucyA+IDBcIj5ldCB7e290aGVyTG9jYXRpb25zfX0gYXV0cmU8c3BhbiBuZy1pZj1cIm90aGVyTG9jYXRpb25zID4gMVwiPnM8L3NwYW4+IGV4ZW1wbGFpcmU8c3BhbiBuZy1pZj1cIm90aGVyTG9jYXRpb25zID4gMVwiPnM8L3NwYW4+PC9zcGFuPlxuXHQgIDwvc3Bhbj48IS0tLS0+IFxuXHQgIDwhLS0tLT5cbiAgPCEtLS0tPlxuIDwvc3Bhbj5cbiA8IS0tLS0+XG5cbiA8cHJtLWljb24gbGluay1hcnJvdz1cIlwiIGljb24tdHlwZT1cInN2Z1wiIHN2Zy1pY29uLXNldD1cInByaW1vLXVpXCIgaWNvbi1kZWZpbml0aW9uPVwiY2hldnJvbi1yaWdodFwiPlxuIFx0PG1kLWljb24gbWQtc3ZnLWljb249XCJwcmltby11aTpjaGV2cm9uLXJpZ2h0XCIgYWx0PVwiXCIgY2xhc3M9XCJtZC1wcmltb0V4cGxvcmUtdGhlbWVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiBcdFx0PHN2ZyBpZD1cImNoZXZyb24tcmlnaHRcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHk9XCIzODRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZml0PVwiXCIgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIiBmb2N1c2FibGU9XCJmYWxzZVwiPlxuICAgICAgICA8cGF0aCBkPVwiTTguNTksMTYuNThMMTMuMTcsMTJMOC41OSw3LjQxTDEwLDZMMTYsMTJMMTAsMThMOC41OSwxNi41OFpcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgIDwvbWQtaWNvbj5cblx0XHQ8cHJtLWljb24tYWZ0ZXIgcGFyZW50LWN0cmw9XCIkY3RybFwiPjwvcHJtLWljb24tYWZ0ZXI+XG4gPC9wcm0taWNvbj5cbiA8ZGl2IGNsYXNzPVwibWQtcmlwcGxlLWNvbnRhaW5lclwiIHN0eWxlPVwiXCI+PC9kaXY+PC9idXR0b24+XG48L2Rpdj48IS0tLS0+PC9kaXY+PCEtLS0tPjwvcHJtLXNlYXJjaC1yZXN1bHQtYXZhaWxhYmlsaXR5LWtvaGE+XG4gYFxufSkuZmFjdG9yeSgna29oYWF2YWlsU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFJdGVtcycsIFtdKS5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFpdGVtc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICB2YXIgb3BlbnVybDtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguZGlzcGxheS50eXBlWzBdO1xuICAgICAgICBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlICE9IFwiam91cm5hbFwiKSB7XG4gICAgICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9cmVjLmlkJnE9XCIgKyBibjtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBrb2hhaXRlbXNTZXJ2aWNlLmdldEtvaGFEYXRhKHVybCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLml0ZW07XG4gICAgICAgICAgICB2YXIga29oYWlkID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uYmlibGlvbnVtYmVyO1xuICAgICAgICAgICAgdmFyIGltYWdlUGF0aCA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmNvdmVyO1xuICAgICAgICAgICAgaWYgKGtvaGFpZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFpZCA9IGtvaGFpZDtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCkucmVtb3ZlQ2xhc3MoXCJuZy1oaWRlXCIpOyAvKiBpbml0aWFsbHkgc2V0IGJ5ICRzY29wZS5rb2hhRGlzcGxheT1mYWxzZSAqL1xuICAgICAgICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1zaG93XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlID09IFwiam91cm5hbFwiKSB7XG5cdCAgICAgIFx0dmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9am91cm5hbHMmcT1cIisgYm47XG5cdFx0ICBcdHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5ncyA9IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzLmxlbmd0aCA7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGhvbGRpbmcgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5nc1tpXVxuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5vbkNsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCAkd2luZG93Lm9wZW4oJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9iaWIvJysgYm4sICdfYmxhbmsnKTtcblx0XHRcdH07XG5cdFx0fSBcblx0XHRcblx0XHR2YXIgZGVsaXZlcnkgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLmRlbGl2ZXJ5O1xuXHRcdGlmIChkZWxpdmVyeSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IGRlbGl2ZXJ5LmxpbmsubGVuZ3RoIDsgaSsrKXtcblx0XHRcdFx0aWYgKGRlbGl2ZXJ5LmxpbmtbaV0uZGlzcGxheUxhYmVsID09IFwib3BlbnVybFwiKSB7XG5cdFx0XHRcdFx0b3BlbnVybCA9IGRlbGl2ZXJ5LmxpbmtbaV0ubGlua1VSTDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob3BlbnVybCAhPSB1bmRlZmluZWQpe1xuXHRcdFx0b3BlbnVybCA9IG9wZW51cmwucmVwbGFjZSgvLitcXD8vLCBcIlwiKTtcblx0XHRcdCRzY29wZS5wcm94aWZpZWR1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2dldFNmeC5waHA/XCIrb3BlbnVybDtcblx0XHRcdCRodHRwLmpzb25wKCRzY29wZS5wcm94aWZpZWR1cmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlLmRhdGEuZXJyb3IgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0IHZhciBrZXlzID0gT2JqZWN0LmtleXMocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdFx0IHZhciBsZW4gPSBrZXlzLmxlbmd0aDtcblx0XHRcdFx0XHQgY29uc29sZS5sb2coXCJTRlggcmVzdWx0czogXCIrbGVuKTtcblx0XHRcdFx0XHQgaWYobGVuID4gMCkge1xuXHRcdFx0XHRcdFx0ICAkc2NvcGUuc2Z4aG9sZGluZ3MgPSByZXNwb25zZS5kYXRhO1xuXHRcdFx0XHRcdCB9XG5cdFx0XHRcdH1cblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0XG5cdFx0XG4gICAgICB9IFxuICAgIH07XG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1PcGFjQWZ0ZXIuaHRtbCdcbn0pLmZhY3RvcnkoJ2tvaGFpdGVtc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0S29oYURhdGE6IGZ1bmN0aW9uIGdldEtvaGFEYXRhKHVybCkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnSlNPTlAnLFxuICAgICAgICB1cmw6IHVybFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV0pLnJ1bihmdW5jdGlvbiAoJGh0dHApIHtcbiAgLy8gTmVjZXNzYXJ5IGZvciByZXF1ZXN0cyB0byBzdWNjZWVkLi4ubm90IHN1cmUgd2h5XG4gICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyAnWC1Gcm9tLUV4TC1BUEktR2F0ZXdheSc6IHVuZGVmaW5lZCB9O1xufSk7XG5cbiIsImltcG9ydCB7IHZpZXdOYW1lIH0gZnJvbSAnLi92aWV3TmFtZSc7XG5pbXBvcnQgeyBrb2hhSXRlbXMgfSBmcm9tICcuL2tvaGFJdGVtcy5tb2R1bGUnO1xuaW1wb3J0IHsga29oYUF2YWlsYWJpbGl0aWVzIH0gZnJvbSAnLi9rb2hhQXZhaWxhYmlsaXRpZXMubW9kdWxlJztcbmltcG9ydCB7IHNmeEhvbGRpbmdzIH0gZnJvbSAnLi9zZnhIb2xkaW5ncy5tb2R1bGUnO1xubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2aWV3Q3VzdG9tJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmd1bGFyTG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFJdGVtcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFBdmFpbGFiaWxpdGllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NmeEhvbGRpbmdzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5hcHAuY29uZmlnKFsnJHNjZURlbGVnYXRlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHNjZURlbGVnYXRlUHJvdmlkZXIpIHtcbiAgdmFyIHVybFdoaXRlbGlzdCA9ICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KCk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly8qKi5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMioqJyk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwOi8vc2Z4LXVuaXYtcmVubmVzMi5ob3N0ZWQuZXhsaWJyaXNncm91cCoqJyk7XG4gICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KHVybFdoaXRlbGlzdCk7XG59XSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnc2Z4SG9sZGluZ3MnLCBbXSkuY29tcG9uZW50KCdwcm1WaWV3T25saW5lQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBzZnhob2xkaW5nc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb2JqID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5saW5rRWxlbWVudC5saW5rc1swXTtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJnZXRJdFRhYlRleHRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwiZGlzcGxheVRleHRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwiaXNMaW5rdG9PbmxpbmVcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwibGlua1wiKSkge1xuICAgICAgICBpZiAob2JqWydnZXRJdFRhYlRleHQnXSA9PSBcInRhYjFfZnVsbFwiICYmIG9ialsnaXNMaW5rdG9PbmxpbmUnXSA9PSB0cnVlICYmIG9ialsnZGlzcGxheVRleHQnXSA9PSBcIm9wZW51cmxmdWxsdGV4dFwiKSB7XG5cdCAgICAgIGNvbnNvbGUubG9nKG9iaik7XG5cdCAgICAgIGNvbnNvbGUubG9nKG9ialsnbGluayddKTtcbiAgICAgICAgICB2YXIgb3BlbnVybCA9IG9ialsnbGluayddO1xuICAgICAgICAgIHZhciBvcGVudXJsU3ZjID0gb3BlbnVybC5yZXBsYWNlKFwiaHR0cDovL2FjY2VkZXIuYnUudW5pdi1yZW5uZXMyLmZyL3NmeF8zM3B1ZWRiXCIsXCJodHRwczovL2NhdGFsb2d1ZXByZXByb2QuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9nZXRTZngucGhwXCIpO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IHNmeGhvbGRpbmdzU2VydmljZS5nZXRTZnhEYXRhKG9wZW51cmxTdmMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgaG9sZGluZ3MgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgaWYgKGhvbGRpbmdzID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgIGNvbnNvbGUubG9nKGhvbGRpbmdzKTtcbiAgICAgICAgICAgICAgJHNjb3BlLnNmeGhvbGRpbmdzID0gaG9sZGluZ3M7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tdmlldy1vbmxpbmUgZGl2IGEuYXJyb3ctbGluay5tZC1wcmltb0V4cGxvcmUtdGhlbWUnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtVmlld09ubGluZUFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdzZnhob2xkaW5nc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2Z4RGF0YTogZnVuY3Rpb24gZ2V0U2Z4RGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuIiwiLy8gRGVmaW5lIHRoZSB2aWV3IG5hbWUgaGVyZS5cbmV4cG9ydCBsZXQgdmlld05hbWUgPSBcIjMzVURSMl9WVTFcIjsiXX0=
