(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
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
            console.log(imagePath);
            if (kohaid === null) {
              $scope.kohaDisplay = false;
              console.log("it's false");
              $scope.kohaClass = "ng-hide";
            } else {
              $scope.kohaid = kohaid;
              $scope.imagePath = imagePath;
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

},{}],2:[function(require,module,exports){
'use strict';

var _viewName = require('./viewName');

var _kohaItems = require('./kohaItems.module');

var app = angular.module('viewCustom', ['angularLoad', 'kohaItems']);

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

},{"./kohaItems.module":1,"./viewName":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Define the view name here.
var viewName = exports.viewName = "33UDR2_VU1";

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2tvaGFJdGVtcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL21haW4uanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3ZpZXdOYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE1BQVIsQ0FBZSxXQUFmLEVBQTRCLEVBQTVCLEVBQWdDLFNBQWhDLENBQTBDLGtDQUExQyxFQUE4RTtBQUM1RSxZQUFVLEVBQUUsWUFBWSxHQUFkLEVBRGtFO0FBRTVFLGNBQVksU0FBUyxVQUFULENBQW9CLE1BQXBCLEVBQTRCLEtBQTVCLEVBQW1DLFFBQW5DLEVBQTZDLGdCQUE3QyxFQUErRDtBQUN6RSxTQUFLLE9BQUwsR0FBZSxZQUFZO0FBQ3pCLGFBQU8sV0FBUCxHQUFxQixLQUFyQixDQUR5QixDQUNHO0FBQy9CLFVBQUksVUFBVSxPQUFPLE9BQVAsQ0FBZSxLQUFmLENBQXFCLE9BQXJCLENBQTZCLFFBQTNDO0FBQ0csVUFBSSxNQUFNLE9BQU8sS0FBUCxDQUFhLFVBQWIsQ0FBd0IsSUFBeEIsQ0FBNkIsR0FBN0IsQ0FBaUMsT0FBM0M7QUFDQSxVQUFJLElBQUksY0FBSixDQUFtQixnQkFBbkIsS0FBd0MsSUFBSSxjQUFKLENBQW1CLFVBQW5CLENBQTVDLEVBQTRFO0FBQzFFLFlBQUksS0FBSyxJQUFJLGNBQUosQ0FBbUIsQ0FBbkIsQ0FBVDtBQUNBLFlBQUksU0FBUyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWI7QUFDQSxZQUFJLE9BQU8sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixJQUF4QixDQUE2QixHQUE3QixDQUFpQyxPQUFqQyxDQUF5QyxJQUF6QyxDQUE4QyxDQUE5QyxDQUFYO0FBQ1I7Ozs7QUFJUSxZQUFJLE1BQU0sV0FB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R0FBRyxVQUFILENBQWMsSUFBZCxDQUFtQixHQUFuQixDQUF1QixPQUF2QixDQUErQixjQUEvQixDQUE4QyxDQUE5QyxDQUF6RCxFQUEyRyxRQUEzRztBQUNELEdBRkQ7QUFHQTtBQUNELEtBQUksV0FBVyxTQUFmLEVBQXlCO0FBQ3hCLFlBQVUsUUFBUSxPQUFSLENBQWdCLE1BQWhCLEVBQXdCLEVBQXhCLENBQVY7QUFDQSxTQUFPLFlBQVAsR0FBc0Isd0VBQXNFLE9BQTVGO0FBQ0EsUUFBTSxLQUFOLENBQVksT0FBTyxZQUFuQixFQUFpQyxJQUFqQyxDQUFzQyxVQUFTLFFBQVQsRUFBbUI7QUFDeEQsT0FBSSxTQUFTLElBQVQsQ0FBYyxLQUFkLElBQXVCLFNBQTNCLEVBQXNDO0FBQ3BDLFdBQU8sV0FBUCxHQUFxQixTQUFTLElBQVQsQ0FBYyxPQUFuQztBQUNEO0FBQ0QsR0FKRCxFQUlHLEtBSkgsQ0FJUyxVQUFTLENBQVQsRUFBWTtBQUNwQixXQUFRLEdBQVIsQ0FBWSxDQUFaO0FBQ0EsR0FORDtBQU9BO0FBQ0QsQ0E5RHVDLENBQXpDOztBQWdFQyxJQUFJLFNBQUosQ0FBYyxjQUFkLEVBQThCO0FBQ3ZCLFdBQVUsRUFBQyxZQUFZLEdBQWIsRUFEYTtBQUV2QixhQUFZLHdCQUZXO0FBR3ZCLGNBQWE7QUFIVSxDQUE5Qjs7Ozs7Ozs7QUNoRkQ7QUFDTyxJQUFJLDhCQUFXLFlBQWYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsImFuZ3VsYXIubW9kdWxlKCdrb2hhSXRlbXMnLCBbXSkuY29tcG9uZW50KCdwcm1GdWxsVmlld1NlcnZpY2VDb250YWluZXJBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFpdGVtc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuXHQgIHZhciBzZWN0aW9uID0gJHNjb3BlLiRwYXJlbnQuJGN0cmwuc2VydmljZS5zY3JvbGxJZDtcbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5jb250cm9sO1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZXJlY29yZGlkXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZWlkXCIpKSB7XG4gICAgICAgIHZhciBibiA9IG9iai5zb3VyY2VyZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IG9iai5zb3VyY2VpZFswXTtcbiAgICAgICAgdmFyIHR5cGUgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5kaXNwbGF5LnR5cGVbMF07XG4vKlxuICAgICAgICBjb25zb2xlLmxvZyhcInNvdXJjZTpcIiArIGJuKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJiaWJsaW9udW1iZXI6XCIgKyBibik7XG4qL1xuICAgICAgICBpZiAoYm4gJiYgc2VjdGlvbiA9PSBcImdldGl0X2xpbmsxXzBcIiAmJiBzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiICYmIHR5cGUgIT0gXCJqb3VybmFsXCIpIHtcbiAgICAgICAgICB2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0U3J1LnBocD9pbmRleD1yZWMuaWQmcT1cIiArIGJuO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCB3b3JrZWRcIik7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLml0ZW07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtcyk7XG4gICAgICAgICAgICB2YXIga29oYWlkID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uYmlibGlvbnVtYmVyO1xuICAgICAgICAgICAgdmFyIGltYWdlUGF0aCA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmNvdmVyO1xuICAgICAgICAgICAgY29uc29sZS5sb2coa29oYWlkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGltYWdlUGF0aCk7XG4gICAgICAgICAgICBpZiAoa29oYWlkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0J3MgZmFsc2VcIik7XG4gICAgICAgICAgICAgICRzY29wZS5rb2hhQ2xhc3MgPSBcIm5nLWhpZGVcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5rb2hhaWQgPSBrb2hhaWQ7XG4gICAgICAgICAgICAgICRzY29wZS5pbWFnZVBhdGggPSBpbWFnZVBhdGg7XG4gICAgICAgICAgICAgICRzY29wZS5pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAkc2NvcGUua29oYURpc3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKFwibmctaGlkZVwiKTsgLyogaW5pdGlhbGx5IHNldCBieSAkc2NvcGUua29oYURpc3BsYXk9ZmFsc2UgKi9cbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFDbGFzcyA9IFwibmctc2hvd1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUua29oYUNsYXNzID0gXCJuZy1oaWRlXCI7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgXG4gIHRlbXBsYXRlOiBgXG4gPCEtLTxwcmU+e3tpdGVtcyB8IGpzb259fTwvcHJlPi0tPlxuPGRpdiBjbGFzcz1cInBhZGRpbmctbGVmdC1tZWRpdW1cIj5cbjxtZC1saXN0IGNsYXNzPVwic2VwYXJhdGUtbGlzdC1pdGVtcyBtYXJnaW4tYm90dG9tLW1lZGl1bSBwYWRkaW5nLWJvdHRvbS16ZXJvIG1kLXByaW1vRXhwbG9yZS10aGVtZVwiXCIgcm9sZT1cImxpc3RcIj5cbjxtZC1saXN0LWl0ZW0gY2xhc3M9XCJtZC0yLWxpbmUgX21kLW5vLXByb3h5IF9tZFwiIG5nLXJlcGVhdD1cIml0ZW0gaW4gaXRlbXMgdHJhY2sgYnkgJGluZGV4XCIgcm9sZT1cImxpc3RpdGVtXCIgbmctc2hvdz1cInt7a29oYURpc3BsYXl9fVwiIGNsYXNzPVwie3trb2hhQ2xhc3N9fSByb2xlPVwibGlzdGl0ZW1cIlwiPlxuPGRpdiBjbGFzcz1cImxheW91dC1mdWxsLXdpZHRoIGxheW91dC1kaXNwbGF5LWZsZXggbWQtaW5rLXJpcHBsZSBsYXlvdXQtcm93XCIgbGF5b3V0PVwiZmxleFwiPlxuXHQ8ZGl2IGxheW91dD1cInJvd1wiIGZsZXg9XCIxMDBcIiBsYXlvdXQtYWxpZ249XCJzcGFjZS1iZXR3ZWVuIGNlbnRlclwiIGNsYXNzPVwibGF5b3V0LWFsaWduLXNwYWNlLWJldHdlZW4tY2VudGVyIGxheW91dC1yb3cgZmxleC0xMDBcIj5cblx0XHQ8ZGl2IGNsYXNzPVwibWQtbGlzdC1pdGVtLXRleHQgbGF5b3V0LXdyYXAgbGF5b3V0LXJvdyBmbGV4XCIgbGF5b3V0PVwicm93XCIgbGF5b3V0LXdyYXA9XCJcIiBmbGV4PVwiXCI+XG5cdFx0XHQ8ZGl2IGZsZXg9XCJcIiBmbGV4LXhzPVwiMTAwXCIgY2xhc3M9XCJmbGV4LXhzLTEwMCBmbGV4XCI+XG4gICBcdFx0XHQ8aDM+e3tpdGVtLmhvbWVicmFuY2h9fTwvaDM+XG5cdFx0XHRcdDxwPlxuXHRcdFx0XHRcdDxzcGFuIG5nLWlmPVwiaXRlbS5pc3RhdHVzXCIgY2xhc3M9XCJhdmFpbGFiaWxpdHktc3RhdHVzIHt7aXRlbS5zdGF0dXNDbGFzc319XCI+e3tpdGVtLmlzdGF0dXN9fTwvc3Bhbj4gXG5cdFx0XHRcdFx0PHNwYW4+LDwvc3Bhbj4gXG5cdFx0XHRcdFx0PHNwYW4+e3tpdGVtLmxvY2F0aW9ufX08L3NwYW4+XG5cdFx0XHRcdFx0PHNwYW4+Ozwvc3Bhbj4gXG5cdFx0XHRcdFx0PHNwYW4+e3tpdGVtLml0ZW1jYWxsbnVtYmVyfX08L3NwYW4+XG5cdFx0XHRcdDwvcD5cblx0XHRcdDwvZGl2PlxuXHQ8L2Rpdj5cbjwvZGl2PlxuPC9kaXY+XG48L21kLWxpc3QtaXRlbT5cbjwvbWQtbGlzdD5cbjwvZGl2PlxuICBgXG59KS5mYWN0b3J5KCdrb2hhaXRlbXNTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIGdldEtvaGFEYXRhOiBmdW5jdGlvbiBnZXRLb2hhRGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuXG4iLCJpbXBvcnQgeyB2aWV3TmFtZSB9IGZyb20gJy4vdmlld05hbWUnO1xuaW1wb3J0IHsga29oYUl0ZW1zIH0gZnJvbSAnLi9rb2hhSXRlbXMubW9kdWxlJztcblxubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2aWV3Q3VzdG9tJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmd1bGFyTG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFJdGVtcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuYXBwLmNvbmZpZyhbJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSB7XG4gIHZhciB1cmxXaGl0ZWxpc3QgPSAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCgpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cDovL3NmeC11bml2LXJlbm5lczIuaG9zdGVkLmV4bGlicmlzZ3JvdXAqKicpO1xuICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCh1cmxXaGl0ZWxpc3QpO1xufV0pO1xuXG5hcHAuY29udHJvbGxlcigncHJtT3BhY0FmdGVyQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRodHRwJywgJyR3aW5kb3cnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkd2luZG93KSB7XG5cdFx0dmFyIHZtID0gdGhpcztcbiAgICAgICAgdmFyIG9wZW51cmw7XG5cdFx0Y29uc29sZS5sb2codm0ucGFyZW50Q3RybC5pdGVtLnBueCk7XG5cdFx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoISh2bS5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2wuc291cmNlaWRbMF0gPT0gXCIzM1VEUjJfS09IQVwiKSkge1x0XG5cdFx0XHRcdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvKnZhciBsaW5rcyA9IHZtLnBhcmVudEN0cmwuaXRlbS5saW5rRWxlbWVudC5saW5rcztcblx0XHRpZiAobGlua3MgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBsaW5rcy5sZW5ndGggOyBpKyspe1xuXHRcdFx0XHRpZiAobGlua3NbaV0uZGlzcGxheVRleHQgPT0gXCJvcGVudXJsXCIpIHtcblx0XHRcdFx0XHRvcGVudXJsID0gbGlua3NbaV0ubGluaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0qL1xuXHRcdHZhciBkZWxpdmVyeSA9IHZtLnBhcmVudEN0cmwuaXRlbS5kZWxpdmVyeTtcblx0XHRpZiAoZGVsaXZlcnkgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBkZWxpdmVyeS5saW5rLmxlbmd0aCA7IGkrKyl7XG5cdFx0XHRcdGlmIChkZWxpdmVyeS5saW5rW2ldLmRpc3BsYXlMYWJlbCA9PSBcIm9wZW51cmxcIikge1xuXHRcdFx0XHRcdG9wZW51cmwgPSBkZWxpdmVyeS5saW5rW2ldLmxpbmtVUkw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHZtLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbC5zb3VyY2VpZFswXSA9PSBcIjMzVURSMl9LT0hBXCIpIHtcblx0XHRcdCRzY29wZS5zcnVVcmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PWpvdXJuYWxzJnE9XCIrdm0ucGFyZW50Q3RybC5pdGVtLnBueC5jb250cm9sLnNvdXJjZXJlY29yZGlkWzBdO1xuXHRcdFx0JGh0dHAuanNvbnAoJHNjb3BlLnNydVVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5ncyA9IFtdO1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwIDsgaSA8IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzLmxlbmd0aCA7IGkrKykge1xuXHRcdFx0XHRcdFx0dmFyIGhvbGRpbmcgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5nc1tpXVxuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5vbkNsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCAkd2luZG93Lm9wZW4oJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9iaWIvJyt2bS5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2wuc291cmNlcmVjb3JkaWRbMF0sICdfYmxhbmsnKTtcblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChvcGVudXJsICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRvcGVudXJsID0gb3BlbnVybC5yZXBsYWNlKC8uK1xcPy8sIFwiXCIpO1xuXHRcdFx0JHNjb3BlLnByb3hpZmllZHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3Mvc2Z4cHJveHkucGhwP1wiK29wZW51cmw7XG5cdFx0XHQkaHR0cC5qc29ucCgkc2NvcGUucHJveGlmaWVkdXJsKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLmVycm9yID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdCAkc2NvcGUuc2Z4aG9sZGluZ3MgPSByZXNwb25zZS5kYXRhLmNvbnRlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pLmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1dKTtcblx0XG5cdGFwcC5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgICAgICAgYmluZGluZ3M6IHtwYXJlbnRDdHJsOiAnPCd9LFxuICAgICAgICBjb250cm9sbGVyOiAncHJtT3BhY0FmdGVyQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1PcGFjQWZ0ZXIuaHRtbCdcbiAgICB9KTtcbiAgICAgICAgIFxuICAgICAgICAiLCIvLyBEZWZpbmUgdGhlIHZpZXcgbmFtZSBoZXJlLlxuZXhwb3J0IGxldCB2aWV3TmFtZSA9IFwiMzNVRFIyX1ZVMVwiOyJdfQ==
