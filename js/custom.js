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

  template: ' \n<a class="neutralized-button arrow-link-button md-button md-primoExplore-theme md-ink-ripple" type="button" prm-brief-internal-button-marker="">\n<span class="button-content">\n\t<span ng-if="status" class="availability-status {{class}}">{{status}} \n\t<span ng-if="branch"  class="best-location-library-code locations-link">{{branch}}</span>\n\t<span ng-if="location"  class="best-location-sub-location locations-link">{{location}}</span> \n\t<span ng-if="callnumber"  class="best-location-delivery locations-link">{{callnumber}}</span>\n</span>\n<span ng-if="otherLocations > 0" ng-bind-html="&nbsp;"></span>\n<span ng-if="otherLocations > 0">et {{otherLocations}} autre<span ng-if="otherLocations > 1">s</span> exemplaire<span ng-if="otherLocations > 1">s</span></span>\n<div class="md-ripple-container" style=""></div></a>\n '
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFJdGVtcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL21haW4uanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3ZpZXdOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE1BQVIsQ0FBZSxvQkFBZixFQUFxQyxFQUFyQyxFQUF5QyxTQUF6QyxDQUFtRCxzQ0FBbkQsRUFBMkY7QUFDekYsWUFBVSxFQUFFLFlBQVksR0FBZCxFQUQrRTtBQUV6RixjQUFZLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixLQUE1QixFQUFtQyxRQUFuQyxFQUE2QyxnQkFBN0MsRUFBK0Q7QUFDekUsU0FBSyxPQUFMLEdBQWUsWUFBWTtBQUN6QixhQUFPLFdBQVAsR0FBcUIsS0FBckIsQ0FEeUIsQ0FDRztBQUM1QixVQUFJLE1BQU0sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixNQUF4QixDQUErQixHQUEvQixDQUFtQyxPQUE3QztBQUNBLFVBQUksSUFBSSxjQUFKLENBQW1CLGdCQUFuQixLQUF3QyxJQUFJLGNBQUosQ0FBbUIsVUFBbkIsQ0FBNUMsRUFBNEU7QUFDMUUsWUFBSSxLQUFLLElBQUksY0FBSixDQUFtQixDQUFuQixDQUFUO0FBQ0EsWUFBSSxTQUFTLElBQUksUUFBSixDQUFhLENBQWIsQ0FBYjtBQUNBLFlBQUksV0FBVyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWY7QUFDQSxZQUFJLE9BQU8sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixNQUF4QixDQUErQixHQUEvQixDQUFtQyxPQUFuQyxDQUEyQyxJ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ckIsRUFBd0IsU0FBeEIsQ0FBa0MsQ0FBbEMsRUFBcUMsVUFBckMsQ0FBckM7QUFDQTtBQUNEO0FBQ0Q7QUFDRCxHQW5CRDtBQW9CQSxPQUFLLE9BQUwsR0FBZSxZQUFXO0FBQ3hCLFdBQVEsSUFBUixDQUFhLDhDQUE0QyxHQUFHLFVBQUgsQ0FBYyxJQUFkLENBQW1CLEdBQW5CLENBQXVCLE9BQXZCLENBQStCLGNBQS9CLENBQThDLENBQTlDLENBQXpELEVBQTJHLFFBQTNHO0FBQ0QsR0FGRDtBQUdBO0FBQ0QsS0FBSSxXQUFXLFNBQWYsRUFBeUI7QUFDeEIsWUFBVSxRQUFRLE9BQVIsQ0FBZ0IsTUFBaEIsRUFBd0IsRUFBeEIsQ0FBVjtBQUNBLFNBQU8sWUFBUCxHQUFzQix3RUFBc0UsT0FBNUY7QUFDQSxRQUFNLEtBQU4sQ0FBWSxPQUFPLFlBQW5CLEVBQWlDLElBQWpDLENBQXNDLFVBQVMsUUFBVCxFQUFtQjtBQUN4RCxPQUFJLFNBQVMsSUFBVCxDQUFjLEtBQWQsSUFBdUIsU0FBM0IsRUFBc0M7QUFDcEMsV0FBTyxXQUFQLEdBQXFCLFNBQVMsSUFBVCxDQUFjLE9BQW5DO0FBQ0Q7QUFDRCxHQUpELEVBSUcsS0FKSCxDQUlTLFVBQVMsQ0FBVCxFQUFZO0FBQ3BCLFdBQVEsR0FBUixDQUFZLENBQVo7QUFDQSxHQU5EO0FBT0E7QUFDRCxDQTlEdUMsQ0FBekM7O0FBZ0VDLElBQUksU0FBSixDQUFjLGNBQWQsRUFBOEI7QUFDdkIsV0FBVSxFQUFDLFlBQVksR0FBYixFQURhO0FBRXZCLGFBQVksd0JBRlc7QUFHdkIsY0FBYTtBQUhVLENBQTlCOzs7Ozs7OztBQ2pGRDtBQUNPLElBQUksOEJBQVcsWUFBZiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFBdmFpbGFiaWxpdGllcycsIFtdKS5jb21wb25lbnQoJ3BybVNlYXJjaFJlc3VsdEF2YWlsYWJpbGl0eUxpbmVBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFhdmFpbFNlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLnJlc3VsdC5wbnguY29udHJvbDtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIHZhciByZWNvcmRpZCA9IG9iai5yZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHR5cGUgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5yZXN1bHQucG54LmRpc3BsYXkudHlwZVswXTtcbi8qXG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlOlwiICsgYm4pO1xuICAgICAgICBjb25zb2xlLmxvZyhcImJpYmxpb251bWJlcjpcIiArIGJuKTtcbiovXG4gICAgICAgIGlmIChibiAmJiBzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiICYmIHR5cGUgIT0gXCJqb3VybmFsXCIpIHtcbiAgICAgICAgICB2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0SXRlbXMucGhwP2JpYmxpb251bWJlcj1cIiArIGJuO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IGtvaGFhdmFpbFNlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHQgICAgICAgICBpZihyZXNwb25zZSl7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQgd29ya2VkXCIpO1xuXHQvLyAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdCAgICAgICAgICAgIHZhciBpdGVtcyA9IHJlc3BvbnNlLmRhdGE7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW1zKTtcblx0ICAgICAgICAgICAgdmFyIGF2YWlsYWJpbGl0eSA9IGl0ZW1zLmF2YWlsYWJsZTtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coYXZhaWxhYmlsaXR5KTtcblx0ICAgICAgICAgICAgaWYgKGF2YWlsYWJpbGl0eSA9PT0gbnVsbCkge1xuXHQgICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlO1xuXHQgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQncyBmYWxzZVwiKTtcblx0ICAgICAgICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1oaWRlXCI7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gdHJ1ZTtcblx0ICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKFwibmctaGlkZVwiKTsgLyogaW5pdGlhbGx5IHNldCBieSAkc2NvcGUua29oYURpc3BsYXk9ZmFsc2UgKi9cblx0ICAgICAgICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1zaG93XCI7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLnN0YXR1cyA9IGl0ZW1zLnN0YXR1cztcblx0ICAgICAgICAgICAgICAkc2NvcGUucmVjb3JkaWQgPSByZWNvcmRpZDtcblx0ICAgICAgICAgICAgICAkc2NvcGUuYnJhbmNoID0gaXRlbXMuaG9tZWJyYW5jaDtcblx0ICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb24gPSBpdGVtcy5sb2NhdGlvbjtcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2xhc3MgPSBpdGVtcy5jbGFzcztcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2FsbG51bWJlciA9IGl0ZW1zLml0ZW1jYWxsbnVtYmVyO1xuXHQgICAgICAgICAgICAgICRzY29wZS5vdGhlckxvY2F0aW9ucyA9IChpdGVtcy50b3RhbCAtIDEpO1xuXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1oaWRlXCI7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgXG4gIHRlbXBsYXRlOiBgIFxuPGEgY2xhc3M9XCJuZXV0cmFsaXplZC1idXR0b24gYXJyb3ctbGluay1idXR0b24gbWQtYnV0dG9uIG1kLXByaW1vRXhwbG9yZS10aGVtZSBtZC1pbmstcmlwcGxlXCIgdHlwZT1cImJ1dHRvblwiIHBybS1icmllZi1pbnRlcm5hbC1idXR0b24tbWFya2VyPVwiXCI+XG48c3BhbiBjbGFzcz1cImJ1dHRvbi1jb250ZW50XCI+XG5cdDxzcGFuIG5nLWlmPVwic3RhdHVzXCIgY2xhc3M9XCJhdmFpbGFiaWxpdHktc3RhdHVzIHt7Y2xhc3N9fVwiPnt7c3RhdHVzfX0gXG5cdDxzcGFuIG5nLWlmPVwiYnJhbmNoXCIgIGNsYXNzPVwiYmVzdC1sb2NhdGlvbi1saWJyYXJ5LWNvZGUgbG9jYXRpb25zLWxpbmtcIj57e2JyYW5jaH19PC9zcGFuPlxuXHQ8c3BhbiBuZy1pZj1cImxvY2F0aW9uXCIgIGNsYXNzPVwiYmVzdC1sb2NhdGlvbi1zdWItbG9jYXRpb24gbG9jYXRpb25zLWxpbmtcIj57e2xvY2F0aW9ufX08L3NwYW4+IFxuXHQ8c3BhbiBuZy1pZj1cImNhbGxudW1iZXJcIiAgY2xhc3M9XCJiZXN0LWxvY2F0aW9uLWRlbGl2ZXJ5IGxvY2F0aW9ucy1saW5rXCI+e3tjYWxsbnVtYmVyfX08L3NwYW4+XG48L3NwYW4+XG48c3BhbiBuZy1pZj1cIm90aGVyTG9jYXRpb25zID4gMFwiIG5nLWJpbmQtaHRtbD1cIiZuYnNwO1wiPjwvc3Bhbj5cbjxzcGFuIG5nLWlmPVwib3RoZXJMb2NhdGlvbnMgPiAwXCI+ZXQge3tvdGhlckxvY2F0aW9uc319IGF1dHJlPHNwYW4gbmctaWY9XCJvdGhlckxvY2F0aW9ucyA+IDFcIj5zPC9zcGFuPiBleGVtcGxhaXJlPHNwYW4gbmctaWY9XCJvdGhlckxvY2F0aW9ucyA+IDFcIj5zPC9zcGFuPjwvc3Bhbj5cbjxkaXYgY2xhc3M9XCJtZC1yaXBwbGUtY29udGFpbmVyXCIgc3R5bGU9XCJcIj48L2Rpdj48L2E+XG4gYFxufSkuZmFjdG9yeSgna29oYWF2YWlsU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFJdGVtcycsIFtdKS5jb21wb25lbnQoJ3BybUZ1bGxWaWV3U2VydmljZUNvbnRhaW5lckFmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwga29oYWl0ZW1zU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlOyAvKiBkZWZhdWx0IGhpZGVzIHRlbXBsYXRlICovXG5cdCAgdmFyIHNlY3Rpb24gPSAkc2NvcGUuJHBhcmVudC4kY3RybC5zZXJ2aWNlLnNjcm9sbElkO1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgdHlwZSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmRpc3BsYXkudHlwZVswXTtcbi8qXG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlOlwiICsgYm4pO1xuICAgICAgICBjb25zb2xlLmxvZyhcImJpYmxpb251bWJlcjpcIiArIGJuKTtcbiovXG4gICAgICAgIGlmIChibiAmJiBzZWN0aW9uID09IFwiZ2V0aXRfbGluazFfMFwiICYmIHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PXJlYy5pZCZxPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWl0ZW1zU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtlZFwiKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaXRlbTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW1zKTtcbiAgICAgICAgICAgIHZhciBrb2hhaWQgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5iaWJsaW9udW1iZXI7XG4gICAgICAgICAgICB2YXIgaW1hZ2VQYXRoID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uY292ZXI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhrb2hhaWQpO1xuICAgICAgICAgICAgaWYgKGtvaGFpZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCdzIGZhbHNlXCIpO1xuICAgICAgICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1oaWRlXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUua29oYWlkID0ga29oYWlkO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG4gICAgICAgICAgICAgICRzY29wZS5rb2hhQ2xhc3MgPSBcIm5nLXNob3dcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctaGlkZVwiO1xuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIFxuICB0ZW1wbGF0ZTogYFxuIDwhLS08cHJlPnt7aXRlbXMgfCBqc29ufX08L3ByZT4tLT5cbjxkaXYgY2xhc3M9XCJwYWRkaW5nLWxlZnQtbWVkaXVtXCI+XG48bWQtbGlzdCBjbGFzcz1cInNlcGFyYXRlLWxpc3QtaXRlbXMgbWFyZ2luLWJvdHRvbS1tZWRpdW0gcGFkZGluZy1ib3R0b20temVybyBtZC1wcmltb0V4cGxvcmUtdGhlbWVcIlwiIHJvbGU9XCJsaXN0XCI+XG48bWQtbGlzdC1pdGVtIGNsYXNzPVwibWQtMi1saW5lIF9tZC1uby1wcm94eSBfbWRcIiBuZy1yZXBlYXQ9XCJpdGVtIGluIGl0ZW1zIHRyYWNrIGJ5ICRpbmRleFwiIHJvbGU9XCJsaXN0aXRlbVwiIG5nLXNob3c9XCJ7e2tvaGFEaXNwbGF5fX1cIiBjbGFzcz1cInt7a29oYUNsYXNzfX0gcm9sZT1cImxpc3RpdGVtXCJcIj5cbjxkaXYgY2xhc3M9XCJsYXlvdXQtZnVsbC13aWR0aCBsYXlvdXQtZGlzcGxheS1mbGV4IG1kLWluay1yaXBwbGUgbGF5b3V0LXJvd1wiIGxheW91dD1cImZsZXhcIj5cblx0PGRpdiBsYXlvdXQ9XCJyb3dcIiBmbGV4PVwiMTAwXCIgbGF5b3V0LWFsaWduPVwic3BhY2UtYmV0d2VlbiBjZW50ZXJcIiBjbGFzcz1cImxheW91dC1hbGlnbi1zcGFjZS1iZXR3ZWVuLWNlbnRlciBsYXlvdXQtcm93IGZsZXgtMTAwXCI+XG5cdFx0PGRpdiBjbGFzcz1cIm1kLWxpc3QtaXRlbS10ZXh0IGxheW91dC13cmFwIGxheW91dC1yb3cgZmxleFwiIGxheW91dD1cInJvd1wiIGxheW91dC13cmFwPVwiXCIgZmxleD1cIlwiPlxuXHRcdFx0PGRpdiBmbGV4PVwiXCIgZmxleC14cz1cIjEwMFwiIGNsYXNzPVwiZmxleC14cy0xMDAgZmxleFwiPlxuICAgXHRcdFx0PGgzPnt7aXRlbS5ob21lYnJhbmNofX08L2gzPlxuXHRcdFx0XHQ8cD5cblx0XHRcdFx0XHQ8c3BhbiBuZy1pZj1cIml0ZW0uaXN0YXR1c1wiIGNsYXNzPVwiYXZhaWxhYmlsaXR5LXN0YXR1cyB7e2l0ZW0uc3RhdHVzQ2xhc3N9fVwiPnt7aXRlbS5pc3RhdHVzfX08L3NwYW4+IFxuXHRcdFx0XHRcdDxzcGFuPiw8L3NwYW4+IFxuXHRcdFx0XHRcdDxzcGFuPnt7aXRlbS5sb2NhdGlvbn19PC9zcGFuPlxuXHRcdFx0XHRcdDxzcGFuPjs8L3NwYW4+IFxuXHRcdFx0XHRcdDxzcGFuPnt7aXRlbS5pdGVtY2FsbG51bWJlcn19PC9zcGFuPlxuXHRcdFx0XHQ8L3A+XG5cdFx0XHQ8L2Rpdj5cblx0PC9kaXY+XG48L2Rpdj5cbjwvZGl2PlxuPC9tZC1saXN0LWl0ZW0+XG48L21kLWxpc3Q+XG48L2Rpdj5cbiAgYFxufSkuZmFjdG9yeSgna29oYWl0ZW1zU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiaW1wb3J0IHsgdmlld05hbWUgfSBmcm9tICcuL3ZpZXdOYW1lJztcbmltcG9ydCB7IGtvaGFJdGVtcyB9IGZyb20gJy4va29oYUl0ZW1zLm1vZHVsZSc7XG5pbXBvcnQgeyBrb2hhQXZhaWxhYmlsaXRpZXMgfSBmcm9tICcuL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUnO1xubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2aWV3Q3VzdG9tJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmd1bGFyTG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFJdGVtcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFBdmFpbGFiaWxpdGllcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuYXBwLmNvbmZpZyhbJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSB7XG4gIHZhciB1cmxXaGl0ZWxpc3QgPSAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCgpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cDovL3NmeC11bml2LXJlbm5lczIuaG9zdGVkLmV4bGlicmlzZ3JvdXAqKicpO1xuICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCh1cmxXaGl0ZWxpc3QpO1xufV0pO1xuXG5hcHAuY29udHJvbGxlcigncHJtT3BhY0FmdGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRodHRwJywgJyR3aW5kb3cnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkd2luZG93KSB7XG5cdFx0dmFyIHZtID0gdGhpcztcbiAgICAgICAgdmFyIG9wZW51cmw7XG5cdFx0Y29uc29sZS5sb2codm0ucGFyZW50Q3RybC5pdGVtLnBueCk7XG5cdFx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoISh2bS5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2wuc291cmNlaWRbMF0gPT0gXCIzM1VEUjJfS09IQVwiKSkge1x0XG5cdFx0XHRcdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvKnZhciBsaW5rcyA9IHZtLnBhcmVudEN0cmwuaXRlbS5saW5rRWxlbWVudC5saW5rcztcblx0XHRpZiAobGlua3MgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBsaW5rcy5sZW5ndGggOyBpKyspe1xuXHRcdFx0XHRpZiAobGlua3NbaV0uZGlzcGxheVRleHQgPT0gXCJvcGVudXJsXCIpIHtcblx0XHRcdFx0XHRvcGVudXJsID0gbGlua3NbaV0ubGluaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0qL1xuXHRcdHZhciBkZWxpdmVyeSA9IHZtLnBhcmVudEN0cmwuaXRlbS5kZWxpdmVyeTtcblx0XHRpZiAoZGVsaXZlcnkgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBkZWxpdmVyeS5saW5rLmxlbmd0aCA7IGkrKyl7XG5cdFx0XHRcdGlmIChkZWxpdmVyeS5saW5rW2ldLmRpc3BsYXlMYWJlbCA9PSBcIm9wZW51cmxcIikge1xuXHRcdFx0XHRcdG9wZW51cmwgPSBkZWxpdmVyeS5saW5rW2ldLmxpbmtVUkw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHZtLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbC5zb3VyY2VpZFswXSA9PSBcIjMzVURSMl9LT0hBXCIpIHtcblx0XHRcdCRzY29wZS5zcnVVcmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PWpvdXJuYWxzJnE9XCIrdm0ucGFyZW50Q3RybC5pdGVtLnBueC5jb250cm9sLnNvdXJjZXJlY29yZGlkWzBdO1xuXHRcdFx0JGh0dHAuanNvbnAoJHNjb3BlLnNydVVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5ncyA9IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzLmxlbmd0aCA7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGhvbGRpbmcgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5nc1tpXVxuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5vbkNsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCAkd2luZG93Lm9wZW4oJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9iaWIvJyt2bS5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2wuc291cmNlcmVjb3JkaWRbMF0sICdfYmxhbmsnKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChvcGVudXJsICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRvcGVudXJsID0gb3BlbnVybC5yZXBsYWNlKC8uK1xcPy8sIFwiXCIpO1xuXHRcdFx0JHNjb3BlLnByb3hpZmllZHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3Mvc2Z4cHJveHkucGhwP1wiK29wZW51cmw7XG5cdFx0XHQkaHR0cC5qc29ucCgkc2NvcGUucHJveGlmaWVkdXJsKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLmVycm9yID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdCAkc2NvcGUuc2Z4aG9sZGluZ3MgPSByZXNwb25zZS5kYXRhLmNvbnRlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1dKTtcblx0XG5cdGFwcC5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgICAgICAgYmluZGluZ3M6IHtwYXJlbnRDdHJsOiAnPCd9LFxuICAgICAgICBjb250cm9sbGVyOiAncHJtT3BhY0FmdGVyQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1PcGFjQWZ0ZXIuaHRtbCdcbiAgICB9KTtcbiAgICAgICAgIFxuICAgICAgICAiLCIvLyBEZWZpbmUgdGhlIHZpZXcgbmFtZSBoZXJlLlxuZXhwb3J0IGxldCB2aWV3TmFtZSA9IFwiMzNVRFIyX1ZVMVwiOyJdfQ==
