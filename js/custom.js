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

angular.module('kohaItems', []).component('prmFullViewServiceContainerAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, kohaitemsService) {
    this.$onInit = function () {
      $scope.kohaDisplay = false; /* default hides template */
      var section = $scope.$parent.$ctrl.service.scrollId;
      var obj = $scope.$ctrl.parentCtrl.item.pnx.control;
      if (obj.hasOwnProperty("sourcerecordid") && obj.hasOwnProperty("sourceid")) {
        var bn = obj.sourcerecordid[0];
        var source = obj.sourceid[0];
        var type = $scope.$ctrl.parentCtrl.item.pnx.display.type[0];
        /*
                console.log("source:" + bn);
                console.log("biblionumber:" + bn);
        */
        if (bn && section == "getit_link1_0" && source == "33UDR2_KOHA" && type != "journal") {
          var url = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=rec.id&q=" + bn;
          var response = kohaitemsService.getKohaData(url).then(function (response) {
            console.log("it worked");
            //console.log(response);
            var items = response.data.record[0].item;
            console.log(items);
            var kohaid = response.data.record[0].biblionumber;
            var imagePath = response.data.record[0].cover;
            console.log(kohaid);
            if (kohaid === null) {
              $scope.kohaDisplay = false;
              console.log("it's false");
              $scope.kohaClass = "ng-hide";
            } else {
              $scope.kohaid = kohaid;
              $scope.items = items;
              $scope.kohaDisplay = true;
              $element.children().removeClass("ng-hide"); /* initially set by $scope.kohaDisplay=false */
              $scope.kohaClass = "ng-show";
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

  template: '\n <!--<pre>{{items | json}}</pre>-->\n<div class="padding-left-medium">\n<md-list class="separate-list-items margin-bottom-medium padding-bottom-zero md-primoExplore-theme"" role="list">\n<md-list-item class="md-2-line _md-no-proxy _md" ng-repeat="item in items track by $index" role="listitem" ng-show="{{kohaDisplay}}" class="{{kohaClass}} role="listitem"">\n<div class="layout-full-width layout-display-flex md-ink-ripple layout-row" layout="flex">\n\t<div layout="row" flex="100" layout-align="space-between center" class="layout-align-space-between-center layout-row flex-100">\n\t\t<div class="md-list-item-text layout-wrap layout-row flex" layout="row" layout-wrap="" flex="">\n\t\t\t<div flex="" flex-xs="100" class="flex-xs-100 flex">\n   \t\t\t<h3>{{item.homebranch}}</h3>\n\t\t\t\t<p>\n\t\t\t\t\t<span ng-if="item.istatus" class="availability-status {{item.statusClass}}">{{item.istatus}}</span> \n\t\t\t\t\t<span>,</span> \n\t\t\t\t\t<span>{{item.location}}</span>\n\t\t\t\t\t<span>;</span> \n\t\t\t\t\t<span>{{item.itemcallnumber}}</span>\n\t\t\t\t</p>\n\t\t\t</div>\n\t</div>\n</div>\n</div>\n</md-list-item>\n</md-list>\n</div>\n  '
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

var app = angular.module('viewCustom', ['angularLoad', 'kohaItems', 'kohaAvailabilities']);

app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
	var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
	urlWhitelist.push('https://catalogue.bu.univ-rennes2**');
	urlWhitelist.push('https://**.bu.univ-rennes2**');
	urlWhitelist.push('https://cataloguepreprod.bu.univ-rennes2**');
	urlWhitelist.push('http://sfx-univ-rennes2.hosted.exlibrisgroup**');
	$sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
}]);

app.controller('prmOpacAfterController', ['$scope', '$http', '$window', function ($scope, $http, $window) {
	var vm = this;
	var openurl;
	console.log(vm.parentCtrl.item.pnx);
	angular.element(document).ready(function () {
		if (!(vm.parentCtrl.item.pnx.control.sourceid[0] == "33UDR2_KOHA")) {
			angular.element(document.querySelector('prm-opac > md-tabs'))[0].style.display = "block";
		}
	});
	/*var links = vm.parentCtrl.item.linkElement.links;
 if (links != undefined) {
 	for (var i = 0 ; i < links.length ; i++){
 		if (links[i].displayText == "openurl") {
 			openurl = links[i].link;
 		}
 	}
 }*/
	var delivery = vm.parentCtrl.item.delivery;
	if (delivery != undefined) {
		for (var i = 0; i < delivery.link.length; i++) {
			if (delivery.link[i].displayLabel == "openurl") {
				openurl = delivery.link[i].linkURL;
			}
		}
	}
	if (vm.parentCtrl.item.pnx.control.sourceid[0] == "33UDR2_KOHA") {
		$scope.sruUrl = "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getSru.php?index=journals&q=" + vm.parentCtrl.item.pnx.control.sourcerecordid[0];
		$http.jsonp($scope.sruUrl).then(function (response) {
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
			$window.open('https://catalogue.bu.univ-rennes2.fr/bib/' + vm.parentCtrl.item.pnx.control.sourcerecordid[0], '_blank');
		};
	}
	if (openurl != undefined) {
		openurl = openurl.replace(/.+\?/, "");
		$scope.proxifiedurl = "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/sfxproxy.php?" + openurl;
		$http.jsonp($scope.proxifiedurl).then(function (response) {
			if (response.data.error == undefined) {
				$scope.sfxholdings = response.data.content;
			}
		}).catch(function (e) {
			console.log(e);
		});
	}
}]);

app.component('prmOpacAfter', {
	bindings: { parentCtrl: '<' },
	controller: 'prmOpacAfterController',
	templateUrl: 'custom/33UDR2_VU1/html/prmOpacAfter.html'
});

},{"./kohaAvailabilities.module":1,"./kohaItems.module":2,"./viewName":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Define the view name here.
var viewName = exports.viewName = "33UDR2_VU1";

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFJdGVtcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL21haW4uanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3ZpZXdOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE1BQVIsQ0FBZSxvQkFBZixFQUFxQyxFQUFyQyxFQUF5QyxTQUF6QyxDQUFtRCxzQ0FBbkQsRUFBMkY7QUFDekYsWUFBVSxFQUFFLFlBQVksR0FBZCxFQUQrRTtBQUV6RixjQUFZLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixLQUE1QixFQUFtQyxRQUFuQyxFQUE2QyxnQkFBN0MsRUFBK0Q7QUFDekUsU0FBSyxPQUFMLEdBQWUsWUFBWTtBQUN6QixhQUFPLFdBQVAsR0FBcUIsS0FBckIsQ0FEeUIsQ0FDRztBQUM1QixVQUFJLE1BQU0sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixNQUF4QixDQUErQixHQUEvQixDQUFtQyxPQUE3QztBQUNBLFVBQUksSUFBSSxjQUFKLENBQW1CLGdCQUFuQixLQUF3QyxJQUFJLGNBQUosQ0FBbUIsVUFBbkIsQ0FBNUMsRUFBNEU7QUFDMUUsWUFBSSxLQUFLLElBQUksY0FBSixDQUFtQixDQUFuQixDQUFUO0FBQ0EsWUFBSSxTQUFTLElBQUksUUFBSixDQUFhLENBQWIsQ0FBYjtBQUNBLFlBQUksV0FBVyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWY7QUFDQSxZQUFJLE9BQU8sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixNQUF4QixDQUErQixHQUEvQixDQUFtQyxPQUFuQyxDQUEyQyxJ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QUFTLElBQVQsQ0FBYyxNQUFkLENBQXFCLENBQXJCLEVBQXdCLFNBQXhCLENBQWtDLENBQWxDLEVBQXFDLFVBQXJDLENBQXJDO0FBQ0E7QUFDRDtBQUNEO0FBQ0QsR0FuQkQ7QUFvQkEsT0FBSyxPQUFMLEdBQWUsWUFBVztBQUN4QixXQUFRLElBQVIsQ0FBYSw4Q0FBNEMsR0FBRyxVQUFILENBQWMsSUFBZCxDQUFtQixHQUFuQixDQUF1QixPQUF2QixDQUErQixjQUEvQixDQUE4QyxDQUE5QyxDQUF6RCxFQUEyRyxRQUEzRztBQUNELEdBRkQ7QUFHQTtBQUNELEtBQUksV0FBVyxTQUFmLEVBQXlCO0FBQ3hCLFlBQVUsUUFBUSxPQUFSLENBQWdCLE1BQWhCLEVBQXdCLEVBQXhCLENBQVY7QUFDQSxTQUFPLFlBQVAsR0FBc0Isd0VBQXNFLE9BQTVGO0FBQ0EsUUFBTSxLQUFOLENBQVksT0FBTyxZQUFuQixFQUFpQyxJQUFqQyxDQUFzQyxVQUFTLFFBQVQsRUFBbUI7QUFDeEQsT0FBSSxTQUFTLElBQVQsQ0FBYyxLQUFkLElBQXVCLFNBQTNCLEVBQXNDO0FBQ3BDLFdBQU8sV0FBUCxHQUFxQixTQUFTLElBQVQsQ0FBYyxPQUFuQztBQUNEO0FBQ0QsR0FKRCxFQUlHLEtBSkgsQ0FJUyxVQUFTLENBQVQsRUFBWTtBQUNwQixXQUFRLEdBQVIsQ0FBWSxDQUFaO0FBQ0EsR0FORDtBQU9BO0FBQ0QsQ0E5RHVDLENBQXpDOztBQWdFQyxJQUFJLFNBQUosQ0FBYyxjQUFkLEVBQThCO0FBQ3ZCLFdBQVUsRUFBQyxZQUFZLEdBQWIsRUFEYTtBQUV2QixhQUFZLHdCQUZXO0FBR3ZCLGNBQWE7QUFIVSxDQUE5Qjs7Ozs7Ozs7QUNsRkQ7QUFDTyxJQUFJLDhCQUFXLFlBQWYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsImFuZ3VsYXIubW9kdWxlKCdrb2hhQXZhaWxhYmlsaXRpZXMnLCBbXSkuY29tcG9uZW50KCdwcm1TZWFyY2hSZXN1bHRBdmFpbGFiaWxpdHlMaW5lQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBrb2hhYXZhaWxTZXJ2aWNlKSB7XG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gZmFsc2U7IC8qIGRlZmF1bHQgaGlkZXMgdGVtcGxhdGUgKi9cbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5yZXN1bHQucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgcmVjb3JkaWQgPSBvYmoucmVjb3JkaWRbMF07XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwucmVzdWx0LnBueC5kaXNwbGF5LnR5cGVbMF07XG4vKlxuICAgICAgICBjb25zb2xlLmxvZyhcInNvdXJjZTpcIiArIGJuKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJiaWJsaW9udW1iZXI6XCIgKyBibik7XG4qL1xuICAgICAgICBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlICE9IFwiam91cm5hbFwiKSB7XG4gICAgICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldEl0ZW1zLnBocD9iaWJsaW9udW1iZXI9XCIgKyBibjtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBrb2hhYXZhaWxTZXJ2aWNlLmdldEtvaGFEYXRhKHVybCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0ICAgICAgICAgaWYocmVzcG9uc2Upe1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtlZFwiKTtcblx0Ly8gICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHQgICAgICAgICAgICB2YXIgaXRlbXMgPSByZXNwb25zZS5kYXRhO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtcyk7XG5cdCAgICAgICAgICAgIHZhciBhdmFpbGFiaWxpdHkgPSBpdGVtcy5hdmFpbGFibGU7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKGF2YWlsYWJpbGl0eSk7XG5cdCAgICAgICAgICAgIGlmIChhdmFpbGFiaWxpdHkgPT09IG51bGwpIHtcblx0ICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcblx0ICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0J3MgZmFsc2VcIik7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IHRydWU7XG5cdCAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctc2hvd1wiO1xuXHQgICAgICAgICAgICAgICRzY29wZS5zdGF0dXMgPSBpdGVtcy5zdGF0dXM7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLnJlY29yZGlkID0gcmVjb3JkaWQ7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmJyYW5jaCA9IGl0ZW1zLmhvbWVicmFuY2g7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmxvY2F0aW9uID0gaXRlbXMubG9jYXRpb247XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmNsYXNzID0gaXRlbXMuY2xhc3M7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmNhbGxudW1iZXIgPSBpdGVtcy5pdGVtY2FsbG51bWJlcjtcblx0ICAgICAgICAgICAgICAkc2NvcGUub3RoZXJMb2NhdGlvbnMgPSAoaXRlbXMudG90YWwgLSAxKTtcblxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIFxuICB0ZW1wbGF0ZTogYFxuPHBybS1zZWFyY2gtcmVzdWx0LWF2YWlsYWJpbGl0eS1rb2hhIG5nLWlmPVwic3RhdHVzXCI+XG4gIDxkaXYgbGF5b3V0PVwicm93XCIgbGF5b3V0LWFsaWduPVwic3RhcnQgc3RhcnRcIiBjbGFzcz1cImxheW91dC1hbGlnbi1zdGFydC1zdGFydCBsYXlvdXQtcm93XCI+PCEtLS0tPlxuICA8ZGl2IGxheW91dD1cImZsZXhcIiBjbGFzcz1cImxheW91dC1yb3dcIj48IS0tLS0+XG4gIDwhLS0tLT5cbiA8cHJtLWljb24gIGF2YWlsYWJpbGl0eS10eXBlPVwiXCIgaWNvbi10eXBlPVwic3ZnXCIgc3ZnLWljb24tc2V0PVwicHJpbW8tdWlcIiBpY29uLWRlZmluaXRpb249XCJib29rLW9wZW5cIj5cbiBcdDxtZC1pY29uIG1kLXN2Zy1pY29uPVwicHJpbW8tdWk6Ym9vay1vcGVuXCIgYWx0PVwiXCIgY2xhc3M9XCJtZC1wcmltb0V4cGxvcmUtdGhlbWVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiBcdFx0PHN2ZyBpZD1cImJvb2stb3BlblwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgeT1cIjQ4MFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBmaXQ9XCJcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwieE1pZFlNaWQgbWVldFwiIGZvY3VzYWJsZT1cImZhbHNlXCI+XG4gICAgICAgIDxwYXRoIGQ9XCJNMTksMkwxNCw2LjVWMTcuNUwxOSwxM1YyTTYuNSw1QzQuNTUsNSAyLjQ1LDUuNCAxLDYuNVYyMS4xNkMxLDIxLjQxIDEuMjUsMjEuNjYgMS41LDIxLjY2QzEuNiwyMS42NiAxLjY1LDIxLjU5IDEuNzUsMjEuNTlDMy4xLDIwLjk0IDUuMDUsMjAuNSA2LjUsMjAuNUM4LjQ1LDIwLjUgMTAuNTUsMjAuOSAxMiwyMkMxMy4zNSwyMS4xNSAxNS44LDIwLjUgMTcuNSwyMC41QzE5LjE1LDIwLjUgMjAuODUsMjAuODEgMjIuMjUsMjEuNTZDMjIuMzUsMjEuNjEgMjIuNCwyMS41OSAyMi41LDIxLjU5QzIyLjc1LDIxLjU5IDIzLDIxLjM0IDIzLDIxLjA5VjYuNUMyMi40LDYuMDUgMjEuNzUsNS43NSAyMSw1LjVWNy41TDIxLDEzVjE5QzE5LjksMTguNjUgMTguNywxOC41IDE3LjUsMTguNUMxNS44LDE4LjUgMTMuMzUsMTkuMTUgMTIsMjBWMTNMMTIsOC41VjYuNUMxMC41NSw1LjQgOC40NSw1IDYuNSw1VjVaXCI+PC9wYXRoPjwvc3ZnPlxuICAgIDwvbWQtaWNvbj5cbiAgPHBybS1pY29uLWFmdGVyIHBhcmVudC1jdHJsPVwiJGN0cmxcIj48L3BybS1pY29uLWFmdGVyPjwvcHJtLWljb24+XG4gIDwhLS0tLT5cbiAgPGJ1dHRvbiBjbGFzcz1cIm5ldXRyYWxpemVkLWJ1dHRvbiBtZC1idXR0b24gbWQtcHJpbW9FeHBsb3JlLXRoZW1lIG1kLWluay1yaXBwbGVcIiB0eXBlPVwiYnV0dG9uXCIgIHBybS1icmllZi1pbnRlcm5hbC1idXR0b24tbWFya2VyPVwiXCIgbmctY2xpY2s9XCIkY3RybC5oYW5kbGVBdmFpbGFiaWxpdHkoJGluZGV4LCAkZXZlbnQpOyRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1wiIGFyaWEtbGFiZWw9XCJ7e3N0YXR1c319IHt7YnJhbmNofX1cIiB0aXRsZT1cInt7c3RhdHVzfX0ge3ticmFuY2h9fVwiPlxuICA8c3BhbiBjbGFzcz1cImJ1dHRvbi1jb250ZW50XCI+XG5cdCAgPHNwYW4gbmctaWY9XCJzdGF0dXNcIiBjbGFzcz1cImF2YWlsYWJpbGl0eS1zdGF0dXMge3tjbGFzc319XCIgbmctY2xhc3M9XCJ7J3RleHQtcnRsJzogJGN0cmwuc3dpdGNoVG9MdHJTdHJpbmcoKX1cIj57e3N0YXR1c319IFxuXHRcdCAgPHNwYW4gbmctaWY9XCJicmFuY2hcIiAgY2xhc3M9XCJiZXN0LWxvY2F0aW9uLWxpYnJhcnktY29kZSBsb2NhdGlvbnMtbGlua1wiPnt7YnJhbmNofX08L3NwYW4+IFxuXHRcdCAgPHNwYW4gbmctaWY9XCJsb2NhdGlvblwiIGNsYXNzPVwiYmVzdC1sb2NhdGlvbi1zdWItbG9jYXRpb24gbG9jYXRpb25zLWxpbmtcIj57e2xvY2F0aW9ufX08L3NwYW4+XG5cdFx0ICA8c3BhbiBuZy1pZj1cImNhbGxudW1iZXJcIiBjbGFzcz1cImJlc3QtbG9jYXRpb24tZGVsaXZlcnkgbG9jYXRpb25zLWxpbmtcIj57e2NhbGxudW1iZXJ9fTwvc3Bhbj5cblx0XHQgIDxzcGFuIG5nLWlmPVwib3RoZXJMb2NhdGlvbnMgPiAwXCIgbmctYmluZC1odG1sPVwiJm5ic3A7XCI+PC9zcGFuPlxuXHRcdCAgPHNwYW4gbmctaWY9XCJvdGhlckxvY2F0aW9ucyA+IDBcIj5ldCB7e290aGVyTG9jYXRpb25zfX0gYXV0cmU8c3BhbiBuZy1pZj1cIm90aGVyTG9jYXRpb25zID4gMVwiPnM8L3NwYW4+IGV4ZW1wbGFpcmU8c3BhbiBuZy1pZj1cIm90aGVyTG9jYXRpb25zID4gMVwiPnM8L3NwYW4+PC9zcGFuPlxuXHQgIDwvc3Bhbj48IS0tLS0+IFxuXHQgIDwhLS0tLT5cbiAgPCEtLS0tPlxuIDwvc3Bhbj5cbiA8IS0tLS0+XG5cbiA8cHJtLWljb24gbGluay1hcnJvdz1cIlwiIGljb24tdHlwZT1cInN2Z1wiIHN2Zy1pY29uLXNldD1cInByaW1vLXVpXCIgaWNvbi1kZWZpbml0aW9uPVwiY2hldnJvbi1yaWdodFwiPlxuIFx0PG1kLWljb24gbWQtc3ZnLWljb249XCJwcmltby11aTpjaGV2cm9uLXJpZ2h0XCIgYWx0PVwiXCIgY2xhc3M9XCJtZC1wcmltb0V4cGxvcmUtdGhlbWVcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiBcdFx0PHN2ZyBpZD1cImNoZXZyb24tcmlnaHRcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHk9XCIzODRcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgZml0PVwiXCIgcHJlc2VydmVBc3BlY3RSYXRpbz1cInhNaWRZTWlkIG1lZXRcIiBmb2N1c2FibGU9XCJmYWxzZVwiPlxuICAgICAgICA8cGF0aCBkPVwiTTguNTksMTYuNThMMTMuMTcsMTJMOC41OSw3LjQxTDEwLDZMMTYsMTJMMTAsMThMOC41OSwxNi41OFpcIj48L3BhdGg+PC9zdmc+XG4gICAgICAgIDwvbWQtaWNvbj5cblx0XHQ8cHJtLWljb24tYWZ0ZXIgcGFyZW50LWN0cmw9XCIkY3RybFwiPjwvcHJtLWljb24tYWZ0ZXI+XG4gPC9wcm0taWNvbj5cbiA8ZGl2IGNsYXNzPVwibWQtcmlwcGxlLWNvbnRhaW5lclwiIHN0eWxlPVwiXCI+PC9kaXY+PC9idXR0b24+XG48L2Rpdj48IS0tLS0+PC9kaXY+PCEtLS0tPjwvcHJtLXNlYXJjaC1yZXN1bHQtYXZhaWxhYmlsaXR5LWtvaGE+XG4gYFxufSkuZmFjdG9yeSgna29oYWF2YWlsU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFJdGVtcycsIFtdKS5jb21wb25lbnQoJ3BybUZ1bGxWaWV3U2VydmljZUNvbnRhaW5lckFmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwga29oYWl0ZW1zU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlOyAvKiBkZWZhdWx0IGhpZGVzIHRlbXBsYXRlICovXG5cdCAgdmFyIHNlY3Rpb24gPSAkc2NvcGUuJHBhcmVudC4kY3RybC5zZXJ2aWNlLnNjcm9sbElkO1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgdHlwZSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmRpc3BsYXkudHlwZVswXTtcbi8qXG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlOlwiICsgYm4pO1xuICAgICAgICBjb25zb2xlLmxvZyhcImJpYmxpb251bWJlcjpcIiArIGJuKTtcbiovXG4gICAgICAgIGlmIChibiAmJiBzZWN0aW9uID09IFwiZ2V0aXRfbGluazFfMFwiICYmIHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PXJlYy5pZCZxPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWl0ZW1zU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtlZFwiKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaXRlbTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW1zKTtcbiAgICAgICAgICAgIHZhciBrb2hhaWQgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5iaWJsaW9udW1iZXI7XG4gICAgICAgICAgICB2YXIgaW1hZ2VQYXRoID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uY292ZXI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrb2hhaWQpO1xuICAgICAgICAgICAgaWYgKGtvaGFpZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCdzIGZhbHNlXCIpO1xuICAgICAgICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1oaWRlXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUua29oYWlkID0ga29oYWlkO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG4gICAgICAgICAgICAgICRzY29wZS5rb2hhQ2xhc3MgPSBcIm5nLXNob3dcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIFxuICB0ZW1wbGF0ZTogYFxuIDwhLS08cHJlPnt7aXRlbXMgfCBqc29ufX08L3ByZT4tLT5cbjxkaXYgY2xhc3M9XCJwYWRkaW5nLWxlZnQtbWVkaXVtXCI+XG48bWQtbGlzdCBjbGFzcz1cInNlcGFyYXRlLWxpc3QtaXRlbXMgbWFyZ2luLWJvdHRvbS1tZWRpdW0gcGFkZGluZy1ib3R0b20temVybyBtZC1wcmltb0V4cGxvcmUtdGhlbWVcIlwiIHJvbGU9XCJsaXN0XCI+XG48bWQtbGlzdC1pdGVtIGNsYXNzPVwibWQtMi1saW5lIF9tZC1uby1wcm94eSBfbWRcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zIHRyYWNrIGJ5ICRpbmRleFwiIHJvbGU9XCJsaXN0aXRlbVwiIG5nLXNob3c9XCJ7e2tvaGFEaXNwbGF5fX1cIiBjbGFzcz1cInt7a29oYUNsYXNzfX0gcm9sZT1cImxpc3RpdGVtXCJcIj5cbjxkaXYgY2xhc3M9XCJsYXlvdXQtZnVsbC13aWR0aCBsYXlvdXQtZGlzcGxheS1mbGV4IG1kLWluay1yaXBwbGUgbGF5b3V0LXJvd1wiIGxheW91dD1cImZsZXhcIj5cblx0PGRpdiBsYXlvdXQ9XCJyb3dcIiBmbGV4PVwiMTAwXCIgbGF5b3V0LWFsaWduPVwic3BhY2UtYmV0d2VlbiBjZW50ZXJcIiBjbGFzcz1cImxheW91dC1hbGlnbi1zcGFjZS1iZXR3ZWVuLWNlbnRlciBsYXlvdXQtcm93IGZsZXgtMTAwXCI+XG5cdFx0PGRpdiBjbGFzcz1cIm1kLWxpc3QtaXRlbS10ZXh0IGxheW91dC13cmFwIGxheW91dC1yb3cgZmxleFwiIGxheW91dD1cInJvd1wiIGxheW91dC13cmFwPVwiXCIgZmxleD1cIlwiPlxuXHRcdFx0PGRpdiBmbGV4PVwiXCIgZmxleC14cz1cIjEwMFwiIGNsYXNzPVwiZmxleC14cy0xMDAgZmxleFwiPlxuICAgXHRcdFx0PGgzPnt7aXRlbS5ob21lYnJhbmNofX08L2gzPlxuXHRcdFx0XHQ8cD5cblx0XHRcdFx0XHQ8c3BhbiBuZy1pZj1cIml0ZW0uaXN0YXR1c1wiIGNsYXNzPVwiYXZhaWxhYmlsaXR5LXN0YXR1cyB7e2l0ZW0uc3RhdHVzQ2xhc3N9fVwiPnt7aXRlbS5pc3RhdHVzfX08L3NwYW4+IFxuXHRcdFx0XHRcdDxzcGFuPiw8L3NwYW4+IFxuXHRcdFx0XHRcdDxzcGFuPnt7aXRlbS5sb2NhdGlvbn19PC9zcGFuPlxuXHRcdFx0XHRcdDxzcGFuPjs8L3NwYW4+IFxuXHRcdFx0XHRcdDxzcGFuPnt7aXRlbS5pdGVtY2FsbG51bWJlcn19PC9zcGFuPlxuXHRcdFx0XHQ8L3A+XG5cdFx0XHQ8L2Rpdj5cblx0PC9kaXY+XG48L2Rpdj5cbjwvZGl2PlxuPC9tZC1saXN0LWl0ZW0+XG48L21kLWxpc3Q+XG48L2Rpdj5cbiAgYFxufSkuZmFjdG9yeSgna29oYWl0ZW1zU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiaW1wb3J0IHsgdmlld05hbWUgfSBmcm9tICcuL3ZpZXdOYW1lJztcbmltcG9ydCB7IGtvaGFJdGVtcyB9IGZyb20gJy4va29oYUl0ZW1zLm1vZHVsZSc7XG5pbXBvcnQgeyBrb2hhQXZhaWxhYmlsaXRpZXMgfSBmcm9tICcuL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUnO1xubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2aWV3Q3VzdG9tJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmd1bGFyTG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFJdGVtcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFBdmFpbGFiaWxpdGllcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuYXBwLmNvbmZpZyhbJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSB7XG4gIHZhciB1cmxXaGl0ZWxpc3QgPSAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCgpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vKiouYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cDovL3NmeC11bml2LXJlbm5lczIuaG9zdGVkLmV4bGlicmlzZ3JvdXAqKicpO1xuICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCh1cmxXaGl0ZWxpc3QpO1xufV0pO1xuXG5hcHAuY29udHJvbGxlcigncHJtT3BhY0FmdGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRodHRwJywgJyR3aW5kb3cnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkd2luZG93KSB7XG5cdFx0dmFyIHZtID0gdGhpcztcbiAgICAgICAgdmFyIG9wZW51cmw7XG5cdFx0Y29uc29sZS5sb2codm0ucGFyZW50Q3RybC5pdGVtLnBueCk7XG5cdFx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoISh2bS5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2wuc291cmNlaWRbMF0gPT0gXCIzM1VEUjJfS09IQVwiKSkge1x0XG5cdFx0XHRcdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvKnZhciBsaW5rcyA9IHZtLnBhcmVudEN0cmwuaXRlbS5saW5rRWxlbWVudC5saW5rcztcblx0XHRpZiAobGlua3MgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBsaW5rcy5sZW5ndGggOyBpKyspe1xuXHRcdFx0XHRpZiAobGlua3NbaV0uZGlzcGxheVRleHQgPT0gXCJvcGVudXJsXCIpIHtcblx0XHRcdFx0XHRvcGVudXJsID0gbGlua3NbaV0ubGluaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0qL1xuXHRcdHZhciBkZWxpdmVyeSA9IHZtLnBhcmVudEN0cmwuaXRlbS5kZWxpdmVyeTtcblx0XHRpZiAoZGVsaXZlcnkgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBkZWxpdmVyeS5saW5rLmxlbmd0aCA7IGkrKyl7XG5cdFx0XHRcdGlmIChkZWxpdmVyeS5saW5rW2ldLmRpc3BsYXlMYWJlbCA9PSBcIm9wZW51cmxcIikge1xuXHRcdFx0XHRcdG9wZW51cmwgPSBkZWxpdmVyeS5saW5rW2ldLmxpbmtVUkw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHZtLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbC5zb3VyY2VpZFswXSA9PSBcIjMzVURSMl9LT0hBXCIpIHtcblx0XHRcdCRzY29wZS5zcnVVcmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PWpvdXJuYWxzJnE9XCIrdm0ucGFyZW50Q3RybC5pdGVtLnBueC5jb250cm9sLnNvdXJjZXJlY29yZGlkWzBdO1xuXHRcdFx0JGh0dHAuanNvbnAoJHNjb3BlLnNydVVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5ncyA9IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzLmxlbmd0aCA7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGhvbGRpbmcgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5nc1tpXVxuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5vbkNsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCAkd2luZG93Lm9wZW4oJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9iaWIvJyt2bS5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2wuc291cmNlcmVjb3JkaWRbMF0sICdfYmxhbmsnKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChvcGVudXJsICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRvcGVudXJsID0gb3BlbnVybC5yZXBsYWNlKC8uK1xcPy8sIFwiXCIpO1xuXHRcdFx0JHNjb3BlLnByb3hpZmllZHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3Mvc2Z4cHJveHkucGhwP1wiK29wZW51cmw7XG5cdFx0XHQkaHR0cC5qc29ucCgkc2NvcGUucHJveGlmaWVkdXJsKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLmVycm9yID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdCAkc2NvcGUuc2Z4aG9sZGluZ3MgPSByZXNwb25zZS5kYXRhLmNvbnRlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1dKTtcblx0XG5cdGFwcC5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgICAgICAgYmluZGluZ3M6IHtwYXJlbnRDdHJsOiAnPCd9LFxuICAgICAgICBjb250cm9sbGVyOiAncHJtT3BhY0FmdGVyQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1PcGFjQWZ0ZXIuaHRtbCdcbiAgICB9KTtcbiAgICAgICAgIFxuICAgICAgICAiLCIvLyBEZWZpbmUgdGhlIHZpZXcgbmFtZSBoZXJlLlxuZXhwb3J0IGxldCB2aWV3TmFtZSA9IFwiMzNVRFIyX1ZVMVwiOyJdfQ==
