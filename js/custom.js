(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var googleAnalyticsConfig = exports.googleAnalyticsConfig = Object.freeze({
  name: 'googleAnalyticsConfig',
  config: {
    trackingId: "UA-4789419-7",
    externalScriptURL: "https://www.googletagmanager.com/gtag/js?id=UA-4789419-7"
  }
});

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
							$scope.loading = false;
							if (angular.element(document.querySelector('prm-opac > md-tabs')).length > 0) {
								angular.element(document.querySelector('prm-opac > md-tabs'))[0].style.display = "none";
							}
							$scope.kohaholdings = [];

							for (var i = 0; i < response.data.record[0].holdings.length; i++) {
								var holding = response.data.record[0].holdings[i];
								$scope.loading = false;
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
						} else {
							console.log("journal : no print holding");
							$scope.loading = false;
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

},{}],4:[function(require,module,exports){
'use strict';

require('primo-explore-google-analytics');

var _viewName = require('./viewName');

var _kohaItems = require('./kohaItems.module');

var _kohaAvailabilities = require('./kohaAvailabilities.module');

var _sfxHoldings = require('./sfxHoldings.module');

var _googleAnalyticsConfig = require('./googleAnalyticsConfig');

var app = angular.module('viewCustom', ['angularLoad', 'kohaItems', 'kohaAvailabilities', 'sfxHoldings', 'googleAnalytics']);
// import 'primo-explore-oadoi-link';


app.constant(_googleAnalyticsConfig.googleAnalyticsConfig.name, _googleAnalyticsConfig.googleAnalyticsConfig.config);
/*
  .constant('oadoiOptions', {
	  	"imagePath": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAk1BMVEX///81vfYqufWy7eNUwus3vvZ92uWp6+IuvPcoufYxvfjZ8PlUx/XQ9urV7vn6//3I6fVgxeNGwvYxtu1Yv92E3eVay/Hq+/SI3+Nzy+Ch6OJ01uiw4O1Mxfjy/fjE8+e95fGT1eRnxuCk3Oljz+1Fu+x7ytpSu9+J0OBLuedYvt+s4OuS2eaU4+LZ+O3J9Oht1OtlyPIDAAADeklEQVR4nO2aa3fiIBCGBY0OWV3XEOttTdN2Y2/W9v//uo0b04uGzEDgcE6X92PCME9gYIDQ6wUFBQUFBX0SexcMCJrNVvu7/JcTAAZEsahY7Z9tQTBTAefJbO8RoGK4ff7hEaAU58WDV4BjM6w6hUNngCODiH56BSgRiju/AGVH3Bp2hCWAMhyLG78AZSMYBYI9gBKBGTSCTYCyEXZ+AcpI0O4GywBspktgG4CJJz0E6wBMzDwDMKGVIB0AMK2h4AIA5G+/AGVuoicGcp28EpBK8xk5Dqjek/m6fz162WwZCYGT10kkgGjTX5zKTydjzgnI0h4Av5qc2WQvBARqXkI/hc+nl1YJTkCNQ/T7101WizFKIFZ2ABr9kwhYbgGAv32UzA6TxafeeEVHAydNR61VQFIHfy97SyIWjecfAYk2ASdlpfYqRnWx/vY4BQFwGNaP8E7gXQFgXDf58mPsi7oN+u4B3jtAfKl2e3qMzwaU6bDNfnMqc/gab+LUCxM0DAtCRmizr4fg8PzF4d/jbIsRUMZBm/1rVWQRnde7rF68YX1AmYxazKH60Mtog3H1YokBxAW+QG0DOI2B+aWf6sUaHwf46owAsFEBjFAAGKBh2GZexcAiuYw1KgCTaE5ss95eZ1l2+NPghgzA0YOLdvvjqWCTyADw1A1AJTJAXHgGqIv6A0AT0rcHgACATYVqS66UOHXsWhAmAiwdqQw3C8SwUj9C1gSmALxhO9RMgDQCYMlABUD035uO25vAFACdwN7VkKxtAERkgCECYBgD9gAMh+H3ATDNBQHg2wAAWpFrgIFnAI6e1jkGwI+t3QIQdqduAeAWtXcKEONbQ7cAQDi1dwqAjwHHAIQecAtAOat1CYCuBVwDdDoptQCAnw20AJCX5b0rJYAg/bhSWS9pO5NJwwlW/Q20H2dK86uXPq6RemcGj7S/6Cp7pt6bfpZ6W4SfjyEAXZUS/5268k+OYkf+8fNBtwCxzP0CUNKgQwBINe6xuAB41LnX5sA/5Br+HQDE5KsDbgBiqXe30bZ/TffWAUD7aqdl/6Q1iDsAcZ/7BACjS6XW3Mfi3sS/NQCQO7PLzZb881Tj/pp1ACH177JaBIjlrsvt9q7egWvlPtsAINMb84v1HQEAuDSYeLoDlI65LNJOHW8OEEk5SFcPecd2DwoKCgr63/UXnxY8Wl1A45AAAAAASUVORK5CYII=",
	  	"email": "bibliotheques@univ-rennes2.fr"
  });
*/

app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
       var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
       urlWhitelist.push('https://catalogue.bu.univ-rennes2**');
       urlWhitelist.push('https://**.bu.univ-rennes2**');
       urlWhitelist.push('https://cataloguepreprod.bu.univ-rennes2**');
       urlWhitelist.push('http://sfx-univ-rennes2.hosted.exlibrisgroup**');
       $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
}]);

// change advanced search to jump to results
app.controller('prmAdvancedSearchAfterController', function ($scope) {
       // watch to see if advanced search is there
       var advancedSearchObs = new MutationObserver(function (mutations) {
              mutations.forEach(function (mutation) {
                     if (!mutation.addedNodes) return;
                     for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var node = mutation.addedNodes[i];

                            if (node.nodeName == "BUTTON" && document.querySelector("prm-advanced-search .button-confirm.button-large.button-with-icon.md-button.md-primoExplore-theme.md-ink-ripple")) {
                                   //need an id to jump to
                                   var submitArea = document.querySelector(".advanced-search-output.layout-row.flex");
                                   submitArea.setAttribute("id", "advancedSearchSubmitArea");

                                   var submitBtn = document.querySelector("prm-advanced-search .button-confirm.button-large.button-with-icon.md-button.md-primoExplore-theme.md-ink-ripple");
                                   submitBtn.addEventListener("click", function () {
                                          // wait for some results
                                          var advancedSearchObs2 = new MutationObserver(function (mutations2) {
                                                 mutations2.forEach(function (mutation2) {
                                                        if (!mutation2.addedNodes) return;
                                                        for (var i = 0; i < mutation2.addedNodes.length; i++) {
                                                               var node = mutation2.addedNodes[i];
                                                               if (node.nodeName == "PRM-SEARCH-RESULT-SORT-BY" && window.innerHeight < 775) {
                                                                      window.location.hash = 'advancedSearchSubmitArea';
                                                                      advancedSearchObs2.disconnect();
                                                               }
                                                        }
                                                 });
                                          });

                                          advancedSearchObs2.observe(document.getElementsByTagName('prm-explore-main')[0], {
                                                 childList: true,
                                                 subtree: true,
                                                 attributes: false,
                                                 characterData: false
                                          });
                                          //end wait for some results
                                   });
                            }
                     }
              });
       });

       advancedSearchObs.observe(document.getElementsByTagName('prm-advanced-search')[0], {
              childList: true,
              subtree: true,
              attributes: false,
              characterData: false
       });
});

//AngularJS' orderBy filter does just support arrays - no objects. So you have to write an own small filter, which does the sorting for you.
app.filter('orderObjectBy', function () {
       return function (input, attribute) {
              if (!angular.isObject(input)) return input;

              var array = [];
              for (var objectKey in input) {
                     array.push(input[objectKey]);
              }

              array.sort(function (a, b) {
                     a = parseInt(a[attribute]);
                     b = parseInt(b[attribute]);
                     return a - b;
              });
              return array;
       };
});

app.run(runBlock);

runBlock.$inject = ['gaInjectionService'];

function runBlock(gaInjectionService) {
       gaInjectionService.injectGACode();
}

},{"./googleAnalyticsConfig":1,"./kohaAvailabilities.module":2,"./kohaItems.module":3,"./sfxHoldings.module":5,"./viewName":6,"primo-explore-google-analytics":11}],5:[function(require,module,exports){
'use strict';

angular.module('sfxHoldings', []).component('prmViewOnlineAfter', {
  bindings: { parentCtrl: '<' },
  controller: function controller($scope, $http, $element, sfxholdingsService) {
    this.$onInit = function () {

      var obj = $scope.$ctrl.parentCtrl.item.linkElement.links[0];
      if (obj.hasOwnProperty("getItTabText") && obj.hasOwnProperty("displayText") && obj.hasOwnProperty("isLinktoOnline") && obj.hasOwnProperty("link")) {
        if (obj['displayText'] == "openurlfulltext") {
          $scope.sfxloading = true;
          console.log(obj);
          console.log(obj['link']);
          var openurl = obj['link'];
          var openurlSvc = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", "https://catalogue.bu.univ-rennes2.fr/r2microws/getSfx.php");
          var response = sfxholdingsService.getSfxData(openurlSvc).then(function (response) {
            var holdings = response.data;
            if (holdings === null) {} else {

              if (angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme')).length > 0) {
                angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme'))[0].style.display = "none";
              }
              $scope.sfxloading = false;
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

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Define the view name here.
var viewName = exports.viewName = "33UDR2_VU1";

},{}],7:[function(require,module,exports){
/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Google Tag Manager Plugin Contributed by http://github.com/danrowe49
 * License: MIT
 */

(function (angular) {
  'use strict';


  /**
   * @ngdoc overview
   * @name angulartics.google.analytics
   * Enables analytics support for Google Tag Manager (http://google.com/tagmanager)
   */

  angular.module('angulartics.google.tagmanager', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {

      $analyticsProvider.settings.ga = {
        userId: null
      };

      /**
       * Send content views to the dataLayer
       *
       * @param {string} path Required 'content name' (string) describes the content loaded
       */

      $analyticsProvider.registerPageTrack(function (path) {
        var dataLayer = window.dataLayer = window.dataLayer || [];
        dataLayer.push({
          'event': 'content-view',
          'content-name': path,
          'userId': $analyticsProvider.settings.ga.userId
        });
      });

      /**
       * Send interactions to the dataLayer, i.e. for event tracking in Google Analytics
       * @name eventTrack
       *
       * @param {string} action Required 'action' (string) associated with the event
       * @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
       */

      $analyticsProvider.registerEventTrack(function (action, properties) {
        var dataLayer = window.dataLayer = window.dataLayer || [];
        properties = properties || {};
        dataLayer.push({
          'event': properties.event || 'interaction',
          'target': properties.category,
          'action': action,
          'target-properties': properties.label,
          'value': properties.value,
          'interaction-type': properties.noninteraction,
          'userId': $analyticsProvider.settings.ga.userId
        });

      });

      /**
       * Set userId for use with Universal Analytics User ID feature
       * @name setUsername
       * 
       * @param {string} userId Required 'userId' value (string) used to identify user cross-device in Google Analytics
       */

      $analyticsProvider.registerSetUsername(function (userId) {
        $analyticsProvider.settings.ga.userId = userId;
      });

    }]);

})(angular);

},{}],8:[function(require,module,exports){
require('./angulartics-google-tag-manager');
module.exports = 'angulartics.google.tagmanager';

},{"./angulartics-google-tag-manager":7}],9:[function(require,module,exports){
/**
 * @license Angulartics
 * (c) 2013 Luis Farzati http://angulartics.github.io/
 * License: MIT
 */
(function(angular, analytics) {
'use strict';

var angulartics = window.angulartics || (window.angulartics = {});
angulartics.waitForVendorCount = 0;
angulartics.waitForVendorApi = function (objectName, delay, containsField, registerFn, onTimeout) {
  if (!onTimeout) { angulartics.waitForVendorCount++; }
  if (!registerFn) { registerFn = containsField; containsField = undefined; }
  if (!Object.prototype.hasOwnProperty.call(window, objectName) || (containsField !== undefined && window[objectName][containsField] === undefined)) {
    setTimeout(function () { angulartics.waitForVendorApi(objectName, delay, containsField, registerFn, true); }, delay);
  }
  else {
    angulartics.waitForVendorCount--;
    registerFn(window[objectName]);
  }
};

/**
 * @ngdoc overview
 * @name angulartics
 */
angular.module('angulartics', [])
.provider('$analytics', $analytics)
.run(['$rootScope', '$window', '$analytics', '$injector', $analyticsRun])
.directive('analyticsOn', ['$analytics', analyticsOn])
.config(['$provide', exceptionTrack]);

function $analytics() {
  var vm = this;

  var settings = {
    pageTracking: {
      autoTrackFirstPage: true,
      autoTrackVirtualPages: true,
      trackRelativePath: false,
      trackRoutes: true,
      trackStates: true,
      autoBasePath: false,
      basePath: '',
      excludedRoutes: [],
      queryKeysWhitelisted: [],
      queryKeysBlacklisted: [],
      filterUrlSegments: []
    },
    eventTracking: {},
    bufferFlushDelay: 1000, // Support only one configuration for buffer flush delay to simplify buffering
    trackExceptions: false,
    optOut: false,
    developerMode: false // Prevent sending data in local/development environment
  };

  // List of known handlers that plugins can register themselves for
  var knownHandlers = [
    'pageTrack',
    'eventTrack',
    'exceptionTrack',
    'transactionTrack',
    'setAlias',
    'setUsername',
    'setUserProperties',
    'setUserPropertiesOnce',
    'setSuperProperties',
    'setSuperPropertiesOnce',
    'incrementProperty',
    'userTimings',
    'clearCookies'
  ];
  // Cache and handler properties will match values in 'knownHandlers' as the buffering functons are installed.
  var cache = {};
  var handlers = {};
  var handlerOptions = {};

  // General buffering handler
  function bufferedHandler(handlerName){
    return function(){
      if(angulartics.waitForVendorCount){
        if(!cache[handlerName]){ cache[handlerName] = []; }
        cache[handlerName].push(arguments);
      }
    };
  }

  // As handlers are installed by plugins, they get pushed into a list and invoked in order.
  function updateHandlers(handlerName, fn, options){
    if(!handlers[handlerName]){
      handlers[handlerName] = [];
    }
    handlers[handlerName].push(fn);
    handlerOptions[fn] = options;
    return function(){
      if(!this.settings.optOut) {
        var handlerArgs = Array.prototype.slice.apply(arguments);
        return this.$inject(['$q', angular.bind(this, function($q) {
          return $q.all(handlers[handlerName].map(function(handlerFn) {
            var options = handlerOptions[handlerFn] || {};
            if (options.async) {
              var deferred = $q.defer();
              var currentArgs = angular.copy(handlerArgs);
              currentArgs.unshift(deferred.resolve);
              handlerFn.apply(this, currentArgs);
              return deferred.promise;
            } else{
              return $q.when(handlerFn.apply(this, handlerArgs));
            }
          }, this));
        })]);
      }
    };
  }

  // The api (returned by this provider) gets populated with handlers below.
  var api = {
    settings: settings
  };

  // Opt in and opt out functions
  api.setOptOut = function(optOut) {
    this.settings.optOut = optOut;
    triggerRegister();
  };

  api.getOptOut = function() {
    return this.settings.optOut;
  };


  // Will run setTimeout if delay is > 0
  // Runs immediately if no delay to make sure cache/buffer is flushed before anything else.
  // Plugins should take care to register handlers by order of precedence.
  function onTimeout(fn, delay){
    if(delay){
      setTimeout(fn, delay);
    } else {
      fn();
    }
  }

  var provider = {
    $get: ['$injector', function($injector) {
      return apiWithInjector($injector);
    }],
    api: api,
    settings: settings,
    virtualPageviews: function (value) { this.settings.pageTracking.autoTrackVirtualPages = value; },
    trackStates: function (value) { this.settings.pageTracking.trackStates = value; },
    trackRoutes: function (value) { this.settings.pageTracking.trackRoutes = value; },
    excludeRoutes: function(routes) { this.settings.pageTracking.excludedRoutes = routes; },
    queryKeysWhitelist: function(keys) { this.settings.pageTracking.queryKeysWhitelisted = keys; },
    queryKeysBlacklist: function(keys) { this.settings.pageTracking.queryKeysBlacklisted = keys; },
    filterUrlSegments: function(filters) { this.settings.pageTracking.filterUrlSegments = filters; },
    firstPageview: function (value) { this.settings.pageTracking.autoTrackFirstPage = value; },
    withBase: function (value) {
      this.settings.pageTracking.basePath = (value) ? angular.element(document).find('base').attr('href') : '';
    },
    withAutoBase: function (value) { this.settings.pageTracking.autoBasePath = value; },
    trackExceptions: function (value) { this.settings.trackExceptions = value; },
    developerMode: function(value) { this.settings.developerMode = value; }
  };

  // General function to register plugin handlers. Flushes buffers immediately upon registration according to the specified delay.
  function register(handlerName, fn, options){
    // Do not add a handler if developerMode is true
    if (settings.developerMode) {
        return;
    }
    api[handlerName] = updateHandlers(handlerName, fn, options);
    var handlerSettings = settings[handlerName];
    var handlerDelay = (handlerSettings) ? handlerSettings.bufferFlushDelay : null;
    var delay = (handlerDelay !== null) ? handlerDelay : settings.bufferFlushDelay;
    angular.forEach(cache[handlerName], function (args, index) {
      onTimeout(function () { fn.apply(this, args); }, index * delay);
    });
  }

  function capitalize(input) {
      return input.replace(/^./, function (match) {
          return match.toUpperCase();
      });
  }

  //provide a method to inject services into handlers
  var apiWithInjector = function(injector) {
    return angular.extend(api, {
      '$inject': injector.invoke
    });
  };

  // Adds to the provider a 'register#{handlerName}' function that manages multiple plugins and buffer flushing.
  function installHandlerRegisterFunction(handlerName){
    var registerName = 'register'+capitalize(handlerName);
    provider[registerName] = function(fn, options){
      register(handlerName, fn, options);
    };
    api[handlerName] = updateHandlers(handlerName, bufferedHandler(handlerName));
  }

  function startRegistering(_provider, _knownHandlers, _installHandlerRegisterFunction) {
    angular.forEach(_knownHandlers, _installHandlerRegisterFunction);

    for (var key in _provider) {
      vm[key] = _provider[key];
    }
  }

  // Allow $angulartics to trigger the register to update opt in/out
  var triggerRegister = function() {
    startRegistering(provider, knownHandlers, installHandlerRegisterFunction);
  };

  // Initial register
  startRegistering(provider, knownHandlers, installHandlerRegisterFunction);

}

function $analyticsRun($rootScope, $window, $analytics, $injector) {

  function matchesExcludedRoute(url) {
    for (var i = 0; i < $analytics.settings.pageTracking.excludedRoutes.length; i++) {
      var excludedRoute = $analytics.settings.pageTracking.excludedRoutes[i];
      if ((excludedRoute instanceof RegExp && excludedRoute.test(url)) || url.indexOf(excludedRoute) > -1) {
        return true;
      }
    }
    return false;
  }

  function arrayDifference(a1, a2) {
    var result = [];
    for (var i = 0; i < a1.length; i++) {
      if (a2.indexOf(a1[i]) === -1) {
        result.push(a1[i]);
      }
    }
    return result;
  }

  function filterQueryString(url, keysMatchArr, thisType){
    if (/\?/.test(url) && keysMatchArr.length > 0) {
      var urlArr = url.split('?');
      var urlBase = urlArr[0];
      var pairs = urlArr[1].split('&');
      var matchedPairs = [];

      for (var i = 0; i < keysMatchArr.length; i++) {
        var listedKey = keysMatchArr[i];
        for (var j = 0; j < pairs.length; j++) {
          if ((listedKey instanceof RegExp && listedKey.test(pairs[j])) || pairs[j].indexOf(listedKey) > -1) matchedPairs.push(pairs[j]);
        }
      }

      var matchedPairsArr = (thisType == 'white' ? matchedPairs : arrayDifference(pairs,matchedPairs));
      if(matchedPairsArr.length > 0){
        return urlBase + '?' + matchedPairsArr.join('&');
      }else{
        return urlBase;
      }
    } else {
      return url;
    }
  }

  function whitelistQueryString(url){
    return filterQueryString(url, $analytics.settings.pageTracking.queryKeysWhitelisted, 'white');
  }

  function blacklistQueryString(url){
    return filterQueryString(url, $analytics.settings.pageTracking.queryKeysBlacklisted, 'black');
  }

  function filterUrlSegments(url){
    var segmentFiltersArr = $analytics.settings.pageTracking.filterUrlSegments;

    if (segmentFiltersArr.length > 0) {
      var urlArr = url.split('?');
      var urlBase = urlArr[0];

      var segments = urlBase.split('/');

      for (var i = 0; i < segmentFiltersArr.length; i++) {
        var segmentFilter = segmentFiltersArr[i];

        for (var j = 1; j < segments.length; j++) {
          /* First segment will be host/protocol or base path. */
          if ((segmentFilter instanceof RegExp && segmentFilter.test(segments[j])) || segments[j].indexOf(segmentFilter) > -1) {
            segments[j] = 'FILTERED';
          }
        }
      }

      return segments.join('/');
    } else {
      return url;
    }
  }

  function pageTrack(url, $location) {
    if (!matchesExcludedRoute(url)) {
      url = whitelistQueryString(url);
      url = blacklistQueryString(url);
      url = filterUrlSegments(url);
      $analytics.pageTrack(url, $location);
    }
  }

  if ($analytics.settings.pageTracking.autoTrackFirstPage) {
    /* Only track the 'first page' if there are no routes or states on the page */
    var noRoutesOrStates = true;
    if ($injector.has('$route')) {
       var $route = $injector.get('$route');
       if ($route) {
        for (var route in $route.routes) {
          noRoutesOrStates = false;
          break;
        }
       } else if ($route === null){
        noRoutesOrStates = false;
       }
    } else if ($injector.has('$state')) {
      var $state = $injector.get('$state');
      if ($state.get().length > 1) noRoutesOrStates = false;
    }
    if (noRoutesOrStates) {
      if ($analytics.settings.pageTracking.autoBasePath) {
        $analytics.settings.pageTracking.basePath = $window.location.pathname;
      }
      $injector.invoke(['$location', function ($location) {
        if ($analytics.settings.pageTracking.trackRelativePath) {
          var url = $analytics.settings.pageTracking.basePath + $location.url();
          pageTrack(url, $location);
        } else {
          pageTrack($location.absUrl(), $location);
        }
      }]);
    }
  }

  if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
    if ($analytics.settings.pageTracking.autoBasePath) {
      /* Add the full route to the base. */
      $analytics.settings.pageTracking.basePath = $window.location.pathname + "#";
    }
    var noRoutesOrStates = true;

    if ($analytics.settings.pageTracking.trackRoutes) {
      if ($injector.has('$route')) {
        var $route = $injector.get('$route');
        if ($route) {
          for (var route in $route.routes) {
            noRoutesOrStates = false;
            break;
          }
        } else if ($route === null){
          noRoutesOrStates = false;
        }
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
          if (current && (current.$$route||current).redirectTo) return;
          $injector.invoke(['$location', function ($location) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          }]);
        });
      }
    }

    if ($analytics.settings.pageTracking.trackStates) {
      if ($injector.has('$state') && !$injector.has('$transitions')) {
        noRoutesOrStates = false;
        $rootScope.$on('$stateChangeSuccess', function (event, current) {
          $injector.invoke(['$location', function ($location) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          }]);
        });
      }
      if ($injector.has('$state') && $injector.has('$transitions')) {
        noRoutesOrStates = false;
        $injector.invoke(['$transitions', function($transitions) {
          $transitions.onSuccess({}, function($transition$) {
            var transitionOptions = $transition$.options();

            // only track for transitions that would have triggered $stateChangeSuccess
            if (transitionOptions.notify) {
              $injector.invoke(['$location', function ($location) {
                var url = $analytics.settings.pageTracking.basePath + $location.url();
                pageTrack(url, $location);
              }]);
            }
          });
        }]);
      }
    }

    if (noRoutesOrStates) {
      $rootScope.$on('$locationChangeSuccess', function (event, current) {
        if (current && (current.$$route || current).redirectTo) return;
        $injector.invoke(['$location', function ($location) {
          if ($analytics.settings.pageTracking.trackRelativePath) {
            var url = $analytics.settings.pageTracking.basePath + $location.url();
            pageTrack(url, $location);
          } else {
            pageTrack($location.absUrl(), $location);
          }
        }]);
      });
    }
  }
  if ($analytics.settings.developerMode) {
    angular.forEach($analytics, function(attr, name) {
      if (typeof attr === 'function') {
        $analytics[name] = function(){};
      }
    });
  }
}

function analyticsOn($analytics) {
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      var eventType = $attrs.analyticsOn || 'click';
      var trackingData = {};

      angular.forEach($attrs.$attr, function(attr, name) {
        if (isProperty(name)) {
          trackingData[propertyName(name)] = $attrs[name];
          $attrs.$observe(name, function(value){
            trackingData[propertyName(name)] = value;
          });
        }
      });

      angular.element($element[0]).on(eventType, function ($event) {
        var eventName = $attrs.analyticsEvent || inferEventName($element[0]);
        trackingData.eventType = $event.type;

        if($attrs.analyticsIf){
          if(! $scope.$eval($attrs.analyticsIf)){
            return; // Cancel this event if we don't pass the analytics-if condition
          }
        }
        // Allow components to pass through an expression that gets merged on to the event properties
        // eg. analytics-properites='myComponentScope.someConfigExpression.$analyticsProperties'
        if($attrs.analyticsProperties){
          angular.extend(trackingData, $scope.$eval($attrs.analyticsProperties));
        }
        $analytics.eventTrack(eventName, trackingData);
      });
    }
  };
}

function exceptionTrack($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function ($delegate, $injector) {
    return function (error, cause) {
      var result = $delegate(error, cause);
      var $analytics = $injector.get('$analytics');
      if ($analytics.settings.trackExceptions) {
        $analytics.exceptionTrack(error, cause);
      }
      return result;
    };
  }]);
}

function isCommand(element) {
  return ['a:','button:','button:button','button:submit','input:button','input:submit'].indexOf(
    element.tagName.toLowerCase()+':'+(element.type||'')) >= 0;
}

function inferEventType(element) {
  if (isCommand(element)) return 'click';
  return 'click';
}

function inferEventName(element) {
  if (isCommand(element)) return element.innerText || element.value;
  return element.id || element.name || element.tagName;
}

function isProperty(name) {
  return name.substr(0, 9) === 'analytics' && ['On', 'Event', 'If', 'Properties', 'EventType'].indexOf(name.substr(9)) === -1;
}

function propertyName(name) {
  var s = name.slice(9); // slice off the 'analytics' prefix
  if (typeof s !== 'undefined' && s!==null && s.length > 0) {
    return s.substring(0, 1).toLowerCase() + s.substring(1);
  }
  else {
    return s;
  }
}
})(angular);

},{}],10:[function(require,module,exports){
require('./angulartics');
module.exports = 'angulartics';

},{"./angulartics":9}],11:[function(require,module,exports){
'use strict';

require('./js/googleAnalytics.module.js');
module.exports = 'googleAnalytics';

},{"./js/googleAnalytics.module.js":12}],12:[function(require,module,exports){
"use strict";

require("angulartics");

require("angulartics-google-tag-manager");

angular.module('googleAnalytics', ["angulartics", "angulartics.google.tagmanager"]).factory('gaInjectionService', ['googleAnalyticsConfig', function (googleAnalyticsConfig) {
  var defaultCode = "window.dataLayer = window.dataLayer || [];\n                        function gtag(){dataLayer.push(arguments);}\n                        gtag('js', new Date());\n                        gtag('config', '" + googleAnalyticsConfig.trackingId + "');";
  var _inlineCode = googleAnalyticsConfig.inlineScript || defaultCode;

  var defaultURL = "https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsConfig.trackingId;
  var _externalSource = void 0;

  if (googleAnalyticsConfig.externalScriptURL === undefined) {
    _externalSource = defaultURL;
  } else {
    _externalSource = googleAnalyticsConfig.externalScriptURL;
  }

  return {
    $getExternalSource: _externalSource,
    $getInlineCode: _inlineCode,
    injectGACode: function injectGACode() {
      if (_externalSource !== null) {
        var externalScriptTag = document.createElement('script');
        externalScriptTag.src = _externalSource;
        document.head.appendChild(externalScriptTag);
      }

      var inlineScriptTag = document.createElement('script');
      inlineScriptTag.type = 'text/javascript';

      // Methods of adding inner text sometimes doesn't work across browsers.
      try {
        inlineScriptTag.appendChild(document.createTextNode(_inlineCode));
      } catch (e) {
        inlineScriptTag.text = _inlineCode;
      }

      document.head.appendChild(inlineScriptTag);
    }
  };
}]);

},{"angulartics":10,"angulartics-google-tag-manager":8}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2dvb2dsZUFuYWx5dGljc0NvbmZpZy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUF2YWlsYWJpbGl0aWVzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUl0ZW1zLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvbWFpbi5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvc2Z4SG9sZGluZ3MubW9kdWxlLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9qcy92aWV3TmFtZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzLWdvb2dsZS10YWctbWFuYWdlci9saWIvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyL2xpYi9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzL3NyYy9hbmd1bGFydGljcy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzL3NyYy9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL3ByaW1vLWV4cGxvcmUtZ29vZ2xlLWFuYWx5dGljcy9zcmMvaW5kZXguanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL25vZGVfbW9kdWxlcy9wcmltby1leHBsb3JlLWdvb2dsZS1hbmFseXRpY3Mvc3JjL2pzL2dvb2dsZUFuYWx5dGljcy5tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FPLElBQU0sd0RBQXdCLE9BQU8sTUFBUCxDQUFjO0FBQ2pELFFBQU0sdUJBRDJDO0FBRWpELFVBQVE7QUFDTixnQkFBWSxjQUROO0FBRU4sdUJBQW1CO0FBRmI7QUFGeUMsQ0FBZCxDQUE5Qjs7Ozs7QUNBUCxRQUFRLE1BQVIsQ0FBZSxvQkFBZixFQUFxQyxFQUFyQyxFQUF5QyxTQUF6QyxDQUFtRCxxQkFBbkQsRUFBMEU7QUFDeEUsWUFBVSxFQUFFLFlBQVksR0FBZCxFQUQ4RDtBQUV4RSxjQUFZLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixLQUE1QixFQUFtQyxRQUFuQyxFQUE2QyxnQkFBN0MsRUFBK0Q7QUFDekUsU0FBSyxPQUFMLEdBQWUsWUFBWTtBQUN6QixhQUFPLFdBQVAsR0FBcUIsS0FBckIsQ0FEeUIsQ0FDRztBQUM1QixVQUFJLE1BQU0sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixJQUF4QixDQUE2QixHQUE3QixDQUFpQyxPQUEzQztBQUNBLFVBQUksSUFBSSxjQUFKLENBQW1CLGdCQUFuQixLQUF3QyxJQUFJLGNBQUosQ0FBbUIsVUFBbkIsQ0FBNUMsRUFBNEU7QUFDMUUsWUFBSSxLQUFLLElBQUksY0FBSixDQUFtQixDQUFuQixDQUFUO0FBQ0EsWUFBSSxTQUFTLElBQUksUUFBSixDQUFhLENBQWIsQ0FBYjtBQUNBLFlBQUksV0FBVyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWY7QUFDQSxZQUFJLE9BQU8sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixJQUF4QixDQUE2QixHQUE3QixDQUFpQyxPQUFqQyxDQUF5QyxJQUF6QyxDQUE4QyxDQUE5QyxDQUFYO0FBQ1I7Ozs7QUFJUSxZQUFJLE1BQU0sVUFBVSxhQUFoQixJQUFpQyxRQUFRLFNBQTdDLEVBQXdEO0FBQ3RELGNBQUksTUFBTSxtRkFBbUYs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xmQTtBQUNBO0FBQ0E7Ozs7QUNGQSxRQUFRLGdDQUFSO0FBQ0EsT0FBTyxPQUFQLEdBQWlCLGlCQUFqQjs7Ozs7QUNEQTs7QUFDQTs7QUFFQSxRQUFRLE1BQVIsQ0FBZSxpQkFBZixFQUFrQyxDQUFDLGFBQUQsRUFBZ0IsK0JBQWhCLENBQWxDLEVBQ0csT0FESCxDQUNXLG9CQURYLEVBQ2lDLENBQUMsdUJBQUQsRUFBMEIsVUFBUyxxQkFBVCxFQUFnQztBQUN2RixNQUFNLDZOQUdnQyxzQkFBc0IsVUFIdEQsUUFBTjtBQUlBLE1BQU0sY0FBYyxzQkFBc0IsWUFBdEIsSUFBc0MsV0FBMUQ7O0FBRUEsTUFBTSw4REFBNEQsc0JBQXNCLFVBQXhGO0FBQ0EsTUFBSSx3QkFBSjs7QUFFQSxNQUFJLHNCQUFzQixpQkFBdEIsS0FBNEMsU0FBaEQsRUFBMkQ7QUFDekQsc0JBQWtCLFVBQWxCO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsc0JBQWtCLHNCQUFzQixpQkFBeEM7QUFDRDs7QUFFRCxTQUFPO0FBQ0wsd0JBQW9CLGVBRGY7QUFFTCxvQkFBZ0IsV0FGWDtBQUdMLGdCQUhLLDBCQUdVO0FBQ2IsVUFBSSxvQkFBb0IsSUFBeEIsRUFBOEI7QUFDNUIsWUFBTSxvQkFBb0IsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQTFCO0FBQ0EsMEJBQWtCLEdBQWxCLEdBQXdCLGVBQXhCO0FBQ0EsaUJBQVMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsaUJBQTFCO0FBQ0Q7O0FBRUQsVUFBTSxrQkFBa0IsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQXhCO0FBQ0Esc0JBQWdCLElBQWhCLEdBQXVCLGlCQUF2Qjs7QUFFQTtBQUNBLFVBQUk7QUFDRix3QkFBZ0IsV0FBaEIsQ0FBNEIsU0FBUyxjQUFULENBQXdCLFdBQXhCLENBQTVCO0FBQ0QsT0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVO0FBQ1Ysd0JBQWdCLElBQWhCLEdBQXVCLFdBQXZCO0FBQ0Q7O0FBRUQsZUFBUyxJQUFULENBQWMsV0FBZCxDQUEwQixlQUExQjtBQUNEO0FBckJJLEdBQVA7QUF1QkQsQ0F2QzhCLENBRGpDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGNvbnN0IGdvb2dsZUFuYWx5dGljc0NvbmZpZyA9IE9iamVjdC5mcmVlemUoe1xuICBuYW1lOiAnZ29vZ2xlQW5hbHl0aWNzQ29uZmlnJyxcbiAgY29uZmlnOiB7XG4gICAgdHJhY2tpbmdJZDogXCJVQS00Nzg5NDE5LTdcIixcbiAgICBleHRlcm5hbFNjcmlwdFVSTDogXCJodHRwczovL3d3dy5nb29nbGV0YWdtYW5hZ2VyLmNvbS9ndGFnL2pzP2lkPVVBLTQ3ODk0MTktN1wiXG4gIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdrb2hhQXZhaWxhYmlsaXRpZXMnLCBbXSkuY29tcG9uZW50KCdwcm1CcmllZlJlc3VsdEFmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwga29oYWF2YWlsU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlOyAvKiBkZWZhdWx0IGhpZGVzIHRlbXBsYXRlICovXG4gICAgICB2YXIgb2JqID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbDtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIHZhciByZWNvcmRpZCA9IG9iai5yZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHR5cGUgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5kaXNwbGF5LnR5cGVbMF07XG4vKlxuICAgICAgICBjb25zb2xlLmxvZyhcInNvdXJjZTpcIiArIGJuKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJiaWJsaW9udW1iZXI6XCIgKyBibik7XG4qL1xuICAgICAgICBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlICE9IFwiam91cm5hbFwiKSB7XG4gICAgICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldEl0ZW1zLnBocD9iaWJsaW9udW1iZXI9XCIgKyBibjtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBrb2hhYXZhaWxTZXJ2aWNlLmdldEtvaGFEYXRhKHVybCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0ICAgICAgICAgaWYocmVzcG9uc2Upe1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtlZFwiKTtcblx0Ly8gICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHQgICAgICAgICAgICB2YXIgaXRlbXMgPSByZXNwb25zZS5kYXRhO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtcyk7XG5cdCAgICAgICAgICAgIHZhciBhdmFpbGFiaWxpdHkgPSBpdGVtcy5hdmFpbGFibGU7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKGF2YWlsYWJpbGl0eSk7XG5cdCAgICAgICAgICAgIGlmIChhdmFpbGFiaWxpdHkgPT09IG51bGwpIHtcblx0ICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0J3MgZmFsc2VcIik7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gdHJ1ZTtcblx0ICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKFwibmctaGlkZVwiKTsgLyogaW5pdGlhbGx5IHNldCBieSAkc2NvcGUua29oYURpc3BsYXk9ZmFsc2UgKi9cblx0ICAgICAgICAgICAgICAkc2NvcGUuc3RhdHVzID0gaXRlbXMuc3RhdHVzO1xuXHQgICAgICAgICAgICAgICRzY29wZS5yZWNvcmRpZCA9IHJlY29yZGlkO1xuXHQgICAgICAgICAgICAgICRzY29wZS5icmFuY2ggPSBpdGVtcy5ob21lYnJhbmNoO1xuXHQgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbiA9IGl0ZW1zLmxvY2F0aW9uO1xuXHQgICAgICAgICAgICAgICRzY29wZS5jbGFzcyA9IGl0ZW1zLmNsYXNzO1xuXHQgICAgICAgICAgICAgICRzY29wZS5jYWxsbnVtYmVyID0gaXRlbXMuaXRlbWNhbGxudW1iZXI7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLm90aGVyTG9jYXRpb25zID0gKGl0ZW1zLnRvdGFsIC0gMSk7XG5cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgICB9IFxuICAgIH07XG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1CcmllZlJlc3VsdEFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdrb2hhYXZhaWxTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIGdldEtvaGFEYXRhOiBmdW5jdGlvbiBnZXRLb2hhRGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgna29oYUl0ZW1zJywgW10pLmNvbXBvbmVudCgncHJtT3BhY0FmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwga29oYWl0ZW1zU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlOyAvKiBkZWZhdWx0IGhpZGVzIHRlbXBsYXRlICovXG4gICAgICB2YXIgb2JqID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbDtcbiAgICAgIHZhciBvcGVudXJsO1xuICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZXJlY29yZGlkXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZWlkXCIpKSB7XG4gICAgICAgIHZhciBibiA9IG9iai5zb3VyY2VyZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IG9iai5zb3VyY2VpZFswXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzb3VyY2UgOlwiK3NvdXJjZSk7XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguZGlzcGxheS50eXBlWzBdO1xuICAgICAgICBpZiAoYm4gJiYgKHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgfHwgIWJuLnN0YXJ0c1dpdGgoXCJkZWR1cG1yZ1wiKSkgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PXJlYy5pZCZxPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWl0ZW1zU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5pdGVtO1xuICAgICAgICAgICAgdmFyIGtvaGFpZCA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmJpYmxpb251bWJlcjtcbiAgICAgICAgICAgIHZhciBpbWFnZVBhdGggPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5jb3ZlcjtcbiAgICAgICAgICAgIGlmIChrb2hhaWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHQgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS1vcGFjID4gbWQtdGFicycpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7IFxuICAgICAgICAgICAgICAkc2NvcGUua29oYWlkID0ga29oYWlkO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChibiAmJiBzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiICYmIHR5cGUgPT0gXCJqb3VybmFsXCIpIHtcblx0ICAgICAgXHR2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0U3J1LnBocD9pbmRleD1qb3VybmFscyZxPVwiKyBibjtcblx0XHQgIFx0dmFyIHJlc3BvbnNlID0ga29oYWl0ZW1zU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLnJlY29yZCAhPSB1bmRlZmluZWQgJiYgcmVzcG9uc2UuZGF0YS5yZWNvcmQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEucmVjb3JkKTtcblx0XHRcdFx0XHQkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGlmKGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0YW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS1vcGFjID4gbWQtdGFicycpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3MgPSBbXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5ncy5sZW5ndGggOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBob2xkaW5nID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaG9sZGluZ3NbaV1cblx0XHRcdFx0XHRcdCRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzW2ldID0ge1xuXHRcdFx0XHRcdFx0XHRcImxpYnJhcnlcIiA6IGhvbGRpbmdbXCJyY3JcIl0sXG5cdFx0XHRcdFx0XHRcdFwiaG9sZGluZ3NcIiA6IGhvbGRpbmdbXCJob2xkaW5nc1wiXVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmIChob2xkaW5nW1wiaG9sZGluZ3NcIl0ubGVuZ3RoID4gODApIHtcblx0XHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXVtcImhvbGRpbmdzU3VtbWFyeVwiXSA9IGhvbGRpbmdbXCJob2xkaW5nc1wiXS5zdWJzdHJpbmcoMCw3NykrXCIuLi5cIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJyY3JcIl0gPT0gIGhvbGRpbmdbXCJyY3JcIl0pIHtcblx0XHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXVtcImNhbGxudW1iZXJcIl0gPSAgcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wiY2FsbG51bWJlclwiXTtcblx0XHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXVtcImxvY2F0aW9uXCJdID1cdHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImxvY2F0aW9uXCJdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHsgIFxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJqb3VybmFsIDogbm8gcHJpbnQgaG9sZGluZ1wiKTtcblx0XHRcdFx0XHRcdCRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fSk7XG4vKlxuXHRcdFx0dGhpcy5vbkNsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCAkd2luZG93Lm9wZW4oJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9iaWIvJysgYm4sICdfYmxhbmsnKTtcblx0XHRcdH07XG4qL1xuXHRcdH0gXG5cdFx0XG5cdFx0dmFyIGRlbGl2ZXJ5ID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5kZWxpdmVyeTtcblx0XHRpZiAoZGVsaXZlcnkgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBkZWxpdmVyeS5saW5rLmxlbmd0aCA7IGkrKyl7XG5cdFx0XHRcdGlmIChkZWxpdmVyeS5saW5rW2ldLmRpc3BsYXlMYWJlbCA9PSBcIm9wZW51cmxcIikge1xuXHRcdFx0XHRcdG9wZW51cmwgPSBkZWxpdmVyeS5saW5rW2ldLmxpbmtVUkw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9wZW51cmwgIT0gdW5kZWZpbmVkKXtcblx0XHRcdG9wZW51cmwgPSBvcGVudXJsLnJlcGxhY2UoLy4rXFw/LywgXCJcIik7XG5cdFx0XHQkc2NvcGUucHJveGlmaWVkdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZXByZXByb2QuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9nZXRTZngucGhwP1wiK29wZW51cmw7XG5cdFx0XHQkaHR0cC5qc29ucCgkc2NvcGUucHJveGlmaWVkdXJsKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLmVycm9yID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdCB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdCB2YXIgbGVuID0ga2V5cy5sZW5ndGg7XG5cdFx0XHRcdFx0IGNvbnNvbGUubG9nKFwiU0ZYIHJlc3VsdHM6IFwiK2xlbik7XG5cdFx0XHRcdFx0IGlmKGxlbiA+IDApIHtcblx0XHRcdFx0XHRcdCAgJHNjb3BlLnNmeGhvbGRpbmdzID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHQgfVxuXHRcdFx0XHR9XG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtT3BhY0FmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdrb2hhaXRlbXNTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIGdldEtvaGFEYXRhOiBmdW5jdGlvbiBnZXRLb2hhRGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuXG4iLCJpbXBvcnQgJ3ByaW1vLWV4cGxvcmUtZ29vZ2xlLWFuYWx5dGljcyc7XG4vLyBpbXBvcnQgJ3ByaW1vLWV4cGxvcmUtb2Fkb2ktbGluayc7XG5pbXBvcnQgeyB2aWV3TmFtZSB9IGZyb20gJy4vdmlld05hbWUnO1xuaW1wb3J0IHsga29oYUl0ZW1zIH0gZnJvbSAnLi9rb2hhSXRlbXMubW9kdWxlJztcbmltcG9ydCB7IGtvaGFBdmFpbGFiaWxpdGllcyB9IGZyb20gJy4va29oYUF2YWlsYWJpbGl0aWVzLm1vZHVsZSc7XG5pbXBvcnQgeyBzZnhIb2xkaW5ncyB9IGZyb20gJy4vc2Z4SG9sZGluZ3MubW9kdWxlJztcbmltcG9ydCB7IGdvb2dsZUFuYWx5dGljc0NvbmZpZyB9IGZyb20gJy4vZ29vZ2xlQW5hbHl0aWNzQ29uZmlnJztcbmxldCBhcHAgPSBhbmd1bGFyLm1vZHVsZSgndmlld0N1c3RvbScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYW5ndWxhckxvYWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdrb2hhSXRlbXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdrb2hhQXZhaWxhYmlsaXRpZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZnhIb2xkaW5ncycsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCdnb29nbGVBbmFseXRpY3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuXG5cbmFwcFxuICAuY29uc3RhbnQoZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLm5hbWUsIGdvb2dsZUFuYWx5dGljc0NvbmZpZy5jb25maWcpO1xuLypcbiAgLmNvbnN0YW50KCdvYWRvaU9wdGlvbnMnLCB7XG5cdCAgXHRcImltYWdlUGF0aFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBSUFBQUFDQUNBTUFBQUQwNEpINUFBQUFrMUJNVkVYLy8vODF2ZllxdWZXeTdlTlV3dXMzdnZaOTJ1V3A2K0l1dlBjb3VmWXh2ZmpaOFBsVXgvWFE5dXJWN3ZuNi8vM0k2ZlZneGVOR3d2WXh0dTFZdjkyRTNlVmF5L0hxKy9TSTMrTnp5K0NoNk9KMDF1aXc0TzFNeGZqeS9makU4K2U5NWZHVDFlUm54dUNrM09sanorMUZ1K3g3eXRwU3U5K0owT0JMdWVkWXZ0K3M0T3VTMmVhVTQrTForTzNKOU9odDFPdGx5UElEQUFBRGVrbEVRVlI0bk8yYWEzZmlJQkNHQlkwT1dWM1hFT3R0VGROMlkyL1c5di8vdW8wYjA0dUd6RURnY0U2WDkyUENNRTlnWUlEUTZ3VUZCUVVGQlgwU2V4Y01DSnJOVnZ1Ny9KY1RBQVpFc2FoWTdaOXRRVEJUQWVmSmJPOFJvR0s0ZmY3aEVhQVU1OFdEVjRCak02dzZoVU5uZ0NPRGlINTZCU2dSaWp1L0FHVkgzQnAyaENXQU1oeUxHNzhBWlNNWUJZSTlnQktCR1RTQ1RZQ3lFWForQWNwSTBPNEd5d0JzcGt0Z0c0Q0pKejBFNndCTXpEd0RNS0dWSUIwQU1LMmg0QUlBNUcrL0FHVnVvaWNHY3AyOEVwQks4eGs1RHFqZWsvbTZmejE2Mld3WkNZR1QxMGtrZ0dqVFg1ektUeWRqemduSTBoNEF2NXFjMldRdkJBUnFYa0kvaGMrbmwxWUpUa0NOUS9UNzEwMVdpekZLSUZaMkFCcjlrd2hZYmdHQXYzMlV6QTZUeGFmZWVFVkhBeWROUjYxVlFGSUhmeTk3U3lJV2plY2ZBWWsyQVNkbHBmWXFSbld4L3ZZNEJRRndHTmFQOEU3Z1hRRmdYRGY1OG1Qc2k3b04rdTRCM2p0QWZLbDJlM3FNendhVTZiRE5mbk1xYy9nYWIrTFVDeE0wREF0Q1JtaXpyNGZnOFB6RjRkL2piSXNSVU1aQm0vMXJWV1FSbmRlN3JGNjhZWDFBbVl4YXpLSDYwTXRvZzNIMVlva0J4QVcrUUcwRE9JMkIrYVdmNnNVYUh3ZjQ2b3dBc0ZFQmpGQUFHS0JoMkdaZXhjQWl1WXcxS2dDVGFFNXNzOTVlWjFsMitOUGdoZ3pBMFlPTGR2dmpxV0NUeUFEdzFBMUFKVEpBWEhnR3FJdjZBMEFUMHJjSGdBQ0FUWVZxUzY2VU9IWHNXaEFtQWl3ZHFRdzNDOFN3VWo5QzFnU21BTHhoTzlSTWdEUUNZTWxBQlVEMDM1dU8yNXZBRkFDZHdON1ZrS3h0QUVSa2dDRUNZQmdEOWdBTWgrSDNBVEROQlFIZzJ3QUFXcEZyZ0lGbkFJNmUxamtHd0krdDNRSVFkcWR1QWVBV3RYY0tFT05iUTdjQVFEaTFkd3FBandISEFJUWVjQXRBT2F0MUNZQ3VCVndEZERvcHRRQ0FudzIwQUpDWDViMHJKWUFnL2JoU1dTOXBPNU5Kd3dsVy9RMjBIMmRLODZ1WFBxNlJlbWNHajdTLzZDcDdwdDZiZnBaNlc0U2ZqeUVBWFpVUy81MjY4aytPWWtmKzhmTkJ0d0N4elAwQ1VOS2dRd0JJTmU2eHVBQjQxTG5YNXNBLzVCcitIUURFNUtzRGJnQmlxWGUzMGJaL1RmZldBVUQ3YXFkbC82UTFpRHNBY1ovN0JBQ2pTNlhXM01maTNzUy9OUUNRTzdQTHpaYjg4MVRqL3BwMUFDSDE3N0phQklqbHJzdnQ5cTdlZ1d2bFB0c0FJTk1iODR2MUhRRUF1RFNZZUxvRGxJNjVMTkpPSFc4T0VFazVTRmNQZWNkMkR3b0tDZ3I2My9VWG54WThXbDFBNDVBQUFBQUFTVVZPUks1Q1lJST1cIixcblx0ICBcdFwiZW1haWxcIjogXCJiaWJsaW90aGVxdWVzQHVuaXYtcmVubmVzMi5mclwiXG4gIH0pO1xuKi9cblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuYXBwLmNvbmZpZyhbJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSB7XG4gIHZhciB1cmxXaGl0ZWxpc3QgPSAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCgpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vKiouYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cDovL3NmeC11bml2LXJlbm5lczIuaG9zdGVkLmV4bGlicmlzZ3JvdXAqKicpO1xuICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCh1cmxXaGl0ZWxpc3QpO1xufV0pO1xuXG5cbi8vIGNoYW5nZSBhZHZhbmNlZCBzZWFyY2ggdG8ganVtcCB0byByZXN1bHRzXG5hcHAuY29udHJvbGxlcigncHJtQWR2YW5jZWRTZWFyY2hBZnRlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHtcbi8vIHdhdGNoIHRvIHNlZSBpZiBhZHZhbmNlZCBzZWFyY2ggaXMgdGhlcmVcbiAgICAgICB2YXIgYWR2YW5jZWRTZWFyY2hPYnMgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgIGlmICghbXV0YXRpb24uYWRkZWROb2RlcykgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uLmFkZGVkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gbXV0YXRpb24uYWRkZWROb2Rlc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT0gXCJCVVRUT05cIiAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwicHJtLWFkdmFuY2VkLXNlYXJjaCAuYnV0dG9uLWNvbmZpcm0uYnV0dG9uLWxhcmdlLmJ1dHRvbi13aXRoLWljb24ubWQtYnV0dG9uLm1kLXByaW1vRXhwbG9yZS10aGVtZS5tZC1pbmstcmlwcGxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9uZWVkIGFuIGlkIHRvIGp1bXAgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3VibWl0QXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWR2YW5jZWQtc2VhcmNoLW91dHB1dC5sYXlvdXQtcm93LmZsZXhcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QXJlYS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImFkdmFuY2VkU2VhcmNoU3VibWl0QXJlYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwicHJtLWFkdmFuY2VkLXNlYXJjaCAuYnV0dG9uLWNvbmZpcm0uYnV0dG9uLWxhcmdlLmJ1dHRvbi13aXRoLWljb24ubWQtYnV0dG9uLm1kLXByaW1vRXhwbG9yZS10aGVtZS5tZC1pbmstcmlwcGxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2FpdCBmb3Igc29tZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZHZhbmNlZFNlYXJjaE9iczIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdXRhdGlvbnMyLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtdXRhdGlvbjIuYWRkZWROb2RlcykgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtdXRhdGlvbjIuYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG11dGF0aW9uMi5hZGRlZE5vZGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PSBcIlBSTS1TRUFSQ0gtUkVTVUxULVNPUlQtQllcIiAmJiB3aW5kb3cuaW5uZXJIZWlnaHQgPCA3NzUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoPSdhZHZhbmNlZFNlYXJjaFN1Ym1pdEFyZWEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWRTZWFyY2hPYnMyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2VkU2VhcmNoT2JzMi5vYnNlcnZlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwcm0tZXhwbG9yZS1tYWluJylbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBzdWJ0cmVlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGF0dHJpYnV0ZXM6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGNoYXJhY3RlckRhdGE6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZW5kIHdhaXQgZm9yIHNvbWUgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgIH0pXG4gICAgICBcbiAgICAgICBhZHZhbmNlZFNlYXJjaE9icy5vYnNlcnZlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwcm0tYWR2YW5jZWQtc2VhcmNoJylbMF0sIHtcbiAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICAgICAgICAgICwgc3VidHJlZTogdHJ1ZVxuICAgICAgICAgICAgICAsIGF0dHJpYnV0ZXM6IGZhbHNlXG4gICAgICAgICAgICAgICwgY2hhcmFjdGVyRGF0YTogZmFsc2VcbiAgICAgICB9KVxufSk7XG5cbi8vQW5ndWxhckpTJyBvcmRlckJ5IGZpbHRlciBkb2VzIGp1c3Qgc3VwcG9ydCBhcnJheXMgLSBubyBvYmplY3RzLiBTbyB5b3UgaGF2ZSB0byB3cml0ZSBhbiBvd24gc21hbGwgZmlsdGVyLCB3aGljaCBkb2VzIHRoZSBzb3J0aW5nIGZvciB5b3UuXG5hcHAuZmlsdGVyKCdvcmRlck9iamVjdEJ5JywgZnVuY3Rpb24oKXtcbiByZXR1cm4gZnVuY3Rpb24oaW5wdXQsIGF0dHJpYnV0ZSkge1xuICAgIGlmICghYW5ndWxhci5pc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcblxuICAgIHZhciBhcnJheSA9IFtdO1xuICAgIGZvcih2YXIgb2JqZWN0S2V5IGluIGlucHV0KSB7XG4gICAgICAgIGFycmF5LnB1c2goaW5wdXRbb2JqZWN0S2V5XSk7XG4gICAgfVxuXG4gICAgYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgYSA9IHBhcnNlSW50KGFbYXR0cmlidXRlXSk7XG4gICAgICAgIGIgPSBwYXJzZUludChiW2F0dHJpYnV0ZV0pO1xuICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFycmF5O1xuIH1cbn0pO1xuXG5cbmFwcC5ydW4ocnVuQmxvY2spO1xuXG5ydW5CbG9jay4kaW5qZWN0ID0gWydnYUluamVjdGlvblNlcnZpY2UnXTtcblxuZnVuY3Rpb24gcnVuQmxvY2soZ2FJbmplY3Rpb25TZXJ2aWNlKSB7XG4gIGdhSW5qZWN0aW9uU2VydmljZS5pbmplY3RHQUNvZGUoKTtcbn0iLCJhbmd1bGFyLm1vZHVsZSgnc2Z4SG9sZGluZ3MnLCBbXSkuY29tcG9uZW50KCdwcm1WaWV3T25saW5lQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBzZnhob2xkaW5nc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFxuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ubGlua0VsZW1lbnQubGlua3NbMF07XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwiZ2V0SXRUYWJUZXh0XCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlUZXh0XCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImlzTGlua3RvT25saW5lXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImxpbmtcIikpIHtcbiAgICAgICAgaWYgKG9ialsnZGlzcGxheVRleHQnXSA9PSBcIm9wZW51cmxmdWxsdGV4dFwiKSB7XG5cdCAgICAgICRzY29wZS5zZnhsb2FkaW5nID0gdHJ1ZTtcblx0ICAgICAgY29uc29sZS5sb2cob2JqKTtcblx0ICAgICAgY29uc29sZS5sb2cob2JqWydsaW5rJ10pO1xuICAgICAgICAgIHZhciBvcGVudXJsID0gb2JqWydsaW5rJ107XG4gICAgICAgICAgdmFyIG9wZW51cmxTdmMgPSBvcGVudXJsLnJlcGxhY2UoXCJodHRwOi8vYWNjZWRlci5idS51bml2LXJlbm5lczIuZnIvc2Z4XzMzcHVlZGJcIixcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvZ2V0U2Z4LnBocFwiKTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBzZnhob2xkaW5nc1NlcnZpY2UuZ2V0U2Z4RGF0YShvcGVudXJsU3ZjKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGhvbGRpbmdzID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIGlmIChob2xkaW5ncyA9PT0gbnVsbCkge1xuXHQgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gXHQgICAgICAgICAgXG4gXHQgICAgICAgICBpZihhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJtLXZpZXctb25saW5lIGRpdiBhLmFycm93LWxpbmsubWQtcHJpbW9FeHBsb3JlLXRoZW1lJykpLmxlbmd0aCA+IDApIHtcblx0IFx0ICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS12aWV3LW9ubGluZSBkaXYgYS5hcnJvdy1saW5rLm1kLXByaW1vRXhwbG9yZS10aGVtZScpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7IFxuIFx0ICAgICAgICAgfVxuXHQgICAgICAgICAgJHNjb3BlLnNmeGxvYWRpbmcgPSBmYWxzZTtcbiBcdCAgICAgICAgICBjb25zb2xlLmxvZyhob2xkaW5ncyk7XG4gICAgICAgICAgICAgICRzY29wZS5zZnhob2xkaW5ncyA9IGhvbGRpbmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtVmlld09ubGluZUFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdzZnhob2xkaW5nc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2Z4RGF0YTogZnVuY3Rpb24gZ2V0U2Z4RGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuIiwiLy8gRGVmaW5lIHRoZSB2aWV3IG5hbWUgaGVyZS5cbmV4cG9ydCBsZXQgdmlld05hbWUgPSBcIjMzVURSMl9WVTFcIjsiLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJ0aWNzIHYwLjE5LjJcbiAqIChjKSAyMDEzIEx1aXMgRmFyemF0aSBodHRwOi8vbHVpc2ZhcnphdGkuZ2l0aHViLmlvL2FuZ3VsYXJ0aWNzXG4gKiBHb29nbGUgVGFnIE1hbmFnZXIgUGx1Z2luIENvbnRyaWJ1dGVkIGJ5IGh0dHA6Ly9naXRodWIuY29tL2RhbnJvd2U0OVxuICogTGljZW5zZTogTUlUXG4gKi9cblxuKGZ1bmN0aW9uIChhbmd1bGFyKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuXG4gIC8qKlxuICAgKiBAbmdkb2Mgb3ZlcnZpZXdcbiAgICogQG5hbWUgYW5ndWxhcnRpY3MuZ29vZ2xlLmFuYWx5dGljc1xuICAgKiBFbmFibGVzIGFuYWx5dGljcyBzdXBwb3J0IGZvciBHb29nbGUgVGFnIE1hbmFnZXIgKGh0dHA6Ly9nb29nbGUuY29tL3RhZ21hbmFnZXIpXG4gICAqL1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFydGljcy5nb29nbGUudGFnbWFuYWdlcicsIFsnYW5ndWxhcnRpY3MnXSlcbiAgICAuY29uZmlnKFsnJGFuYWx5dGljc1Byb3ZpZGVyJywgZnVuY3Rpb24gKCRhbmFseXRpY3NQcm92aWRlcikge1xuXG4gICAgICAkYW5hbHl0aWNzUHJvdmlkZXIuc2V0dGluZ3MuZ2EgPSB7XG4gICAgICAgIHVzZXJJZDogbnVsbFxuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBTZW5kIGNvbnRlbnQgdmlld3MgdG8gdGhlIGRhdGFMYXllclxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFJlcXVpcmVkICdjb250ZW50IG5hbWUnIChzdHJpbmcpIGRlc2NyaWJlcyB0aGUgY29udGVudCBsb2FkZWRcbiAgICAgICAqL1xuXG4gICAgICAkYW5hbHl0aWNzUHJvdmlkZXIucmVnaXN0ZXJQYWdlVHJhY2soZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIGRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyIHx8IFtdO1xuICAgICAgICBkYXRhTGF5ZXIucHVzaCh7XG4gICAgICAgICAgJ2V2ZW50JzogJ2NvbnRlbnQtdmlldycsXG4gICAgICAgICAgJ2NvbnRlbnQtbmFtZSc6IHBhdGgsXG4gICAgICAgICAgJ3VzZXJJZCc6ICRhbmFseXRpY3NQcm92aWRlci5zZXR0aW5ncy5nYS51c2VySWRcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgLyoqXG4gICAgICAgKiBTZW5kIGludGVyYWN0aW9ucyB0byB0aGUgZGF0YUxheWVyLCBpLmUuIGZvciBldmVudCB0cmFja2luZyBpbiBHb29nbGUgQW5hbHl0aWNzXG4gICAgICAgKiBAbmFtZSBldmVudFRyYWNrXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiBSZXF1aXJlZCAnYWN0aW9uJyAoc3RyaW5nKSBhc3NvY2lhdGVkIHdpdGggdGhlIGV2ZW50XG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvcGVydGllcyBDb21wcmlzZWQgb2YgdGhlIG1hbmRhdG9yeSBmaWVsZCAnY2F0ZWdvcnknIChzdHJpbmcpIGFuZCBvcHRpb25hbCAgZmllbGRzICdsYWJlbCcgKHN0cmluZyksICd2YWx1ZScgKGludGVnZXIpIGFuZCAnbm9uaW50ZXJhY3Rpb24nIChib29sZWFuKVxuICAgICAgICovXG5cbiAgICAgICRhbmFseXRpY3NQcm92aWRlci5yZWdpc3RlckV2ZW50VHJhY2soZnVuY3Rpb24gKGFjdGlvbiwgcHJvcGVydGllcykge1xuICAgICAgICB2YXIgZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG4gICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgICAgICBkYXRhTGF5ZXIucHVzaCh7XG4gICAgICAgICAgJ2V2ZW50JzogcHJvcGVydGllcy5ldmVudCB8fCAnaW50ZXJhY3Rpb24nLFxuICAgICAgICAgICd0YXJnZXQnOiBwcm9wZXJ0aWVzLmNhdGVnb3J5LFxuICAgICAgICAgICdhY3Rpb24nOiBhY3Rpb24sXG4gICAgICAgICAgJ3RhcmdldC1wcm9wZXJ0aWVzJzogcHJvcGVydGllcy5sYWJlbCxcbiAgICAgICAgICAndmFsdWUnOiBwcm9wZXJ0aWVzLnZhbHVlLFxuICAgICAgICAgICdpbnRlcmFjdGlvbi10eXBlJzogcHJvcGVydGllcy5ub25pbnRlcmFjdGlvbixcbiAgICAgICAgICAndXNlcklkJzogJGFuYWx5dGljc1Byb3ZpZGVyLnNldHRpbmdzLmdhLnVzZXJJZFxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IHVzZXJJZCBmb3IgdXNlIHdpdGggVW5pdmVyc2FsIEFuYWx5dGljcyBVc2VyIElEIGZlYXR1cmVcbiAgICAgICAqIEBuYW1lIHNldFVzZXJuYW1lXG4gICAgICAgKiBcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VySWQgUmVxdWlyZWQgJ3VzZXJJZCcgdmFsdWUgKHN0cmluZykgdXNlZCB0byBpZGVudGlmeSB1c2VyIGNyb3NzLWRldmljZSBpbiBHb29nbGUgQW5hbHl0aWNzXG4gICAgICAgKi9cblxuICAgICAgJGFuYWx5dGljc1Byb3ZpZGVyLnJlZ2lzdGVyU2V0VXNlcm5hbWUoZnVuY3Rpb24gKHVzZXJJZCkge1xuICAgICAgICAkYW5hbHl0aWNzUHJvdmlkZXIuc2V0dGluZ3MuZ2EudXNlcklkID0gdXNlcklkO1xuICAgICAgfSk7XG5cbiAgICB9XSk7XG5cbn0pKGFuZ3VsYXIpO1xuIiwicmVxdWlyZSgnLi9hbmd1bGFydGljcy1nb29nbGUtdGFnLW1hbmFnZXInKTtcbm1vZHVsZS5leHBvcnRzID0gJ2FuZ3VsYXJ0aWNzLmdvb2dsZS50YWdtYW5hZ2VyJztcbiIsIi8qKlxuICogQGxpY2Vuc2UgQW5ndWxhcnRpY3NcbiAqIChjKSAyMDEzIEx1aXMgRmFyemF0aSBodHRwOi8vYW5ndWxhcnRpY3MuZ2l0aHViLmlvL1xuICogTGljZW5zZTogTUlUXG4gKi9cbihmdW5jdGlvbihhbmd1bGFyLCBhbmFseXRpY3MpIHtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFuZ3VsYXJ0aWNzID0gd2luZG93LmFuZ3VsYXJ0aWNzIHx8ICh3aW5kb3cuYW5ndWxhcnRpY3MgPSB7fSk7XG5hbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQ291bnQgPSAwO1xuYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckFwaSA9IGZ1bmN0aW9uIChvYmplY3ROYW1lLCBkZWxheSwgY29udGFpbnNGaWVsZCwgcmVnaXN0ZXJGbiwgb25UaW1lb3V0KSB7XG4gIGlmICghb25UaW1lb3V0KSB7IGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JDb3VudCsrOyB9XG4gIGlmICghcmVnaXN0ZXJGbikgeyByZWdpc3RlckZuID0gY29udGFpbnNGaWVsZDsgY29udGFpbnNGaWVsZCA9IHVuZGVmaW5lZDsgfVxuICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh3aW5kb3csIG9iamVjdE5hbWUpIHx8IChjb250YWluc0ZpZWxkICE9PSB1bmRlZmluZWQgJiYgd2luZG93W29iamVjdE5hbWVdW2NvbnRhaW5zRmllbGRdID09PSB1bmRlZmluZWQpKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JBcGkob2JqZWN0TmFtZSwgZGVsYXksIGNvbnRhaW5zRmllbGQsIHJlZ2lzdGVyRm4sIHRydWUpOyB9LCBkZWxheSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckNvdW50LS07XG4gICAgcmVnaXN0ZXJGbih3aW5kb3dbb2JqZWN0TmFtZV0pO1xuICB9XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgYW5ndWxhcnRpY3NcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJ0aWNzJywgW10pXG4ucHJvdmlkZXIoJyRhbmFseXRpY3MnLCAkYW5hbHl0aWNzKVxuLnJ1bihbJyRyb290U2NvcGUnLCAnJHdpbmRvdycsICckYW5hbHl0aWNzJywgJyRpbmplY3RvcicsICRhbmFseXRpY3NSdW5dKVxuLmRpcmVjdGl2ZSgnYW5hbHl0aWNzT24nLCBbJyRhbmFseXRpY3MnLCBhbmFseXRpY3NPbl0pXG4uY29uZmlnKFsnJHByb3ZpZGUnLCBleGNlcHRpb25UcmFja10pO1xuXG5mdW5jdGlvbiAkYW5hbHl0aWNzKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuXG4gIHZhciBzZXR0aW5ncyA9IHtcbiAgICBwYWdlVHJhY2tpbmc6IHtcbiAgICAgIGF1dG9UcmFja0ZpcnN0UGFnZTogdHJ1ZSxcbiAgICAgIGF1dG9UcmFja1ZpcnR1YWxQYWdlczogdHJ1ZSxcbiAgICAgIHRyYWNrUmVsYXRpdmVQYXRoOiBmYWxzZSxcbiAgICAgIHRyYWNrUm91dGVzOiB0cnVlLFxuICAgICAgdHJhY2tTdGF0ZXM6IHRydWUsXG4gICAgICBhdXRvQmFzZVBhdGg6IGZhbHNlLFxuICAgICAgYmFzZVBhdGg6ICcnLFxuICAgICAgZXhjbHVkZWRSb3V0ZXM6IFtdLFxuICAgICAgcXVlcnlLZXlzV2hpdGVsaXN0ZWQ6IFtdLFxuICAgICAgcXVlcnlLZXlzQmxhY2tsaXN0ZWQ6IFtdLFxuICAgICAgZmlsdGVyVXJsU2VnbWVudHM6IFtdXG4gICAgfSxcbiAgICBldmVudFRyYWNraW5nOiB7fSxcbiAgICBidWZmZXJGbHVzaERlbGF5OiAxMDAwLCAvLyBTdXBwb3J0IG9ubHkgb25lIGNvbmZpZ3VyYXRpb24gZm9yIGJ1ZmZlciBmbHVzaCBkZWxheSB0byBzaW1wbGlmeSBidWZmZXJpbmdcbiAgICB0cmFja0V4Y2VwdGlvbnM6IGZhbHNlLFxuICAgIG9wdE91dDogZmFsc2UsXG4gICAgZGV2ZWxvcGVyTW9kZTogZmFsc2UgLy8gUHJldmVudCBzZW5kaW5nIGRhdGEgaW4gbG9jYWwvZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnRcbiAgfTtcblxuICAvLyBMaXN0IG9mIGtub3duIGhhbmRsZXJzIHRoYXQgcGx1Z2lucyBjYW4gcmVnaXN0ZXIgdGhlbXNlbHZlcyBmb3JcbiAgdmFyIGtub3duSGFuZGxlcnMgPSBbXG4gICAgJ3BhZ2VUcmFjaycsXG4gICAgJ2V2ZW50VHJhY2snLFxuICAgICdleGNlcHRpb25UcmFjaycsXG4gICAgJ3RyYW5zYWN0aW9uVHJhY2snLFxuICAgICdzZXRBbGlhcycsXG4gICAgJ3NldFVzZXJuYW1lJyxcbiAgICAnc2V0VXNlclByb3BlcnRpZXMnLFxuICAgICdzZXRVc2VyUHJvcGVydGllc09uY2UnLFxuICAgICdzZXRTdXBlclByb3BlcnRpZXMnLFxuICAgICdzZXRTdXBlclByb3BlcnRpZXNPbmNlJyxcbiAgICAnaW5jcmVtZW50UHJvcGVydHknLFxuICAgICd1c2VyVGltaW5ncycsXG4gICAgJ2NsZWFyQ29va2llcydcbiAgXTtcbiAgLy8gQ2FjaGUgYW5kIGhhbmRsZXIgcHJvcGVydGllcyB3aWxsIG1hdGNoIHZhbHVlcyBpbiAna25vd25IYW5kbGVycycgYXMgdGhlIGJ1ZmZlcmluZyBmdW5jdG9ucyBhcmUgaW5zdGFsbGVkLlxuICB2YXIgY2FjaGUgPSB7fTtcbiAgdmFyIGhhbmRsZXJzID0ge307XG4gIHZhciBoYW5kbGVyT3B0aW9ucyA9IHt9O1xuXG4gIC8vIEdlbmVyYWwgYnVmZmVyaW5nIGhhbmRsZXJcbiAgZnVuY3Rpb24gYnVmZmVyZWRIYW5kbGVyKGhhbmRsZXJOYW1lKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIGlmKGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JDb3VudCl7XG4gICAgICAgIGlmKCFjYWNoZVtoYW5kbGVyTmFtZV0peyBjYWNoZVtoYW5kbGVyTmFtZV0gPSBbXTsgfVxuICAgICAgICBjYWNoZVtoYW5kbGVyTmFtZV0ucHVzaChhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBBcyBoYW5kbGVycyBhcmUgaW5zdGFsbGVkIGJ5IHBsdWdpbnMsIHRoZXkgZ2V0IHB1c2hlZCBpbnRvIGEgbGlzdCBhbmQgaW52b2tlZCBpbiBvcmRlci5cbiAgZnVuY3Rpb24gdXBkYXRlSGFuZGxlcnMoaGFuZGxlck5hbWUsIGZuLCBvcHRpb25zKXtcbiAgICBpZighaGFuZGxlcnNbaGFuZGxlck5hbWVdKXtcbiAgICAgIGhhbmRsZXJzW2hhbmRsZXJOYW1lXSA9IFtdO1xuICAgIH1cbiAgICBoYW5kbGVyc1toYW5kbGVyTmFtZV0ucHVzaChmbik7XG4gICAgaGFuZGxlck9wdGlvbnNbZm5dID0gb3B0aW9ucztcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCF0aGlzLnNldHRpbmdzLm9wdE91dCkge1xuICAgICAgICB2YXIgaGFuZGxlckFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGluamVjdChbJyRxJywgYW5ndWxhci5iaW5kKHRoaXMsIGZ1bmN0aW9uKCRxKSB7XG4gICAgICAgICAgcmV0dXJuICRxLmFsbChoYW5kbGVyc1toYW5kbGVyTmFtZV0ubWFwKGZ1bmN0aW9uKGhhbmRsZXJGbikge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBoYW5kbGVyT3B0aW9uc1toYW5kbGVyRm5dIHx8IHt9O1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXN5bmMpIHtcbiAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRBcmdzID0gYW5ndWxhci5jb3B5KGhhbmRsZXJBcmdzKTtcbiAgICAgICAgICAgICAgY3VycmVudEFyZ3MudW5zaGlmdChkZWZlcnJlZC5yZXNvbHZlKTtcbiAgICAgICAgICAgICAgaGFuZGxlckZuLmFwcGx5KHRoaXMsIGN1cnJlbnRBcmdzKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKGhhbmRsZXJGbi5hcHBseSh0aGlzLCBoYW5kbGVyQXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfSldKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gVGhlIGFwaSAocmV0dXJuZWQgYnkgdGhpcyBwcm92aWRlcikgZ2V0cyBwb3B1bGF0ZWQgd2l0aCBoYW5kbGVycyBiZWxvdy5cbiAgdmFyIGFwaSA9IHtcbiAgICBzZXR0aW5nczogc2V0dGluZ3NcbiAgfTtcblxuICAvLyBPcHQgaW4gYW5kIG9wdCBvdXQgZnVuY3Rpb25zXG4gIGFwaS5zZXRPcHRPdXQgPSBmdW5jdGlvbihvcHRPdXQpIHtcbiAgICB0aGlzLnNldHRpbmdzLm9wdE91dCA9IG9wdE91dDtcbiAgICB0cmlnZ2VyUmVnaXN0ZXIoKTtcbiAgfTtcblxuICBhcGkuZ2V0T3B0T3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGluZ3Mub3B0T3V0O1xuICB9O1xuXG5cbiAgLy8gV2lsbCBydW4gc2V0VGltZW91dCBpZiBkZWxheSBpcyA+IDBcbiAgLy8gUnVucyBpbW1lZGlhdGVseSBpZiBubyBkZWxheSB0byBtYWtlIHN1cmUgY2FjaGUvYnVmZmVyIGlzIGZsdXNoZWQgYmVmb3JlIGFueXRoaW5nIGVsc2UuXG4gIC8vIFBsdWdpbnMgc2hvdWxkIHRha2UgY2FyZSB0byByZWdpc3RlciBoYW5kbGVycyBieSBvcmRlciBvZiBwcmVjZWRlbmNlLlxuICBmdW5jdGlvbiBvblRpbWVvdXQoZm4sIGRlbGF5KXtcbiAgICBpZihkZWxheSl7XG4gICAgICBzZXRUaW1lb3V0KGZuLCBkZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZuKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3ZpZGVyID0ge1xuICAgICRnZXQ6IFsnJGluamVjdG9yJywgZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICByZXR1cm4gYXBpV2l0aEluamVjdG9yKCRpbmplY3Rvcik7XG4gICAgfV0sXG4gICAgYXBpOiBhcGksXG4gICAgc2V0dGluZ3M6IHNldHRpbmdzLFxuICAgIHZpcnR1YWxQYWdldmlld3M6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvVHJhY2tWaXJ0dWFsUGFnZXMgPSB2YWx1ZTsgfSxcbiAgICB0cmFja1N0YXRlczogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrU3RhdGVzID0gdmFsdWU7IH0sXG4gICAgdHJhY2tSb3V0ZXM6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1JvdXRlcyA9IHZhbHVlOyB9LFxuICAgIGV4Y2x1ZGVSb3V0ZXM6IGZ1bmN0aW9uKHJvdXRlcykgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5leGNsdWRlZFJvdXRlcyA9IHJvdXRlczsgfSxcbiAgICBxdWVyeUtleXNXaGl0ZWxpc3Q6IGZ1bmN0aW9uKGtleXMpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcucXVlcnlLZXlzV2hpdGVsaXN0ZWQgPSBrZXlzOyB9LFxuICAgIHF1ZXJ5S2V5c0JsYWNrbGlzdDogZnVuY3Rpb24oa2V5cykgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5xdWVyeUtleXNCbGFja2xpc3RlZCA9IGtleXM7IH0sXG4gICAgZmlsdGVyVXJsU2VnbWVudHM6IGZ1bmN0aW9uKGZpbHRlcnMpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuZmlsdGVyVXJsU2VnbWVudHMgPSBmaWx0ZXJzOyB9LFxuICAgIGZpcnN0UGFnZXZpZXc6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvVHJhY2tGaXJzdFBhZ2UgPSB2YWx1ZTsgfSxcbiAgICB3aXRoQmFzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCA9ICh2YWx1ZSkgPyBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2Jhc2UnKS5hdHRyKCdocmVmJykgOiAnJztcbiAgICB9LFxuICAgIHdpdGhBdXRvQmFzZTogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9CYXNlUGF0aCA9IHZhbHVlOyB9LFxuICAgIHRyYWNrRXhjZXB0aW9uczogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MudHJhY2tFeGNlcHRpb25zID0gdmFsdWU7IH0sXG4gICAgZGV2ZWxvcGVyTW9kZTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5kZXZlbG9wZXJNb2RlID0gdmFsdWU7IH1cbiAgfTtcblxuICAvLyBHZW5lcmFsIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHBsdWdpbiBoYW5kbGVycy4gRmx1c2hlcyBidWZmZXJzIGltbWVkaWF0ZWx5IHVwb24gcmVnaXN0cmF0aW9uIGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWVkIGRlbGF5LlxuICBmdW5jdGlvbiByZWdpc3RlcihoYW5kbGVyTmFtZSwgZm4sIG9wdGlvbnMpe1xuICAgIC8vIERvIG5vdCBhZGQgYSBoYW5kbGVyIGlmIGRldmVsb3Blck1vZGUgaXMgdHJ1ZVxuICAgIGlmIChzZXR0aW5ncy5kZXZlbG9wZXJNb2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXBpW2hhbmRsZXJOYW1lXSA9IHVwZGF0ZUhhbmRsZXJzKGhhbmRsZXJOYW1lLCBmbiwgb3B0aW9ucyk7XG4gICAgdmFyIGhhbmRsZXJTZXR0aW5ncyA9IHNldHRpbmdzW2hhbmRsZXJOYW1lXTtcbiAgICB2YXIgaGFuZGxlckRlbGF5ID0gKGhhbmRsZXJTZXR0aW5ncykgPyBoYW5kbGVyU2V0dGluZ3MuYnVmZmVyRmx1c2hEZWxheSA6IG51bGw7XG4gICAgdmFyIGRlbGF5ID0gKGhhbmRsZXJEZWxheSAhPT0gbnVsbCkgPyBoYW5kbGVyRGVsYXkgOiBzZXR0aW5ncy5idWZmZXJGbHVzaERlbGF5O1xuICAgIGFuZ3VsYXIuZm9yRWFjaChjYWNoZVtoYW5kbGVyTmFtZV0sIGZ1bmN0aW9uIChhcmdzLCBpbmRleCkge1xuICAgICAgb25UaW1lb3V0KGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkodGhpcywgYXJncyk7IH0sIGluZGV4ICogZGVsYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FwaXRhbGl6ZShpbnB1dCkge1xuICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL14uLywgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoLnRvVXBwZXJDYXNlKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vcHJvdmlkZSBhIG1ldGhvZCB0byBpbmplY3Qgc2VydmljZXMgaW50byBoYW5kbGVyc1xuICB2YXIgYXBpV2l0aEluamVjdG9yID0gZnVuY3Rpb24oaW5qZWN0b3IpIHtcbiAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoYXBpLCB7XG4gICAgICAnJGluamVjdCc6IGluamVjdG9yLmludm9rZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZHMgdG8gdGhlIHByb3ZpZGVyIGEgJ3JlZ2lzdGVyI3toYW5kbGVyTmFtZX0nIGZ1bmN0aW9uIHRoYXQgbWFuYWdlcyBtdWx0aXBsZSBwbHVnaW5zIGFuZCBidWZmZXIgZmx1c2hpbmcuXG4gIGZ1bmN0aW9uIGluc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbihoYW5kbGVyTmFtZSl7XG4gICAgdmFyIHJlZ2lzdGVyTmFtZSA9ICdyZWdpc3RlcicrY2FwaXRhbGl6ZShoYW5kbGVyTmFtZSk7XG4gICAgcHJvdmlkZXJbcmVnaXN0ZXJOYW1lXSA9IGZ1bmN0aW9uKGZuLCBvcHRpb25zKXtcbiAgICAgIHJlZ2lzdGVyKGhhbmRsZXJOYW1lLCBmbiwgb3B0aW9ucyk7XG4gICAgfTtcbiAgICBhcGlbaGFuZGxlck5hbWVdID0gdXBkYXRlSGFuZGxlcnMoaGFuZGxlck5hbWUsIGJ1ZmZlcmVkSGFuZGxlcihoYW5kbGVyTmFtZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRSZWdpc3RlcmluZyhfcHJvdmlkZXIsIF9rbm93bkhhbmRsZXJzLCBfaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKF9rbm93bkhhbmRsZXJzLCBfaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBfcHJvdmlkZXIpIHtcbiAgICAgIHZtW2tleV0gPSBfcHJvdmlkZXJba2V5XTtcbiAgICB9XG4gIH1cblxuICAvLyBBbGxvdyAkYW5ndWxhcnRpY3MgdG8gdHJpZ2dlciB0aGUgcmVnaXN0ZXIgdG8gdXBkYXRlIG9wdCBpbi9vdXRcbiAgdmFyIHRyaWdnZXJSZWdpc3RlciA9IGZ1bmN0aW9uKCkge1xuICAgIHN0YXJ0UmVnaXN0ZXJpbmcocHJvdmlkZXIsIGtub3duSGFuZGxlcnMsIGluc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbik7XG4gIH07XG5cbiAgLy8gSW5pdGlhbCByZWdpc3RlclxuICBzdGFydFJlZ2lzdGVyaW5nKHByb3ZpZGVyLCBrbm93bkhhbmRsZXJzLCBpbnN0YWxsSGFuZGxlclJlZ2lzdGVyRnVuY3Rpb24pO1xuXG59XG5cbmZ1bmN0aW9uICRhbmFseXRpY3NSdW4oJHJvb3RTY29wZSwgJHdpbmRvdywgJGFuYWx5dGljcywgJGluamVjdG9yKSB7XG5cbiAgZnVuY3Rpb24gbWF0Y2hlc0V4Y2x1ZGVkUm91dGUodXJsKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5leGNsdWRlZFJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGV4Y2x1ZGVkUm91dGUgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5leGNsdWRlZFJvdXRlc1tpXTtcbiAgICAgIGlmICgoZXhjbHVkZWRSb3V0ZSBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBleGNsdWRlZFJvdXRlLnRlc3QodXJsKSkgfHwgdXJsLmluZGV4T2YoZXhjbHVkZWRSb3V0ZSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlEaWZmZXJlbmNlKGExLCBhMikge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGExLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYTIuaW5kZXhPZihhMVtpXSkgPT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGExW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbHRlclF1ZXJ5U3RyaW5nKHVybCwga2V5c01hdGNoQXJyLCB0aGlzVHlwZSl7XG4gICAgaWYgKC9cXD8vLnRlc3QodXJsKSAmJiBrZXlzTWF0Y2hBcnIubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHVybEFyciA9IHVybC5zcGxpdCgnPycpO1xuICAgICAgdmFyIHVybEJhc2UgPSB1cmxBcnJbMF07XG4gICAgICB2YXIgcGFpcnMgPSB1cmxBcnJbMV0uc3BsaXQoJyYnKTtcbiAgICAgIHZhciBtYXRjaGVkUGFpcnMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzTWF0Y2hBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGxpc3RlZEtleSA9IGtleXNNYXRjaEFycltpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYWlycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICgobGlzdGVkS2V5IGluc3RhbmNlb2YgUmVnRXhwICYmIGxpc3RlZEtleS50ZXN0KHBhaXJzW2pdKSkgfHwgcGFpcnNbal0uaW5kZXhPZihsaXN0ZWRLZXkpID4gLTEpIG1hdGNoZWRQYWlycy5wdXNoKHBhaXJzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbWF0Y2hlZFBhaXJzQXJyID0gKHRoaXNUeXBlID09ICd3aGl0ZScgPyBtYXRjaGVkUGFpcnMgOiBhcnJheURpZmZlcmVuY2UocGFpcnMsbWF0Y2hlZFBhaXJzKSk7XG4gICAgICBpZihtYXRjaGVkUGFpcnNBcnIubGVuZ3RoID4gMCl7XG4gICAgICAgIHJldHVybiB1cmxCYXNlICsgJz8nICsgbWF0Y2hlZFBhaXJzQXJyLmpvaW4oJyYnKTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gdXJsQmFzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB3aGl0ZWxpc3RRdWVyeVN0cmluZyh1cmwpe1xuICAgIHJldHVybiBmaWx0ZXJRdWVyeVN0cmluZyh1cmwsICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnF1ZXJ5S2V5c1doaXRlbGlzdGVkLCAnd2hpdGUnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJsYWNrbGlzdFF1ZXJ5U3RyaW5nKHVybCl7XG4gICAgcmV0dXJuIGZpbHRlclF1ZXJ5U3RyaW5nKHVybCwgJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcucXVlcnlLZXlzQmxhY2tsaXN0ZWQsICdibGFjaycpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsdGVyVXJsU2VnbWVudHModXJsKXtcbiAgICB2YXIgc2VnbWVudEZpbHRlcnNBcnIgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5maWx0ZXJVcmxTZWdtZW50cztcblxuICAgIGlmIChzZWdtZW50RmlsdGVyc0Fyci5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdXJsQXJyID0gdXJsLnNwbGl0KCc/Jyk7XG4gICAgICB2YXIgdXJsQmFzZSA9IHVybEFyclswXTtcblxuICAgICAgdmFyIHNlZ21lbnRzID0gdXJsQmFzZS5zcGxpdCgnLycpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlZ21lbnRGaWx0ZXJzQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWdtZW50RmlsdGVyID0gc2VnbWVudEZpbHRlcnNBcnJbaV07XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBzZWdtZW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIC8qIEZpcnN0IHNlZ21lbnQgd2lsbCBiZSBob3N0L3Byb3RvY29sIG9yIGJhc2UgcGF0aC4gKi9cbiAgICAgICAgICBpZiAoKHNlZ21lbnRGaWx0ZXIgaW5zdGFuY2VvZiBSZWdFeHAgJiYgc2VnbWVudEZpbHRlci50ZXN0KHNlZ21lbnRzW2pdKSkgfHwgc2VnbWVudHNbal0uaW5kZXhPZihzZWdtZW50RmlsdGVyKSA+IC0xKSB7XG4gICAgICAgICAgICBzZWdtZW50c1tqXSA9ICdGSUxURVJFRCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cy5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKSB7XG4gICAgaWYgKCFtYXRjaGVzRXhjbHVkZWRSb3V0ZSh1cmwpKSB7XG4gICAgICB1cmwgPSB3aGl0ZWxpc3RRdWVyeVN0cmluZyh1cmwpO1xuICAgICAgdXJsID0gYmxhY2tsaXN0UXVlcnlTdHJpbmcodXJsKTtcbiAgICAgIHVybCA9IGZpbHRlclVybFNlZ21lbnRzKHVybCk7XG4gICAgICAkYW5hbHl0aWNzLnBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9UcmFja0ZpcnN0UGFnZSkge1xuICAgIC8qIE9ubHkgdHJhY2sgdGhlICdmaXJzdCBwYWdlJyBpZiB0aGVyZSBhcmUgbm8gcm91dGVzIG9yIHN0YXRlcyBvbiB0aGUgcGFnZSAqL1xuICAgIHZhciBub1JvdXRlc09yU3RhdGVzID0gdHJ1ZTtcbiAgICBpZiAoJGluamVjdG9yLmhhcygnJHJvdXRlJykpIHtcbiAgICAgICB2YXIgJHJvdXRlID0gJGluamVjdG9yLmdldCgnJHJvdXRlJyk7XG4gICAgICAgaWYgKCRyb3V0ZSkge1xuICAgICAgICBmb3IgKHZhciByb3V0ZSBpbiAkcm91dGUucm91dGVzKSB7XG4gICAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgfSBlbHNlIGlmICgkcm91dGUgPT09IG51bGwpe1xuICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgfVxuICAgIH0gZWxzZSBpZiAoJGluamVjdG9yLmhhcygnJHN0YXRlJykpIHtcbiAgICAgIHZhciAkc3RhdGUgPSAkaW5qZWN0b3IuZ2V0KCckc3RhdGUnKTtcbiAgICAgIGlmICgkc3RhdGUuZ2V0KCkubGVuZ3RoID4gMSkgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAobm9Sb3V0ZXNPclN0YXRlcykge1xuICAgICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9CYXNlUGF0aCkge1xuICAgICAgICAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCA9ICR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgICB9XG4gICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tSZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWdlVHJhY2soJGxvY2F0aW9uLmFic1VybCgpLCAkbG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9UcmFja1ZpcnR1YWxQYWdlcykge1xuICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvQmFzZVBhdGgpIHtcbiAgICAgIC8qIEFkZCB0aGUgZnVsbCByb3V0ZSB0byB0aGUgYmFzZS4gKi9cbiAgICAgICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoID0gJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIFwiI1wiO1xuICAgIH1cbiAgICB2YXIgbm9Sb3V0ZXNPclN0YXRlcyA9IHRydWU7XG5cbiAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tSb3V0ZXMpIHtcbiAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCckcm91dGUnKSkge1xuICAgICAgICB2YXIgJHJvdXRlID0gJGluamVjdG9yLmdldCgnJHJvdXRlJyk7XG4gICAgICAgIGlmICgkcm91dGUpIHtcbiAgICAgICAgICBmb3IgKHZhciByb3V0ZSBpbiAkcm91dGUucm91dGVzKSB7XG4gICAgICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoJHJvdXRlID09PSBudWxsKXtcbiAgICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJlbnQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudCAmJiAoY3VycmVudC4kJHJvdXRlfHxjdXJyZW50KS5yZWRpcmVjdFRvKSByZXR1cm47XG4gICAgICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCArICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICAgIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgICAgICAgfV0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tTdGF0ZXMpIHtcbiAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCckc3RhdGUnKSAmJiAhJGluamVjdG9yLmhhcygnJHRyYW5zaXRpb25zJykpIHtcbiAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uIChldmVudCwgY3VycmVudCkge1xuICAgICAgICAgICRpbmplY3Rvci5pbnZva2UoWyckbG9jYXRpb24nLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgICBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgICAgICAgIH1dKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoJGluamVjdG9yLmhhcygnJHN0YXRlJykgJiYgJGluamVjdG9yLmhhcygnJHRyYW5zaXRpb25zJykpIHtcbiAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJHRyYW5zaXRpb25zJywgZnVuY3Rpb24oJHRyYW5zaXRpb25zKSB7XG4gICAgICAgICAgJHRyYW5zaXRpb25zLm9uU3VjY2Vzcyh7fSwgZnVuY3Rpb24oJHRyYW5zaXRpb24kKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbk9wdGlvbnMgPSAkdHJhbnNpdGlvbiQub3B0aW9ucygpO1xuXG4gICAgICAgICAgICAvLyBvbmx5IHRyYWNrIGZvciB0cmFuc2l0aW9ucyB0aGF0IHdvdWxkIGhhdmUgdHJpZ2dlcmVkICRzdGF0ZUNoYW5nZVN1Y2Nlc3NcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uT3B0aW9ucy5ub3RpZnkpIHtcbiAgICAgICAgICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5vUm91dGVzT3JTdGF0ZXMpIHtcbiAgICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKGV2ZW50LCBjdXJyZW50KSB7XG4gICAgICAgIGlmIChjdXJyZW50ICYmIChjdXJyZW50LiQkcm91dGUgfHwgY3VycmVudCkucmVkaXJlY3RUbykgcmV0dXJuO1xuICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1JlbGF0aXZlUGF0aCkge1xuICAgICAgICAgICAgdmFyIHVybCA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoICsgJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnZVRyYWNrKCRsb2NhdGlvbi5hYnNVcmwoKSwgJGxvY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1dKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5kZXZlbG9wZXJNb2RlKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKCRhbmFseXRpY3MsIGZ1bmN0aW9uKGF0dHIsIG5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAkYW5hbHl0aWNzW25hbWVdID0gZnVuY3Rpb24oKXt9O1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuYWx5dGljc09uKCRhbmFseXRpY3MpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgIHZhciBldmVudFR5cGUgPSAkYXR0cnMuYW5hbHl0aWNzT24gfHwgJ2NsaWNrJztcbiAgICAgIHZhciB0cmFja2luZ0RhdGEgPSB7fTtcblxuICAgICAgYW5ndWxhci5mb3JFYWNoKCRhdHRycy4kYXR0ciwgZnVuY3Rpb24oYXR0ciwgbmFtZSkge1xuICAgICAgICBpZiAoaXNQcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgIHRyYWNraW5nRGF0YVtwcm9wZXJ0eU5hbWUobmFtZSldID0gJGF0dHJzW25hbWVdO1xuICAgICAgICAgICRhdHRycy4kb2JzZXJ2ZShuYW1lLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICB0cmFja2luZ0RhdGFbcHJvcGVydHlOYW1lKG5hbWUpXSA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdKS5vbihldmVudFR5cGUsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgdmFyIGV2ZW50TmFtZSA9ICRhdHRycy5hbmFseXRpY3NFdmVudCB8fCBpbmZlckV2ZW50TmFtZSgkZWxlbWVudFswXSk7XG4gICAgICAgIHRyYWNraW5nRGF0YS5ldmVudFR5cGUgPSAkZXZlbnQudHlwZTtcblxuICAgICAgICBpZigkYXR0cnMuYW5hbHl0aWNzSWYpe1xuICAgICAgICAgIGlmKCEgJHNjb3BlLiRldmFsKCRhdHRycy5hbmFseXRpY3NJZikpe1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBDYW5jZWwgdGhpcyBldmVudCBpZiB3ZSBkb24ndCBwYXNzIHRoZSBhbmFseXRpY3MtaWYgY29uZGl0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IGNvbXBvbmVudHMgdG8gcGFzcyB0aHJvdWdoIGFuIGV4cHJlc3Npb24gdGhhdCBnZXRzIG1lcmdlZCBvbiB0byB0aGUgZXZlbnQgcHJvcGVydGllc1xuICAgICAgICAvLyBlZy4gYW5hbHl0aWNzLXByb3Blcml0ZXM9J215Q29tcG9uZW50U2NvcGUuc29tZUNvbmZpZ0V4cHJlc3Npb24uJGFuYWx5dGljc1Byb3BlcnRpZXMnXG4gICAgICAgIGlmKCRhdHRycy5hbmFseXRpY3NQcm9wZXJ0aWVzKXtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0cmFja2luZ0RhdGEsICRzY29wZS4kZXZhbCgkYXR0cnMuYW5hbHl0aWNzUHJvcGVydGllcykpO1xuICAgICAgICB9XG4gICAgICAgICRhbmFseXRpY3MuZXZlbnRUcmFjayhldmVudE5hbWUsIHRyYWNraW5nRGF0YSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4Y2VwdGlvblRyYWNrKCRwcm92aWRlKSB7XG4gICRwcm92aWRlLmRlY29yYXRvcignJGV4Y2VwdGlvbkhhbmRsZXInLCBbJyRkZWxlZ2F0ZScsICckaW5qZWN0b3InLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkaW5qZWN0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCBjYXVzZSkge1xuICAgICAgdmFyIHJlc3VsdCA9ICRkZWxlZ2F0ZShlcnJvciwgY2F1c2UpO1xuICAgICAgdmFyICRhbmFseXRpY3MgPSAkaW5qZWN0b3IuZ2V0KCckYW5hbHl0aWNzJyk7XG4gICAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy50cmFja0V4Y2VwdGlvbnMpIHtcbiAgICAgICAgJGFuYWx5dGljcy5leGNlcHRpb25UcmFjayhlcnJvciwgY2F1c2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9XSk7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWFuZChlbGVtZW50KSB7XG4gIHJldHVybiBbJ2E6JywnYnV0dG9uOicsJ2J1dHRvbjpidXR0b24nLCdidXR0b246c3VibWl0JywnaW5wdXQ6YnV0dG9uJywnaW5wdXQ6c3VibWl0J10uaW5kZXhPZihcbiAgICBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSsnOicrKGVsZW1lbnQudHlwZXx8JycpKSA+PSAwO1xufVxuXG5mdW5jdGlvbiBpbmZlckV2ZW50VHlwZShlbGVtZW50KSB7XG4gIGlmIChpc0NvbW1hbmQoZWxlbWVudCkpIHJldHVybiAnY2xpY2snO1xuICByZXR1cm4gJ2NsaWNrJztcbn1cblxuZnVuY3Rpb24gaW5mZXJFdmVudE5hbWUoZWxlbWVudCkge1xuICBpZiAoaXNDb21tYW5kKGVsZW1lbnQpKSByZXR1cm4gZWxlbWVudC5pbm5lclRleHQgfHwgZWxlbWVudC52YWx1ZTtcbiAgcmV0dXJuIGVsZW1lbnQuaWQgfHwgZWxlbWVudC5uYW1lIHx8IGVsZW1lbnQudGFnTmFtZTtcbn1cblxuZnVuY3Rpb24gaXNQcm9wZXJ0eShuYW1lKSB7XG4gIHJldHVybiBuYW1lLnN1YnN0cigwLCA5KSA9PT0gJ2FuYWx5dGljcycgJiYgWydPbicsICdFdmVudCcsICdJZicsICdQcm9wZXJ0aWVzJywgJ0V2ZW50VHlwZSddLmluZGV4T2YobmFtZS5zdWJzdHIoOSkpID09PSAtMTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlOYW1lKG5hbWUpIHtcbiAgdmFyIHMgPSBuYW1lLnNsaWNlKDkpOyAvLyBzbGljZSBvZmYgdGhlICdhbmFseXRpY3MnIHByZWZpeFxuICBpZiAodHlwZW9mIHMgIT09ICd1bmRlZmluZWQnICYmIHMhPT1udWxsICYmIHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBzLnN1YnN0cmluZygwLCAxKS50b0xvd2VyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cbn0pKGFuZ3VsYXIpO1xuIiwicmVxdWlyZSgnLi9hbmd1bGFydGljcycpO1xubW9kdWxlLmV4cG9ydHMgPSAnYW5ndWxhcnRpY3MnO1xuIiwicmVxdWlyZSgnLi9qcy9nb29nbGVBbmFseXRpY3MubW9kdWxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9ICdnb29nbGVBbmFseXRpY3MnO1xuIiwiaW1wb3J0IFwiYW5ndWxhcnRpY3NcIjtcbmltcG9ydCBcImFuZ3VsYXJ0aWNzLWdvb2dsZS10YWctbWFuYWdlclwiO1xuXG5hbmd1bGFyLm1vZHVsZSgnZ29vZ2xlQW5hbHl0aWNzJywgW1wiYW5ndWxhcnRpY3NcIiwgXCJhbmd1bGFydGljcy5nb29nbGUudGFnbWFuYWdlclwiXSlcbiAgLmZhY3RvcnkoJ2dhSW5qZWN0aW9uU2VydmljZScsIFsnZ29vZ2xlQW5hbHl0aWNzQ29uZmlnJywgZnVuY3Rpb24oZ29vZ2xlQW5hbHl0aWNzQ29uZmlnKSB7XG4gICAgY29uc3QgZGVmYXVsdENvZGUgPSBgd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBndGFnKCl7ZGF0YUxheWVyLnB1c2goYXJndW1lbnRzKTt9XG4gICAgICAgICAgICAgICAgICAgICAgICBndGFnKCdqcycsIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3RhZygnY29uZmlnJywgJyR7Z29vZ2xlQW5hbHl0aWNzQ29uZmlnLnRyYWNraW5nSWR9Jyk7YDtcbiAgICBjb25zdCBfaW5saW5lQ29kZSA9IGdvb2dsZUFuYWx5dGljc0NvbmZpZy5pbmxpbmVTY3JpcHQgfHwgZGVmYXVsdENvZGU7XG5cbiAgICBjb25zdCBkZWZhdWx0VVJMID0gYGh0dHBzOi8vd3d3Lmdvb2dsZXRhZ21hbmFnZXIuY29tL2d0YWcvanM/aWQ9JHtnb29nbGVBbmFseXRpY3NDb25maWcudHJhY2tpbmdJZH1gO1xuICAgIGxldCBfZXh0ZXJuYWxTb3VyY2U7XG5cbiAgICBpZiAoZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLmV4dGVybmFsU2NyaXB0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9leHRlcm5hbFNvdXJjZSA9IGRlZmF1bHRVUkw7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9leHRlcm5hbFNvdXJjZSA9IGdvb2dsZUFuYWx5dGljc0NvbmZpZy5leHRlcm5hbFNjcmlwdFVSTDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGdldEV4dGVybmFsU291cmNlOiBfZXh0ZXJuYWxTb3VyY2UsXG4gICAgICAkZ2V0SW5saW5lQ29kZTogX2lubGluZUNvZGUsXG4gICAgICBpbmplY3RHQUNvZGUoKSB7XG4gICAgICAgIGlmIChfZXh0ZXJuYWxTb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBleHRlcm5hbFNjcmlwdFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgIGV4dGVybmFsU2NyaXB0VGFnLnNyYyA9IF9leHRlcm5hbFNvdXJjZTtcbiAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGV4dGVybmFsU2NyaXB0VGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubGluZVNjcmlwdFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICBpbmxpbmVTY3JpcHRUYWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuXG4gICAgICAgIC8vIE1ldGhvZHMgb2YgYWRkaW5nIGlubmVyIHRleHQgc29tZXRpbWVzIGRvZXNuJ3Qgd29yayBhY3Jvc3MgYnJvd3NlcnMuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaW5saW5lU2NyaXB0VGFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKF9pbmxpbmVDb2RlKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpbmxpbmVTY3JpcHRUYWcudGV4dCA9IF9pbmxpbmVDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChpbmxpbmVTY3JpcHRUYWcpO1xuICAgICAgfVxuICAgIH07XG4gIH1dKTtcbiJdfQ==
