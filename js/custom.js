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

require('primo-explore-oadoi-link');

var _viewName = require('./viewName');

var _kohaItems = require('./kohaItems.module');

var _kohaAvailabilities = require('./kohaAvailabilities.module');

var _sfxHoldings = require('./sfxHoldings.module');

var _googleAnalyticsConfig = require('./googleAnalyticsConfig');

var app = angular.module('viewCustom', ['angularLoad', 'kohaItems', 'kohaAvailabilities', 'sfxHoldings', 'googleAnalytics', 'oadoi']);

app.constant(_googleAnalyticsConfig.googleAnalyticsConfig.name, _googleAnalyticsConfig.googleAnalyticsConfig.config).constant('oadoiOptions', {
       "imagePath": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAk1BMVEX///81vfYqufWy7eNUwus3vvZ92uWp6+IuvPcoufYxvfjZ8PlUx/XQ9urV7vn6//3I6fVgxeNGwvYxtu1Yv92E3eVay/Hq+/SI3+Nzy+Ch6OJ01uiw4O1Mxfjy/fjE8+e95fGT1eRnxuCk3Oljz+1Fu+x7ytpSu9+J0OBLuedYvt+s4OuS2eaU4+LZ+O3J9Oht1OtlyPIDAAADeklEQVR4nO2aa3fiIBCGBY0OWV3XEOttTdN2Y2/W9v//uo0b04uGzEDgcE6X92PCME9gYIDQ6wUFBQUFBX0SexcMCJrNVvu7/JcTAAZEsahY7Z9tQTBTAefJbO8RoGK4ff7hEaAU58WDV4BjM6w6hUNngCODiH56BSgRiju/AGVH3Bp2hCWAMhyLG78AZSMYBYI9gBKBGTSCTYCyEXZ+AcpI0O4GywBspktgG4CJJz0E6wBMzDwDMKGVIB0AMK2h4AIA5G+/AGVuoicGcp28EpBK8xk5Dqjek/m6fz162WwZCYGT10kkgGjTX5zKTydjzgnI0h4Av5qc2WQvBARqXkI/hc+nl1YJTkCNQ/T7101WizFKIFZ2ABr9kwhYbgGAv32UzA6TxafeeEVHAydNR61VQFIHfy97SyIWjecfAYk2ASdlpfYqRnWx/vY4BQFwGNaP8E7gXQFgXDf58mPsi7oN+u4B3jtAfKl2e3qMzwaU6bDNfnMqc/gab+LUCxM0DAtCRmizr4fg8PzF4d/jbIsRUMZBm/1rVWQRnde7rF68YX1AmYxazKH60Mtog3H1YokBxAW+QG0DOI2B+aWf6sUaHwf46owAsFEBjFAAGKBh2GZexcAiuYw1KgCTaE5ss95eZ1l2+NPghgzA0YOLdvvjqWCTyADw1A1AJTJAXHgGqIv6A0AT0rcHgACATYVqS66UOHXsWhAmAiwdqQw3C8SwUj9C1gSmALxhO9RMgDQCYMlABUD035uO25vAFACdwN7VkKxtAERkgCECYBgD9gAMh+H3ATDNBQHg2wAAWpFrgIFnAI6e1jkGwI+t3QIQdqduAeAWtXcKEONbQ7cAQDi1dwqAjwHHAIQecAtAOat1CYCuBVwDdDoptQCAnw20AJCX5b0rJYAg/bhSWS9pO5NJwwlW/Q20H2dK86uXPq6RemcGj7S/6Cp7pt6bfpZ6W4SfjyEAXZUS/5268k+OYkf+8fNBtwCxzP0CUNKgQwBINe6xuAB41LnX5sA/5Br+HQDE5KsDbgBiqXe30bZ/TffWAUD7aqdl/6Q1iDsAcZ/7BACjS6XW3Mfi3sS/NQCQO7PLzZb881Tj/pp1ACH177JaBIjlrsvt9q7egWvlPtsAINMb84v1HQEAuDSYeLoDlI65LNJOHW8OEEk5SFcPecd2DwoKCgr63/UXnxY8Wl1A45AAAAAASUVORK5CYII=",
       "email": "bibliotheques@univ-rennes2.fr"
});

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

},{"./googleAnalyticsConfig":1,"./kohaAvailabilities.module":2,"./kohaItems.module":3,"./sfxHoldings.module":5,"./viewName":6,"primo-explore-google-analytics":11,"primo-explore-oadoi-link":13}],5:[function(require,module,exports){
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
          var openurlSvc = openurl.replace("http://acceder.bu.univ-rennes2.fr/sfx_33puedb", "https://catalogue.bu.univ-rennes2.fr/r2microws/getSfx.php");
          var response = sfxholdingsService.getSfxData(openurlSvc).then(function (response) {
            var holdings = response.data;
            if (holdings === null) {} else {
              // 	          angular.element(document.querySelector('prm-view-online div a.arrow-link.md-primoExplore-theme'))[0].style.display = "none"; 
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

},{"angulartics":10,"angulartics-google-tag-manager":8}],13:[function(require,module,exports){
require('./js/oadoi-link.module.js')
module.exports = 'oadoi'

},{"./js/oadoi-link.module.js":14}],14:[function(require,module,exports){
angular
  .module('oadoi', [])
  .component('prmFullViewServiceContainerAfter', {
  bindings: { parentCtrl: '<' },
    controller: function controller($scope, $http, $element, oadoiService, oadoiOptions) {
        this.$onInit = function() {
        	$scope.oaDisplay=false; /* default hides template */
          $scope.imagePath=oadoiOptions.imagePath;
          var email=oadoiOptions.email;
        	var section=$scope.$parent.$ctrl.service.scrollId;
        	var obj=$scope.$ctrl.parentCtrl.item.pnx.addata;

        	if (obj.hasOwnProperty("doi")){
        		var doi=obj.doi[0];
        		console.log("doi:"+doi)

    				if (doi && section=="getit_link1_0"){
    					var url="https://api.oadoi.org/v2/"+doi+"?email="+email;

              var response=oadoiService.getOaiData(url).then(function(response){
                console.log("it worked");
                console.log(response);
                var oalink=response.data.best_oa_location.url;
                console.log(oalink);
                if(oalink===null){
                  $scope.oaDisplay=false;
                  console.log("it's false");
                  $scope.oaClass="ng-hide";
                }
                else{
                  $scope.oalink=oalink;
                  $scope.oaDisplay=true;
                  $element.children().removeClass("ng-hide"); /* initially set by $scope.oaDisplay=false */
                  $scope.oaClass="ng-show";
                }

              });


    				}
    				else{$scope.oaDisplay=false;
    				}
        	}
        	else{
        		$scope.oaClass="ng-hide";
        	}
        };

    },
  template: '<div style="height:50px;background-color:white;padding:15px;" ng-show="{{oaDisplay}}" class="{{oaClass}}"><img src="{{imagePath}}" style="float:left;height:22px;width:22px;margin-right:10px"><p >Texte intégral disponible en : <a href="{{oalink}}" target="_blank" style="font-weight:600;font-size:15px;color;#2c85d4;">Open Access</a></p></div>'
}).factory('oadoiService', ['$http',function($http){
  return{
    getOaiData: function (url) {
      return $http({
        method: 'GET',
        url: url,
        cache: true
      })
    }
  }
}]).run(
  ($http) => {
    // Necessary for requests to succeed...not sure why
    $http.defaults.headers.common = { 'X-From-ExL-API-Gateway': undefined }
  },
);

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2dvb2dsZUFuYWx5dGljc0NvbmZpZy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUF2YWlsYWJpbGl0aWVzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUl0ZW1zLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvbWFpbi5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvc2Z4SG9sZGluZ3MubW9kdWxlLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9qcy92aWV3TmFtZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzLWdvb2dsZS10YWctbWFuYWdlci9saWIvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyL2xpYi9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzL3NyYy9hbmd1bGFydGljcy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzL3NyYy9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL3ByaW1vLWV4cGxvcmUtZ29vZ2xlLWFuYWx5dGljcy9zcmMvaW5kZXguanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL25vZGVfbW9kdWxlcy9wcmltby1leHBsb3JlLWdvb2dsZS1hbmFseXRpY3Mvc3JjL2pzL2dvb2dsZUFuYWx5dGljcy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL25vZGVfbW9kdWxlcy9wcmltby1leHBsb3JlLW9hZG9pLWxpbmsvaW5kZXguanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL25vZGVfbW9kdWxlcy9wcmltby1leHBsb3JlLW9hZG9pLWxpbmsvanMvb2Fkb2ktbGluay5tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FPLElBQU0sd0RBQXdCLE9BQU8sTUFBUCxDQUFjO0FBQ2pELFFBQU0sdUJBRDJDO0FBRWpELFVBQVE7QUFDTixnQkFBWSxjQUROO0FBRU4sdUJBQW1CO0FBRmI7QUFGeUMsQ0FBZCxDQUE5Qjs7Ozs7QUNBUCxRQUFRLE1BQVIsQ0FBZSxvQkFBZixFQUFxQyxFQUFyQyxFQUF5QyxTQUF6QyxDQUFtRCxxQkFBbkQsRUFBMEU7QUFDeEUsWUFBVSxFQUFFLFlBQVksR0FBZCxFQUQ4RDtBQUV4RSxjQUFZLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixLQUE1QixFQUFtQyxRQUFuQyxFQUE2QyxnQkFBN0MsRUFBK0Q7QUFDekUsU0FBSyxPQUFMLEdBQWUsWUFBWTtBQUN6QixhQUFPLFdBQVAsR0FBcUIsS0FBckIsQ0FEeUIsQ0FDRztBQUM1QixVQUFJLE1BQU0sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixJQUF4QixDQUE2QixHQUE3QixDQUFpQyxPQUEzQztBQUNBLFVBQUksSUFBSSxjQUFKLENBQW1CLGdCQUFuQixLQUF3QyxJQUFJLGNBQUosQ0FBbUIsVUFBbkIsQ0FBNUMsRUFBNEU7QUFDMUUsWUFBSSxLQUFLLElBQUksY0FBSixDQUFtQixDQUFuQixDQUFUO0FBQ0EsWUFBSSxTQUFTLElBQUksUUFBSixDQUFhLENBQWIsQ0FBYjtBQUNBLFlBQUksV0FBVyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWY7QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGZBO0FBQ0E7QUFDQTs7OztBQ0ZBLFFBQVEsZ0NBQVI7QUFDQSxPQUFPLE9BQVAsR0FBaUIsaUJBQWpCOzs7OztBQ0RBOztBQUNBOztBQUVBLFFBQVEsTUFBUixDQUFlLGlCQUFmLEVBQWtDLENBQUMsYUFBRCxFQUFnQiwrQkFBaEIsQ0FBbEMsRUFDRyxPQURILENBQ1csb0JBRFgsRUFDaUMsQ0FBQyx1QkFBRCxFQUEwQixVQUFTLHFCQUFULEVBQWdDO0FBQ3ZGLE1BQU0sNk5BR2dDLHNCQUFzQixVQUh0RCxRQUFOO0FBSUEsTUFBTSxjQUFjLHNCQUFzQixZQUF0QixJQUFzQyxXQUExRDs7QUFFQSxNQUFNLDhEQUE0RCxzQkFBc0IsVUFBeEY7QUFDQSxNQUFJLHdCQUFKOztBQUVBLE1BQUksc0JBQXNCLGlCQUF0QixLQUE0QyxTQUFoRCxFQUEyRDtBQUN6RCxzQkFBa0IsVUFBbEI7QUFDRCxHQUZELE1BRU87QUFDTCxzQkFBa0Isc0JBQXNCLGlCQUF4QztBQUNEOztBQUVELFNBQU87QUFDTCx3QkFBb0IsZUFEZjtBQUVMLG9CQUFnQixXQUZYO0FBR0wsZ0JBSEssMEJBR1U7QUFDYixVQUFJLG9CQUFvQixJQUF4QixFQUE4QjtBQUM1QixZQUFNLG9CQUFvQixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBMUI7QUFDQSwwQkFBa0IsR0FBbEIsR0FBd0IsZUFBeEI7QUFDQSxpQkFBUyxJQUFULENBQWMsV0FBZCxDQUEwQixpQkFBMUI7QUFDRDs7QUFFRCxVQUFNLGtCQUFrQixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBeEI7QUFDQSxzQkFBZ0IsSUFBaEIsR0FBdUIsaUJBQXZCOztBQUVBO0FBQ0EsVUFBSTtBQUNGLHdCQUFnQixXQUFoQixDQUE0QixTQUFTLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBNUI7QUFDRCxPQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVix3QkFBZ0IsSUFBaEIsR0FBdUIsV0FBdkI7QUFDRDs7QUFFRCxlQUFTLElBQVQsQ0FBYyxXQUFkLENBQTBCLGVBQTFCO0FBQ0Q7QUFyQkksR0FBUDtBQXVCRCxDQXZDOEIsQ0FEakM7OztBQ0hBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImV4cG9ydCBjb25zdCBnb29nbGVBbmFseXRpY3NDb25maWcgPSBPYmplY3QuZnJlZXplKHtcbiAgbmFtZTogJ2dvb2dsZUFuYWx5dGljc0NvbmZpZycsXG4gIGNvbmZpZzoge1xuICAgIHRyYWNraW5nSWQ6IFwiVUEtNDc4OTQxOS03XCIsXG4gICAgZXh0ZXJuYWxTY3JpcHRVUkw6IFwiaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20vZ3RhZy9qcz9pZD1VQS00Nzg5NDE5LTdcIlxuICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgna29oYUF2YWlsYWJpbGl0aWVzJywgW10pLmNvbXBvbmVudCgncHJtQnJpZWZSZXN1bHRBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFhdmFpbFNlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgcmVjb3JkaWQgPSBvYmoucmVjb3JkaWRbMF07XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguZGlzcGxheS50eXBlWzBdO1xuLypcbiAgICAgICAgY29uc29sZS5sb2coXCJzb3VyY2U6XCIgKyBibik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmlibGlvbnVtYmVyOlwiICsgYm4pO1xuKi9cbiAgICAgICAgaWYgKGJuICYmIHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRJdGVtcy5waHA/YmlibGlvbnVtYmVyPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWF2YWlsU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgIGlmKHJlc3BvbnNlKXtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCB3b3JrZWRcIik7XG5cdC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0ICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YTtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbXMpO1xuXHQgICAgICAgICAgICB2YXIgYXZhaWxhYmlsaXR5ID0gaXRlbXMuYXZhaWxhYmxlO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhhdmFpbGFiaWxpdHkpO1xuXHQgICAgICAgICAgICBpZiAoYXZhaWxhYmlsaXR5ID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCdzIGZhbHNlXCIpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IHRydWU7XG5cdCAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG5cdCAgICAgICAgICAgICAgJHNjb3BlLnN0YXR1cyA9IGl0ZW1zLnN0YXR1cztcblx0ICAgICAgICAgICAgICAkc2NvcGUucmVjb3JkaWQgPSByZWNvcmRpZDtcblx0ICAgICAgICAgICAgICAkc2NvcGUuYnJhbmNoID0gaXRlbXMuaG9tZWJyYW5jaDtcblx0ICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb24gPSBpdGVtcy5sb2NhdGlvbjtcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2xhc3MgPSBpdGVtcy5jbGFzcztcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2FsbG51bWJlciA9IGl0ZW1zLml0ZW1jYWxsbnVtYmVyO1xuXHQgICAgICAgICAgICAgICRzY29wZS5vdGhlckxvY2F0aW9ucyA9IChpdGVtcy50b3RhbCAtIDEpO1xuXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtQnJpZWZSZXN1bHRBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgna29oYWF2YWlsU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFJdGVtcycsIFtdKS5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFpdGVtc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICB2YXIgb3BlbnVybDtcbiAgICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlIDpcIitzb3VyY2UpO1xuICAgICAgICB2YXIgdHlwZSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmRpc3BsYXkudHlwZVswXTtcbiAgICAgICAgaWYgKGJuICYmIChzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiIHx8ICFibi5zdGFydHNXaXRoKFwiZGVkdXBtcmdcIikpICYmIHR5cGUgIT0gXCJqb3VybmFsXCIpIHtcbiAgICAgICAgICB2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0U3J1LnBocD9pbmRleD1yZWMuaWQmcT1cIiArIGJuO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaXRlbTtcbiAgICAgICAgICAgIHZhciBrb2hhaWQgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5iaWJsaW9udW1iZXI7XG4gICAgICAgICAgICB2YXIgaW1hZ2VQYXRoID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uY292ZXI7XG4gICAgICAgICAgICBpZiAoa29oYWlkID09PSBudWxsKSB7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblx0ICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyBcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFpZCA9IGtvaGFpZDtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlID09IFwiam91cm5hbFwiKSB7XG5cdCAgICAgIFx0dmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9am91cm5hbHMmcT1cIisgYm47XG5cdFx0ICBcdHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0JHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRpZihhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJtLW9wYWMgPiBtZC10YWJzJykpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzID0gW107XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAgOyBpIDwgcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaG9sZGluZ3MubGVuZ3RoIDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaG9sZGluZyA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzW2ldXG5cdFx0XHRcdFx0XHQkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7ICBcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiam91cm5hbCA6IG5vIHByaW50IGhvbGRpbmdcIik7XG5cdFx0XHRcdFx0XHQkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdH0pO1xuLypcblx0XHRcdHRoaXMub25DbGljayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQgJHdpbmRvdy5vcGVuKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvYmliLycrIGJuLCAnX2JsYW5rJyk7XG5cdFx0XHR9O1xuKi9cblx0XHR9IFxuXHRcdFxuXHRcdHZhciBkZWxpdmVyeSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0uZGVsaXZlcnk7XG5cdFx0aWYgKGRlbGl2ZXJ5ICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAgOyBpIDwgZGVsaXZlcnkubGluay5sZW5ndGggOyBpKyspe1xuXHRcdFx0XHRpZiAoZGVsaXZlcnkubGlua1tpXS5kaXNwbGF5TGFiZWwgPT0gXCJvcGVudXJsXCIpIHtcblx0XHRcdFx0XHRvcGVudXJsID0gZGVsaXZlcnkubGlua1tpXS5saW5rVVJMO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvcGVudXJsICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRvcGVudXJsID0gb3BlbnVybC5yZXBsYWNlKC8uK1xcPy8sIFwiXCIpO1xuXHRcdFx0JHNjb3BlLnByb3hpZmllZHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvZ2V0U2Z4LnBocD9cIitvcGVudXJsO1xuXHRcdFx0JGh0dHAuanNvbnAoJHNjb3BlLnByb3hpZmllZHVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5lcnJvciA9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHQgdmFyIGxlbiA9IGtleXMubGVuZ3RoO1xuXHRcdFx0XHRcdCBjb25zb2xlLmxvZyhcIlNGWCByZXN1bHRzOiBcIitsZW4pO1xuXHRcdFx0XHRcdCBpZihsZW4gPiAwKSB7XG5cdFx0XHRcdFx0XHQgICRzY29wZS5zZnhob2xkaW5ncyA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0IH1cblx0XHRcdFx0fVxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHRcbiAgICAgIH0gXG4gICAgfTtcbiAgfSxcbiAgdGVtcGxhdGVVcmw6ICdjdXN0b20vMzNVRFIyX1ZVMS9odG1sL3BybU9wYWNBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgna29oYWl0ZW1zU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiaW1wb3J0ICdwcmltby1leHBsb3JlLWdvb2dsZS1hbmFseXRpY3MnO1xuaW1wb3J0ICdwcmltby1leHBsb3JlLW9hZG9pLWxpbmsnO1xuaW1wb3J0IHsgdmlld05hbWUgfSBmcm9tICcuL3ZpZXdOYW1lJztcbmltcG9ydCB7IGtvaGFJdGVtcyB9IGZyb20gJy4va29oYUl0ZW1zLm1vZHVsZSc7XG5pbXBvcnQgeyBrb2hhQXZhaWxhYmlsaXRpZXMgfSBmcm9tICcuL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUnO1xuaW1wb3J0IHsgc2Z4SG9sZGluZ3MgfSBmcm9tICcuL3NmeEhvbGRpbmdzLm1vZHVsZSc7XG5pbXBvcnQgeyBnb29nbGVBbmFseXRpY3NDb25maWcgfSBmcm9tICcuL2dvb2dsZUFuYWx5dGljc0NvbmZpZyc7XG5sZXQgYXBwID0gYW5ndWxhci5tb2R1bGUoJ3ZpZXdDdXN0b20nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FuZ3VsYXJMb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAna29oYUl0ZW1zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAna29oYUF2YWlsYWJpbGl0aWVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2Z4SG9sZGluZ3MnLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQnZ29vZ2xlQW5hbHl0aWNzJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0J29hZG9pJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcblxuYXBwXG4gIC5jb25zdGFudChnb29nbGVBbmFseXRpY3NDb25maWcubmFtZSwgZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLmNvbmZpZylcbiAgLmNvbnN0YW50KCdvYWRvaU9wdGlvbnMnLCB7XG5cdCAgXHRcImltYWdlUGF0aFwiOiBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBSUFBQUFDQUNBTUFBQUQwNEpINUFBQUFrMUJNVkVYLy8vODF2ZllxdWZXeTdlTlV3dXMzdnZaOTJ1V3A2K0l1dlBjb3VmWXh2ZmpaOFBsVXgvWFE5dXJWN3ZuNi8vM0k2ZlZneGVOR3d2WXh0dTFZdjkyRTNlVmF5L0hxKy9TSTMrTnp5K0NoNk9KMDF1aXc0TzFNeGZqeS9makU4K2U5NWZHVDFlUm54dUNrM09sanorMUZ1K3g3eXRwU3U5K0owT0JMdWVkWXZ0K3M0T3VTMmVhVTQrTForTzNKOU9odDFPdGx5UElEQUFBRGVrbEVRVlI0bk8yYWEzZmlJQkNHQlkwT1dWM1hFT3R0VGROMlkyL1c5di8vdW8wYjA0dUd6RURnY0U2WDkyUENNRTlnWUlEUTZ3VUZCUVVGQlgwU2V4Y01DSnJOVnZ1Ny9KY1RBQVpFc2FoWTdaOXRRVEJUQWVmSmJPOFJvR0s0ZmY3aEVhQVU1OFdEVjRCak02dzZoVU5uZ0NPRGlINTZCU2dSaWp1L0FHVkgzQnAyaENXQU1oeUxHNzhBWlNNWUJZSTlnQktCR1RTQ1RZQ3lFWForQWNwSTBPNEd5d0JzcGt0Z0c0Q0pKejBFNndCTXpEd0RNS0dWSUIwQU1LMmg0QUlBNUcrL0FHVnVvaWNHY3AyOEVwQks4eGs1RHFqZWsvbTZmejE2Mld3WkNZR1QxMGtrZ0dqVFg1ektUeWRqemduSTBoNEF2NXFjMldRdkJBUnFYa0kvaGMrbmwxWUpUa0NOUS9UNzEwMVdpekZLSUZaMkFCcjlrd2hZYmdHQXYzMlV6QTZUeGFmZWVFVkhBeWROUjYxVlFGSUhmeTk3U3lJV2plY2ZBWWsyQVNkbHBmWXFSbld4L3ZZNEJRRndHTmFQOEU3Z1hRRmdYRGY1OG1Qc2k3b04rdTRCM2p0QWZLbDJlM3FNendhVTZiRE5mbk1xYy9nYWIrTFVDeE0wREF0Q1JtaXpyNGZnOFB6RjRkL2piSXNSVU1aQm0vMXJWV1FSbmRlN3JGNjhZWDFBbVl4YXpLSDYwTXRvZzNIMVlva0J4QVcrUUcwRE9JMkIrYVdmNnNVYUh3ZjQ2b3dBc0ZFQmpGQUFHS0JoMkdaZXhjQWl1WXcxS2dDVGFFNXNzOTVlWjFsMitOUGdoZ3pBMFlPTGR2dmpxV0NUeUFEdzFBMUFKVEpBWEhnR3FJdjZBMEFUMHJjSGdBQ0FUWVZxUzY2VU9IWHNXaEFtQWl3ZHFRdzNDOFN3VWo5QzFnU21BTHhoTzlSTWdEUUNZTWxBQlVEMDM1dU8yNXZBRkFDZHdON1ZrS3h0QUVSa2dDRUNZQmdEOWdBTWgrSDNBVEROQlFIZzJ3QUFXcEZyZ0lGbkFJNmUxamtHd0krdDNRSVFkcWR1QWVBV3RYY0tFT05iUTdjQVFEaTFkd3FBandISEFJUWVjQXRBT2F0MUNZQ3VCVndEZERvcHRRQ0FudzIwQUpDWDViMHJKWUFnL2JoU1dTOXBPNU5Kd3dsVy9RMjBIMmRLODZ1WFBxNlJlbWNHajdTLzZDcDdwdDZiZnBaNlc0U2ZqeUVBWFpVUy81MjY4aytPWWtmKzhmTkJ0d0N4elAwQ1VOS2dRd0JJTmU2eHVBQjQxTG5YNXNBLzVCcitIUURFNUtzRGJnQmlxWGUzMGJaL1RmZldBVUQ3YXFkbC82UTFpRHNBY1ovN0JBQ2pTNlhXM01maTNzUy9OUUNRTzdQTHpaYjg4MVRqL3BwMUFDSDE3N0phQklqbHJzdnQ5cTdlZ1d2bFB0c0FJTk1iODR2MUhRRUF1RFNZZUxvRGxJNjVMTkpPSFc4T0VFazVTRmNQZWNkMkR3b0tDZ3I2My9VWG54WThXbDFBNDVBQUFBQUFTVVZPUks1Q1lJST1cIixcblx0ICBcdFwiZW1haWxcIjogXCJiaWJsaW90aGVxdWVzQHVuaXYtcmVubmVzMi5mclwiXG4gIH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5hcHAuY29uZmlnKFsnJHNjZURlbGVnYXRlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHNjZURlbGVnYXRlUHJvdmlkZXIpIHtcbiAgdmFyIHVybFdoaXRlbGlzdCA9ICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KCk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly8qKi5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMioqJyk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwOi8vc2Z4LXVuaXYtcmVubmVzMi5ob3N0ZWQuZXhsaWJyaXNncm91cCoqJyk7XG4gICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KHVybFdoaXRlbGlzdCk7XG59XSk7XG5cblxuLy8gY2hhbmdlIGFkdmFuY2VkIHNlYXJjaCB0byBqdW1wIHRvIHJlc3VsdHNcbmFwcC5jb250cm9sbGVyKCdwcm1BZHZhbmNlZFNlYXJjaEFmdGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xuLy8gd2F0Y2ggdG8gc2VlIGlmIGFkdmFuY2VkIHNlYXJjaCBpcyB0aGVyZVxuICAgICAgIHZhciBhZHZhbmNlZFNlYXJjaE9icyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtdXRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgaWYgKCFtdXRhdGlvbi5hZGRlZE5vZGVzKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBtdXRhdGlvbi5hZGRlZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PSBcIkJVVFRPTlwiICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJwcm0tYWR2YW5jZWQtc2VhcmNoIC5idXR0b24tY29uZmlybS5idXR0b24tbGFyZ2UuYnV0dG9uLXdpdGgtaWNvbi5tZC1idXR0b24ubWQtcHJpbW9FeHBsb3JlLXRoZW1lLm1kLWluay1yaXBwbGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL25lZWQgYW4gaWQgdG8ganVtcCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJtaXRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hZHZhbmNlZC1zZWFyY2gtb3V0cHV0LmxheW91dC1yb3cuZmxleFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRBcmVhLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiYWR2YW5jZWRTZWFyY2hTdWJtaXRBcmVhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN1Ym1pdEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJwcm0tYWR2YW5jZWQtc2VhcmNoIC5idXR0b24tY29uZmlybS5idXR0b24tbGFyZ2UuYnV0dG9uLXdpdGgtaWNvbi5tZC1idXR0b24ubWQtcHJpbW9FeHBsb3JlLXRoZW1lLm1kLWluay1yaXBwbGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3YWl0IGZvciBzb21lIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFkdmFuY2VkU2VhcmNoT2JzMiA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9uczIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11dGF0aW9uczIuZm9yRWFjaChmdW5jdGlvbihtdXRhdGlvbjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW11dGF0aW9uMi5hZGRlZE5vZGVzKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uMi5hZGRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gbXV0YXRpb24yLmFkZGVkTm9kZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09IFwiUFJNLVNFQVJDSC1SRVNVTFQtU09SVC1CWVwiICYmIHdpbmRvdy5pbm5lckhlaWdodCA8IDc3NSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2g9J2FkdmFuY2VkU2VhcmNoU3VibWl0QXJlYSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlZFNlYXJjaE9iczIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWRTZWFyY2hPYnMyLm9ic2VydmUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BybS1leHBsb3JlLW1haW4nKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHN1YnRyZWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgYXR0cmlidXRlczogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgY2hhcmFjdGVyRGF0YTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbmQgd2FpdCBmb3Igc29tZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgfSlcbiAgICAgIFxuICAgICAgIGFkdmFuY2VkU2VhcmNoT2JzLm9ic2VydmUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BybS1hZHZhbmNlZC1zZWFyY2gnKVswXSwge1xuICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICAgICAgICAgICAgLCBzdWJ0cmVlOiB0cnVlXG4gICAgICAgICAgICAgICwgYXR0cmlidXRlczogZmFsc2VcbiAgICAgICAgICAgICAgLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZVxuICAgICAgIH0pXG59KTtcblxuLy9Bbmd1bGFySlMnIG9yZGVyQnkgZmlsdGVyIGRvZXMganVzdCBzdXBwb3J0IGFycmF5cyAtIG5vIG9iamVjdHMuIFNvIHlvdSBoYXZlIHRvIHdyaXRlIGFuIG93biBzbWFsbCBmaWx0ZXIsIHdoaWNoIGRvZXMgdGhlIHNvcnRpbmcgZm9yIHlvdS5cbmFwcC5maWx0ZXIoJ29yZGVyT2JqZWN0QnknLCBmdW5jdGlvbigpe1xuIHJldHVybiBmdW5jdGlvbihpbnB1dCwgYXR0cmlidXRlKSB7XG4gICAgaWYgKCFhbmd1bGFyLmlzT2JqZWN0KGlucHV0KSkgcmV0dXJuIGlucHV0O1xuXG4gICAgdmFyIGFycmF5ID0gW107XG4gICAgZm9yKHZhciBvYmplY3RLZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgYXJyYXkucHVzaChpbnB1dFtvYmplY3RLZXldKTtcbiAgICB9XG5cbiAgICBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICBhID0gcGFyc2VJbnQoYVthdHRyaWJ1dGVdKTtcbiAgICAgICAgYiA9IHBhcnNlSW50KGJbYXR0cmlidXRlXSk7XG4gICAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9KTtcbiAgICByZXR1cm4gYXJyYXk7XG4gfVxufSk7XG5cblxuYXBwLnJ1bihydW5CbG9jayk7XG5cbnJ1bkJsb2NrLiRpbmplY3QgPSBbJ2dhSW5qZWN0aW9uU2VydmljZSddO1xuXG5mdW5jdGlvbiBydW5CbG9jayhnYUluamVjdGlvblNlcnZpY2UpIHtcbiAgZ2FJbmplY3Rpb25TZXJ2aWNlLmluamVjdEdBQ29kZSgpO1xufSIsImFuZ3VsYXIubW9kdWxlKCdzZnhIb2xkaW5ncycsIFtdKS5jb21wb25lbnQoJ3BybVZpZXdPbmxpbmVBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIHNmeGhvbGRpbmdzU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0ICAkc2NvcGUuc2Z4bG9hZGluZyA9IHRydWU7XG4gICAgICB2YXIgb2JqID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5saW5rRWxlbWVudC5saW5rc1swXTtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJnZXRJdFRhYlRleHRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwiZGlzcGxheVRleHRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwiaXNMaW5rdG9PbmxpbmVcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwibGlua1wiKSkge1xuICAgICAgICBpZiAob2JqWydkaXNwbGF5VGV4dCddID09IFwib3BlbnVybGZ1bGx0ZXh0XCIpIHtcblx0ICAgICAgY29uc29sZS5sb2cob2JqKTtcblx0ICAgICAgY29uc29sZS5sb2cob2JqWydsaW5rJ10pO1xuICAgICAgICAgIHZhciBvcGVudXJsID0gb2JqWydsaW5rJ107XG4gICAgICAgICAgdmFyIG9wZW51cmxTdmMgPSBvcGVudXJsLnJlcGxhY2UoXCJodHRwOi8vYWNjZWRlci5idS51bml2LXJlbm5lczIuZnIvc2Z4XzMzcHVlZGJcIixcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvZ2V0U2Z4LnBocFwiKTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBzZnhob2xkaW5nc1NlcnZpY2UuZ2V0U2Z4RGF0YShvcGVudXJsU3ZjKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGhvbGRpbmdzID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIGlmIChob2xkaW5ncyA9PT0gbnVsbCkge1xuXHQgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4vLyBcdCAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJtLXZpZXctb25saW5lIGRpdiBhLmFycm93LWxpbmsubWQtcHJpbW9FeHBsb3JlLXRoZW1lJykpWzBdLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjsgXG5cdCAgICAgICAgICAkc2NvcGUuc2Z4bG9hZGluZyA9IGZhbHNlO1xuLy8gXHQgICAgICAgICAgY29uc29sZS5sb2coaG9sZGluZ3MpO1xuICAgICAgICAgICAgICAkc2NvcGUuc2Z4aG9sZGluZ3MgPSBob2xkaW5ncztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBcbiAgICAgIH0gXG4gICAgfTtcbiAgfSxcbiAgdGVtcGxhdGVVcmw6ICdjdXN0b20vMzNVRFIyX1ZVMS9odG1sL3BybVZpZXdPbmxpbmVBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgnc2Z4aG9sZGluZ3NTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIGdldFNmeERhdGE6IGZ1bmN0aW9uIGdldFNmeERhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcbiIsIi8vIERlZmluZSB0aGUgdmlldyBuYW1lIGhlcmUuXG5leHBvcnQgbGV0IHZpZXdOYW1lID0gXCIzM1VEUjJfVlUxXCI7IiwiLyoqXG4gKiBAbGljZW5zZSBBbmd1bGFydGljcyB2MC4xOS4yXG4gKiAoYykgMjAxMyBMdWlzIEZhcnphdGkgaHR0cDovL2x1aXNmYXJ6YXRpLmdpdGh1Yi5pby9hbmd1bGFydGljc1xuICogR29vZ2xlIFRhZyBNYW5hZ2VyIFBsdWdpbiBDb250cmlidXRlZCBieSBodHRwOi8vZ2l0aHViLmNvbS9kYW5yb3dlNDlcbiAqIExpY2Vuc2U6IE1JVFxuICovXG5cbihmdW5jdGlvbiAoYW5ndWxhcikge1xuICAndXNlIHN0cmljdCc7XG5cblxuICAvKipcbiAgICogQG5nZG9jIG92ZXJ2aWV3XG4gICAqIEBuYW1lIGFuZ3VsYXJ0aWNzLmdvb2dsZS5hbmFseXRpY3NcbiAgICogRW5hYmxlcyBhbmFseXRpY3Mgc3VwcG9ydCBmb3IgR29vZ2xlIFRhZyBNYW5hZ2VyIChodHRwOi8vZ29vZ2xlLmNvbS90YWdtYW5hZ2VyKVxuICAgKi9cblxuICBhbmd1bGFyLm1vZHVsZSgnYW5ndWxhcnRpY3MuZ29vZ2xlLnRhZ21hbmFnZXInLCBbJ2FuZ3VsYXJ0aWNzJ10pXG4gICAgLmNvbmZpZyhbJyRhbmFseXRpY3NQcm92aWRlcicsIGZ1bmN0aW9uICgkYW5hbHl0aWNzUHJvdmlkZXIpIHtcblxuICAgICAgJGFuYWx5dGljc1Byb3ZpZGVyLnNldHRpbmdzLmdhID0ge1xuICAgICAgICB1c2VySWQ6IG51bGxcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogU2VuZCBjb250ZW50IHZpZXdzIHRvIHRoZSBkYXRhTGF5ZXJcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBSZXF1aXJlZCAnY29udGVudCBuYW1lJyAoc3RyaW5nKSBkZXNjcmliZXMgdGhlIGNvbnRlbnQgbG9hZGVkXG4gICAgICAgKi9cblxuICAgICAgJGFuYWx5dGljc1Byb3ZpZGVyLnJlZ2lzdGVyUGFnZVRyYWNrKGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBkYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciB8fCBbXTtcbiAgICAgICAgZGF0YUxheWVyLnB1c2goe1xuICAgICAgICAgICdldmVudCc6ICdjb250ZW50LXZpZXcnLFxuICAgICAgICAgICdjb250ZW50LW5hbWUnOiBwYXRoLFxuICAgICAgICAgICd1c2VySWQnOiAkYW5hbHl0aWNzUHJvdmlkZXIuc2V0dGluZ3MuZ2EudXNlcklkXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8qKlxuICAgICAgICogU2VuZCBpbnRlcmFjdGlvbnMgdG8gdGhlIGRhdGFMYXllciwgaS5lLiBmb3IgZXZlbnQgdHJhY2tpbmcgaW4gR29vZ2xlIEFuYWx5dGljc1xuICAgICAgICogQG5hbWUgZXZlbnRUcmFja1xuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gUmVxdWlyZWQgJ2FjdGlvbicgKHN0cmluZykgYXNzb2NpYXRlZCB3aXRoIHRoZSBldmVudFxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHByb3BlcnRpZXMgQ29tcHJpc2VkIG9mIHRoZSBtYW5kYXRvcnkgZmllbGQgJ2NhdGVnb3J5JyAoc3RyaW5nKSBhbmQgb3B0aW9uYWwgIGZpZWxkcyAnbGFiZWwnIChzdHJpbmcpLCAndmFsdWUnIChpbnRlZ2VyKSBhbmQgJ25vbmludGVyYWN0aW9uJyAoYm9vbGVhbilcbiAgICAgICAqL1xuXG4gICAgICAkYW5hbHl0aWNzUHJvdmlkZXIucmVnaXN0ZXJFdmVudFRyYWNrKGZ1bmN0aW9uIChhY3Rpb24sIHByb3BlcnRpZXMpIHtcbiAgICAgICAgdmFyIGRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyIHx8IFtdO1xuICAgICAgICBwcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCB7fTtcbiAgICAgICAgZGF0YUxheWVyLnB1c2goe1xuICAgICAgICAgICdldmVudCc6IHByb3BlcnRpZXMuZXZlbnQgfHwgJ2ludGVyYWN0aW9uJyxcbiAgICAgICAgICAndGFyZ2V0JzogcHJvcGVydGllcy5jYXRlZ29yeSxcbiAgICAgICAgICAnYWN0aW9uJzogYWN0aW9uLFxuICAgICAgICAgICd0YXJnZXQtcHJvcGVydGllcyc6IHByb3BlcnRpZXMubGFiZWwsXG4gICAgICAgICAgJ3ZhbHVlJzogcHJvcGVydGllcy52YWx1ZSxcbiAgICAgICAgICAnaW50ZXJhY3Rpb24tdHlwZSc6IHByb3BlcnRpZXMubm9uaW50ZXJhY3Rpb24sXG4gICAgICAgICAgJ3VzZXJJZCc6ICRhbmFseXRpY3NQcm92aWRlci5zZXR0aW5ncy5nYS51c2VySWRcbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB1c2VySWQgZm9yIHVzZSB3aXRoIFVuaXZlcnNhbCBBbmFseXRpY3MgVXNlciBJRCBmZWF0dXJlXG4gICAgICAgKiBAbmFtZSBzZXRVc2VybmFtZVxuICAgICAgICogXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIFJlcXVpcmVkICd1c2VySWQnIHZhbHVlIChzdHJpbmcpIHVzZWQgdG8gaWRlbnRpZnkgdXNlciBjcm9zcy1kZXZpY2UgaW4gR29vZ2xlIEFuYWx5dGljc1xuICAgICAgICovXG5cbiAgICAgICRhbmFseXRpY3NQcm92aWRlci5yZWdpc3RlclNldFVzZXJuYW1lKGZ1bmN0aW9uICh1c2VySWQpIHtcbiAgICAgICAgJGFuYWx5dGljc1Byb3ZpZGVyLnNldHRpbmdzLmdhLnVzZXJJZCA9IHVzZXJJZDtcbiAgICAgIH0pO1xuXG4gICAgfV0pO1xuXG59KShhbmd1bGFyKTtcbiIsInJlcXVpcmUoJy4vYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyJyk7XG5tb2R1bGUuZXhwb3J0cyA9ICdhbmd1bGFydGljcy5nb29nbGUudGFnbWFuYWdlcic7XG4iLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJ0aWNzXG4gKiAoYykgMjAxMyBMdWlzIEZhcnphdGkgaHR0cDovL2FuZ3VsYXJ0aWNzLmdpdGh1Yi5pby9cbiAqIExpY2Vuc2U6IE1JVFxuICovXG4oZnVuY3Rpb24oYW5ndWxhciwgYW5hbHl0aWNzKSB7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFydGljcyA9IHdpbmRvdy5hbmd1bGFydGljcyB8fCAod2luZG93LmFuZ3VsYXJ0aWNzID0ge30pO1xuYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckNvdW50ID0gMDtcbmFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JBcGkgPSBmdW5jdGlvbiAob2JqZWN0TmFtZSwgZGVsYXksIGNvbnRhaW5zRmllbGQsIHJlZ2lzdGVyRm4sIG9uVGltZW91dCkge1xuICBpZiAoIW9uVGltZW91dCkgeyBhbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQ291bnQrKzsgfVxuICBpZiAoIXJlZ2lzdGVyRm4pIHsgcmVnaXN0ZXJGbiA9IGNvbnRhaW5zRmllbGQ7IGNvbnRhaW5zRmllbGQgPSB1bmRlZmluZWQ7IH1cbiAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwod2luZG93LCBvYmplY3ROYW1lKSB8fCAoY29udGFpbnNGaWVsZCAhPT0gdW5kZWZpbmVkICYmIHdpbmRvd1tvYmplY3ROYW1lXVtjb250YWluc0ZpZWxkXSA9PT0gdW5kZWZpbmVkKSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBhbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQXBpKG9iamVjdE5hbWUsIGRlbGF5LCBjb250YWluc0ZpZWxkLCByZWdpc3RlckZuLCB0cnVlKTsgfSwgZGVsYXkpO1xuICB9XG4gIGVsc2Uge1xuICAgIGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JDb3VudC0tO1xuICAgIHJlZ2lzdGVyRm4od2luZG93W29iamVjdE5hbWVdKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcbiAqIEBuYW1lIGFuZ3VsYXJ0aWNzXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCdhbmd1bGFydGljcycsIFtdKVxuLnByb3ZpZGVyKCckYW5hbHl0aWNzJywgJGFuYWx5dGljcylcbi5ydW4oWyckcm9vdFNjb3BlJywgJyR3aW5kb3cnLCAnJGFuYWx5dGljcycsICckaW5qZWN0b3InLCAkYW5hbHl0aWNzUnVuXSlcbi5kaXJlY3RpdmUoJ2FuYWx5dGljc09uJywgWyckYW5hbHl0aWNzJywgYW5hbHl0aWNzT25dKVxuLmNvbmZpZyhbJyRwcm92aWRlJywgZXhjZXB0aW9uVHJhY2tdKTtcblxuZnVuY3Rpb24gJGFuYWx5dGljcygpIHtcbiAgdmFyIHZtID0gdGhpcztcblxuICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgcGFnZVRyYWNraW5nOiB7XG4gICAgICBhdXRvVHJhY2tGaXJzdFBhZ2U6IHRydWUsXG4gICAgICBhdXRvVHJhY2tWaXJ0dWFsUGFnZXM6IHRydWUsXG4gICAgICB0cmFja1JlbGF0aXZlUGF0aDogZmFsc2UsXG4gICAgICB0cmFja1JvdXRlczogdHJ1ZSxcbiAgICAgIHRyYWNrU3RhdGVzOiB0cnVlLFxuICAgICAgYXV0b0Jhc2VQYXRoOiBmYWxzZSxcbiAgICAgIGJhc2VQYXRoOiAnJyxcbiAgICAgIGV4Y2x1ZGVkUm91dGVzOiBbXSxcbiAgICAgIHF1ZXJ5S2V5c1doaXRlbGlzdGVkOiBbXSxcbiAgICAgIHF1ZXJ5S2V5c0JsYWNrbGlzdGVkOiBbXSxcbiAgICAgIGZpbHRlclVybFNlZ21lbnRzOiBbXVxuICAgIH0sXG4gICAgZXZlbnRUcmFja2luZzoge30sXG4gICAgYnVmZmVyRmx1c2hEZWxheTogMTAwMCwgLy8gU3VwcG9ydCBvbmx5IG9uZSBjb25maWd1cmF0aW9uIGZvciBidWZmZXIgZmx1c2ggZGVsYXkgdG8gc2ltcGxpZnkgYnVmZmVyaW5nXG4gICAgdHJhY2tFeGNlcHRpb25zOiBmYWxzZSxcbiAgICBvcHRPdXQ6IGZhbHNlLFxuICAgIGRldmVsb3Blck1vZGU6IGZhbHNlIC8vIFByZXZlbnQgc2VuZGluZyBkYXRhIGluIGxvY2FsL2RldmVsb3BtZW50IGVudmlyb25tZW50XG4gIH07XG5cbiAgLy8gTGlzdCBvZiBrbm93biBoYW5kbGVycyB0aGF0IHBsdWdpbnMgY2FuIHJlZ2lzdGVyIHRoZW1zZWx2ZXMgZm9yXG4gIHZhciBrbm93bkhhbmRsZXJzID0gW1xuICAgICdwYWdlVHJhY2snLFxuICAgICdldmVudFRyYWNrJyxcbiAgICAnZXhjZXB0aW9uVHJhY2snLFxuICAgICd0cmFuc2FjdGlvblRyYWNrJyxcbiAgICAnc2V0QWxpYXMnLFxuICAgICdzZXRVc2VybmFtZScsXG4gICAgJ3NldFVzZXJQcm9wZXJ0aWVzJyxcbiAgICAnc2V0VXNlclByb3BlcnRpZXNPbmNlJyxcbiAgICAnc2V0U3VwZXJQcm9wZXJ0aWVzJyxcbiAgICAnc2V0U3VwZXJQcm9wZXJ0aWVzT25jZScsXG4gICAgJ2luY3JlbWVudFByb3BlcnR5JyxcbiAgICAndXNlclRpbWluZ3MnLFxuICAgICdjbGVhckNvb2tpZXMnXG4gIF07XG4gIC8vIENhY2hlIGFuZCBoYW5kbGVyIHByb3BlcnRpZXMgd2lsbCBtYXRjaCB2YWx1ZXMgaW4gJ2tub3duSGFuZGxlcnMnIGFzIHRoZSBidWZmZXJpbmcgZnVuY3RvbnMgYXJlIGluc3RhbGxlZC5cbiAgdmFyIGNhY2hlID0ge307XG4gIHZhciBoYW5kbGVycyA9IHt9O1xuICB2YXIgaGFuZGxlck9wdGlvbnMgPSB7fTtcblxuICAvLyBHZW5lcmFsIGJ1ZmZlcmluZyBoYW5kbGVyXG4gIGZ1bmN0aW9uIGJ1ZmZlcmVkSGFuZGxlcihoYW5kbGVyTmFtZSl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICBpZihhbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQ291bnQpe1xuICAgICAgICBpZighY2FjaGVbaGFuZGxlck5hbWVdKXsgY2FjaGVbaGFuZGxlck5hbWVdID0gW107IH1cbiAgICAgICAgY2FjaGVbaGFuZGxlck5hbWVdLnB1c2goYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQXMgaGFuZGxlcnMgYXJlIGluc3RhbGxlZCBieSBwbHVnaW5zLCB0aGV5IGdldCBwdXNoZWQgaW50byBhIGxpc3QgYW5kIGludm9rZWQgaW4gb3JkZXIuXG4gIGZ1bmN0aW9uIHVwZGF0ZUhhbmRsZXJzKGhhbmRsZXJOYW1lLCBmbiwgb3B0aW9ucyl7XG4gICAgaWYoIWhhbmRsZXJzW2hhbmRsZXJOYW1lXSl7XG4gICAgICBoYW5kbGVyc1toYW5kbGVyTmFtZV0gPSBbXTtcbiAgICB9XG4gICAgaGFuZGxlcnNbaGFuZGxlck5hbWVdLnB1c2goZm4pO1xuICAgIGhhbmRsZXJPcHRpb25zW2ZuXSA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICBpZighdGhpcy5zZXR0aW5ncy5vcHRPdXQpIHtcbiAgICAgICAgdmFyIGhhbmRsZXJBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiB0aGlzLiRpbmplY3QoWyckcScsIGFuZ3VsYXIuYmluZCh0aGlzLCBmdW5jdGlvbigkcSkge1xuICAgICAgICAgIHJldHVybiAkcS5hbGwoaGFuZGxlcnNbaGFuZGxlck5hbWVdLm1hcChmdW5jdGlvbihoYW5kbGVyRm4pIHtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gaGFuZGxlck9wdGlvbnNbaGFuZGxlckZuXSB8fCB7fTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFzeW5jKSB7XG4gICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50QXJncyA9IGFuZ3VsYXIuY29weShoYW5kbGVyQXJncyk7XG4gICAgICAgICAgICAgIGN1cnJlbnRBcmdzLnVuc2hpZnQoZGVmZXJyZWQucmVzb2x2ZSk7XG4gICAgICAgICAgICAgIGhhbmRsZXJGbi5hcHBseSh0aGlzLCBjdXJyZW50QXJncyk7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihoYW5kbGVyRm4uYXBwbHkodGhpcywgaGFuZGxlckFyZ3MpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIH0pXSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIFRoZSBhcGkgKHJldHVybmVkIGJ5IHRoaXMgcHJvdmlkZXIpIGdldHMgcG9wdWxhdGVkIHdpdGggaGFuZGxlcnMgYmVsb3cuXG4gIHZhciBhcGkgPSB7XG4gICAgc2V0dGluZ3M6IHNldHRpbmdzXG4gIH07XG5cbiAgLy8gT3B0IGluIGFuZCBvcHQgb3V0IGZ1bmN0aW9uc1xuICBhcGkuc2V0T3B0T3V0ID0gZnVuY3Rpb24ob3B0T3V0KSB7XG4gICAgdGhpcy5zZXR0aW5ncy5vcHRPdXQgPSBvcHRPdXQ7XG4gICAgdHJpZ2dlclJlZ2lzdGVyKCk7XG4gIH07XG5cbiAgYXBpLmdldE9wdE91dCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNldHRpbmdzLm9wdE91dDtcbiAgfTtcblxuXG4gIC8vIFdpbGwgcnVuIHNldFRpbWVvdXQgaWYgZGVsYXkgaXMgPiAwXG4gIC8vIFJ1bnMgaW1tZWRpYXRlbHkgaWYgbm8gZGVsYXkgdG8gbWFrZSBzdXJlIGNhY2hlL2J1ZmZlciBpcyBmbHVzaGVkIGJlZm9yZSBhbnl0aGluZyBlbHNlLlxuICAvLyBQbHVnaW5zIHNob3VsZCB0YWtlIGNhcmUgdG8gcmVnaXN0ZXIgaGFuZGxlcnMgYnkgb3JkZXIgb2YgcHJlY2VkZW5jZS5cbiAgZnVuY3Rpb24gb25UaW1lb3V0KGZuLCBkZWxheSl7XG4gICAgaWYoZGVsYXkpe1xuICAgICAgc2V0VGltZW91dChmbiwgZGVsYXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbigpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm92aWRlciA9IHtcbiAgICAkZ2V0OiBbJyRpbmplY3RvcicsIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgICAgcmV0dXJuIGFwaVdpdGhJbmplY3RvcigkaW5qZWN0b3IpO1xuICAgIH1dLFxuICAgIGFwaTogYXBpLFxuICAgIHNldHRpbmdzOiBzZXR0aW5ncyxcbiAgICB2aXJ0dWFsUGFnZXZpZXdzOiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b1RyYWNrVmlydHVhbFBhZ2VzID0gdmFsdWU7IH0sXG4gICAgdHJhY2tTdGF0ZXM6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1N0YXRlcyA9IHZhbHVlOyB9LFxuICAgIHRyYWNrUm91dGVzOiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tSb3V0ZXMgPSB2YWx1ZTsgfSxcbiAgICBleGNsdWRlUm91dGVzOiBmdW5jdGlvbihyb3V0ZXMpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuZXhjbHVkZWRSb3V0ZXMgPSByb3V0ZXM7IH0sXG4gICAgcXVlcnlLZXlzV2hpdGVsaXN0OiBmdW5jdGlvbihrZXlzKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLnF1ZXJ5S2V5c1doaXRlbGlzdGVkID0ga2V5czsgfSxcbiAgICBxdWVyeUtleXNCbGFja2xpc3Q6IGZ1bmN0aW9uKGtleXMpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcucXVlcnlLZXlzQmxhY2tsaXN0ZWQgPSBrZXlzOyB9LFxuICAgIGZpbHRlclVybFNlZ21lbnRzOiBmdW5jdGlvbihmaWx0ZXJzKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmZpbHRlclVybFNlZ21lbnRzID0gZmlsdGVyczsgfSxcbiAgICBmaXJzdFBhZ2V2aWV3OiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b1RyYWNrRmlyc3RQYWdlID0gdmFsdWU7IH0sXG4gICAgd2l0aEJhc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggPSAodmFsdWUpID8gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5maW5kKCdiYXNlJykuYXR0cignaHJlZicpIDogJyc7XG4gICAgfSxcbiAgICB3aXRoQXV0b0Jhc2U6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvQmFzZVBhdGggPSB2YWx1ZTsgfSxcbiAgICB0cmFja0V4Y2VwdGlvbnM6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnRyYWNrRXhjZXB0aW9ucyA9IHZhbHVlOyB9LFxuICAgIGRldmVsb3Blck1vZGU6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MuZGV2ZWxvcGVyTW9kZSA9IHZhbHVlOyB9XG4gIH07XG5cbiAgLy8gR2VuZXJhbCBmdW5jdGlvbiB0byByZWdpc3RlciBwbHVnaW4gaGFuZGxlcnMuIEZsdXNoZXMgYnVmZmVycyBpbW1lZGlhdGVseSB1cG9uIHJlZ2lzdHJhdGlvbiBhY2NvcmRpbmcgdG8gdGhlIHNwZWNpZmllZCBkZWxheS5cbiAgZnVuY3Rpb24gcmVnaXN0ZXIoaGFuZGxlck5hbWUsIGZuLCBvcHRpb25zKXtcbiAgICAvLyBEbyBub3QgYWRkIGEgaGFuZGxlciBpZiBkZXZlbG9wZXJNb2RlIGlzIHRydWVcbiAgICBpZiAoc2V0dGluZ3MuZGV2ZWxvcGVyTW9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGFwaVtoYW5kbGVyTmFtZV0gPSB1cGRhdGVIYW5kbGVycyhoYW5kbGVyTmFtZSwgZm4sIG9wdGlvbnMpO1xuICAgIHZhciBoYW5kbGVyU2V0dGluZ3MgPSBzZXR0aW5nc1toYW5kbGVyTmFtZV07XG4gICAgdmFyIGhhbmRsZXJEZWxheSA9IChoYW5kbGVyU2V0dGluZ3MpID8gaGFuZGxlclNldHRpbmdzLmJ1ZmZlckZsdXNoRGVsYXkgOiBudWxsO1xuICAgIHZhciBkZWxheSA9IChoYW5kbGVyRGVsYXkgIT09IG51bGwpID8gaGFuZGxlckRlbGF5IDogc2V0dGluZ3MuYnVmZmVyRmx1c2hEZWxheTtcbiAgICBhbmd1bGFyLmZvckVhY2goY2FjaGVbaGFuZGxlck5hbWVdLCBmdW5jdGlvbiAoYXJncywgaW5kZXgpIHtcbiAgICAgIG9uVGltZW91dChmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KHRoaXMsIGFyZ3MpOyB9LCBpbmRleCAqIGRlbGF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhcGl0YWxpemUoaW5wdXQpIHtcbiAgICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC9eLi8sIGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgIHJldHVybiBtYXRjaC50b1VwcGVyQ2FzZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICAvL3Byb3ZpZGUgYSBtZXRob2QgdG8gaW5qZWN0IHNlcnZpY2VzIGludG8gaGFuZGxlcnNcbiAgdmFyIGFwaVdpdGhJbmplY3RvciA9IGZ1bmN0aW9uKGluamVjdG9yKSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIuZXh0ZW5kKGFwaSwge1xuICAgICAgJyRpbmplY3QnOiBpbmplY3Rvci5pbnZva2VcbiAgICB9KTtcbiAgfTtcblxuICAvLyBBZGRzIHRvIHRoZSBwcm92aWRlciBhICdyZWdpc3RlciN7aGFuZGxlck5hbWV9JyBmdW5jdGlvbiB0aGF0IG1hbmFnZXMgbXVsdGlwbGUgcGx1Z2lucyBhbmQgYnVmZmVyIGZsdXNoaW5nLlxuICBmdW5jdGlvbiBpbnN0YWxsSGFuZGxlclJlZ2lzdGVyRnVuY3Rpb24oaGFuZGxlck5hbWUpe1xuICAgIHZhciByZWdpc3Rlck5hbWUgPSAncmVnaXN0ZXInK2NhcGl0YWxpemUoaGFuZGxlck5hbWUpO1xuICAgIHByb3ZpZGVyW3JlZ2lzdGVyTmFtZV0gPSBmdW5jdGlvbihmbiwgb3B0aW9ucyl7XG4gICAgICByZWdpc3RlcihoYW5kbGVyTmFtZSwgZm4sIG9wdGlvbnMpO1xuICAgIH07XG4gICAgYXBpW2hhbmRsZXJOYW1lXSA9IHVwZGF0ZUhhbmRsZXJzKGhhbmRsZXJOYW1lLCBidWZmZXJlZEhhbmRsZXIoaGFuZGxlck5hbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0UmVnaXN0ZXJpbmcoX3Byb3ZpZGVyLCBfa25vd25IYW5kbGVycywgX2luc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbikge1xuICAgIGFuZ3VsYXIuZm9yRWFjaChfa25vd25IYW5kbGVycywgX2luc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbik7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gX3Byb3ZpZGVyKSB7XG4gICAgICB2bVtrZXldID0gX3Byb3ZpZGVyW2tleV07XG4gICAgfVxuICB9XG5cbiAgLy8gQWxsb3cgJGFuZ3VsYXJ0aWNzIHRvIHRyaWdnZXIgdGhlIHJlZ2lzdGVyIHRvIHVwZGF0ZSBvcHQgaW4vb3V0XG4gIHZhciB0cmlnZ2VyUmVnaXN0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBzdGFydFJlZ2lzdGVyaW5nKHByb3ZpZGVyLCBrbm93bkhhbmRsZXJzLCBpbnN0YWxsSGFuZGxlclJlZ2lzdGVyRnVuY3Rpb24pO1xuICB9O1xuXG4gIC8vIEluaXRpYWwgcmVnaXN0ZXJcbiAgc3RhcnRSZWdpc3RlcmluZyhwcm92aWRlciwga25vd25IYW5kbGVycywgaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKTtcblxufVxuXG5mdW5jdGlvbiAkYW5hbHl0aWNzUnVuKCRyb290U2NvcGUsICR3aW5kb3csICRhbmFseXRpY3MsICRpbmplY3Rvcikge1xuXG4gIGZ1bmN0aW9uIG1hdGNoZXNFeGNsdWRlZFJvdXRlKHVybCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuZXhjbHVkZWRSb3V0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBleGNsdWRlZFJvdXRlID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuZXhjbHVkZWRSb3V0ZXNbaV07XG4gICAgICBpZiAoKGV4Y2x1ZGVkUm91dGUgaW5zdGFuY2VvZiBSZWdFeHAgJiYgZXhjbHVkZWRSb3V0ZS50ZXN0KHVybCkpIHx8IHVybC5pbmRleE9mKGV4Y2x1ZGVkUm91dGUpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5RGlmZmVyZW5jZShhMSwgYTIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhMS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGEyLmluZGV4T2YoYTFbaV0pID09PSAtMSkge1xuICAgICAgICByZXN1bHQucHVzaChhMVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBmaWx0ZXJRdWVyeVN0cmluZyh1cmwsIGtleXNNYXRjaEFyciwgdGhpc1R5cGUpe1xuICAgIGlmICgvXFw/Ly50ZXN0KHVybCkgJiYga2V5c01hdGNoQXJyLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB1cmxBcnIgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICAgIHZhciB1cmxCYXNlID0gdXJsQXJyWzBdO1xuICAgICAgdmFyIHBhaXJzID0gdXJsQXJyWzFdLnNwbGl0KCcmJyk7XG4gICAgICB2YXIgbWF0Y2hlZFBhaXJzID0gW107XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5c01hdGNoQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBsaXN0ZWRLZXkgPSBrZXlzTWF0Y2hBcnJbaV07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgcGFpcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoKGxpc3RlZEtleSBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBsaXN0ZWRLZXkudGVzdChwYWlyc1tqXSkpIHx8IHBhaXJzW2pdLmluZGV4T2YobGlzdGVkS2V5KSA+IC0xKSBtYXRjaGVkUGFpcnMucHVzaChwYWlyc1tqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIG1hdGNoZWRQYWlyc0FyciA9ICh0aGlzVHlwZSA9PSAnd2hpdGUnID8gbWF0Y2hlZFBhaXJzIDogYXJyYXlEaWZmZXJlbmNlKHBhaXJzLG1hdGNoZWRQYWlycykpO1xuICAgICAgaWYobWF0Y2hlZFBhaXJzQXJyLmxlbmd0aCA+IDApe1xuICAgICAgICByZXR1cm4gdXJsQmFzZSArICc/JyArIG1hdGNoZWRQYWlyc0Fyci5qb2luKCcmJyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmV0dXJuIHVybEJhc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gd2hpdGVsaXN0UXVlcnlTdHJpbmcodXJsKXtcbiAgICByZXR1cm4gZmlsdGVyUXVlcnlTdHJpbmcodXJsLCAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5xdWVyeUtleXNXaGl0ZWxpc3RlZCwgJ3doaXRlJyk7XG4gIH1cblxuICBmdW5jdGlvbiBibGFja2xpc3RRdWVyeVN0cmluZyh1cmwpe1xuICAgIHJldHVybiBmaWx0ZXJRdWVyeVN0cmluZyh1cmwsICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnF1ZXJ5S2V5c0JsYWNrbGlzdGVkLCAnYmxhY2snKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbHRlclVybFNlZ21lbnRzKHVybCl7XG4gICAgdmFyIHNlZ21lbnRGaWx0ZXJzQXJyID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuZmlsdGVyVXJsU2VnbWVudHM7XG5cbiAgICBpZiAoc2VnbWVudEZpbHRlcnNBcnIubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHVybEFyciA9IHVybC5zcGxpdCgnPycpO1xuICAgICAgdmFyIHVybEJhc2UgPSB1cmxBcnJbMF07XG5cbiAgICAgIHZhciBzZWdtZW50cyA9IHVybEJhc2Uuc3BsaXQoJy8nKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWdtZW50RmlsdGVyc0Fyci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2VnbWVudEZpbHRlciA9IHNlZ21lbnRGaWx0ZXJzQXJyW2ldO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgc2VnbWVudHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAvKiBGaXJzdCBzZWdtZW50IHdpbGwgYmUgaG9zdC9wcm90b2NvbCBvciBiYXNlIHBhdGguICovXG4gICAgICAgICAgaWYgKChzZWdtZW50RmlsdGVyIGluc3RhbmNlb2YgUmVnRXhwICYmIHNlZ21lbnRGaWx0ZXIudGVzdChzZWdtZW50c1tqXSkpIHx8IHNlZ21lbnRzW2pdLmluZGV4T2Yoc2VnbWVudEZpbHRlcikgPiAtMSkge1xuICAgICAgICAgICAgc2VnbWVudHNbal0gPSAnRklMVEVSRUQnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VnbWVudHMuam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbikge1xuICAgIGlmICghbWF0Y2hlc0V4Y2x1ZGVkUm91dGUodXJsKSkge1xuICAgICAgdXJsID0gd2hpdGVsaXN0UXVlcnlTdHJpbmcodXJsKTtcbiAgICAgIHVybCA9IGJsYWNrbGlzdFF1ZXJ5U3RyaW5nKHVybCk7XG4gICAgICB1cmwgPSBmaWx0ZXJVcmxTZWdtZW50cyh1cmwpO1xuICAgICAgJGFuYWx5dGljcy5wYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvVHJhY2tGaXJzdFBhZ2UpIHtcbiAgICAvKiBPbmx5IHRyYWNrIHRoZSAnZmlyc3QgcGFnZScgaWYgdGhlcmUgYXJlIG5vIHJvdXRlcyBvciBzdGF0ZXMgb24gdGhlIHBhZ2UgKi9cbiAgICB2YXIgbm9Sb3V0ZXNPclN0YXRlcyA9IHRydWU7XG4gICAgaWYgKCRpbmplY3Rvci5oYXMoJyRyb3V0ZScpKSB7XG4gICAgICAgdmFyICRyb3V0ZSA9ICRpbmplY3Rvci5nZXQoJyRyb3V0ZScpO1xuICAgICAgIGlmICgkcm91dGUpIHtcbiAgICAgICAgZm9yICh2YXIgcm91dGUgaW4gJHJvdXRlLnJvdXRlcykge1xuICAgICAgICAgIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgIH0gZWxzZSBpZiAoJHJvdXRlID09PSBudWxsKXtcbiAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCRpbmplY3Rvci5oYXMoJyRzdGF0ZScpKSB7XG4gICAgICB2YXIgJHN0YXRlID0gJGluamVjdG9yLmdldCgnJHN0YXRlJyk7XG4gICAgICBpZiAoJHN0YXRlLmdldCgpLmxlbmd0aCA+IDEpIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG5vUm91dGVzT3JTdGF0ZXMpIHtcbiAgICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvQmFzZVBhdGgpIHtcbiAgICAgICAgJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggPSAkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuICAgICAgfVxuICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrUmVsYXRpdmVQYXRoKSB7XG4gICAgICAgICAgdmFyIHVybCA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoICsgJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFnZVRyYWNrKCRsb2NhdGlvbi5hYnNVcmwoKSwgJGxvY2F0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfV0pO1xuICAgIH1cbiAgfVxuXG4gIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvVHJhY2tWaXJ0dWFsUGFnZXMpIHtcbiAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b0Jhc2VQYXRoKSB7XG4gICAgICAvKiBBZGQgdGhlIGZ1bGwgcm91dGUgdG8gdGhlIGJhc2UuICovXG4gICAgICAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCA9ICR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyBcIiNcIjtcbiAgICB9XG4gICAgdmFyIG5vUm91dGVzT3JTdGF0ZXMgPSB0cnVlO1xuXG4gICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrUm91dGVzKSB7XG4gICAgICBpZiAoJGluamVjdG9yLmhhcygnJHJvdXRlJykpIHtcbiAgICAgICAgdmFyICRyb3V0ZSA9ICRpbmplY3Rvci5nZXQoJyRyb3V0ZScpO1xuICAgICAgICBpZiAoJHJvdXRlKSB7XG4gICAgICAgICAgZm9yICh2YXIgcm91dGUgaW4gJHJvdXRlLnJvdXRlcykge1xuICAgICAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCRyb3V0ZSA9PT0gbnVsbCl7XG4gICAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKGV2ZW50LCBjdXJyZW50KSB7XG4gICAgICAgICAgaWYgKGN1cnJlbnQgJiYgKGN1cnJlbnQuJCRyb3V0ZXx8Y3VycmVudCkucmVkaXJlY3RUbykgcmV0dXJuO1xuICAgICAgICAgICRpbmplY3Rvci5pbnZva2UoWyckbG9jYXRpb24nLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgICBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgICAgICAgIH1dKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrU3RhdGVzKSB7XG4gICAgICBpZiAoJGluamVjdG9yLmhhcygnJHN0YXRlJykgJiYgISRpbmplY3Rvci5oYXMoJyR0cmFuc2l0aW9ucycpKSB7XG4gICAgICAgIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJlbnQpIHtcbiAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICAgICAgdmFyIHVybCA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoICsgJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgICB9XSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJyRzdGF0ZScpICYmICRpbmplY3Rvci5oYXMoJyR0cmFuc2l0aW9ucycpKSB7XG4gICAgICAgIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICAgICAgJGluamVjdG9yLmludm9rZShbJyR0cmFuc2l0aW9ucycsIGZ1bmN0aW9uKCR0cmFuc2l0aW9ucykge1xuICAgICAgICAgICR0cmFuc2l0aW9ucy5vblN1Y2Nlc3Moe30sIGZ1bmN0aW9uKCR0cmFuc2l0aW9uJCkge1xuICAgICAgICAgICAgdmFyIHRyYW5zaXRpb25PcHRpb25zID0gJHRyYW5zaXRpb24kLm9wdGlvbnMoKTtcblxuICAgICAgICAgICAgLy8gb25seSB0cmFjayBmb3IgdHJhbnNpdGlvbnMgdGhhdCB3b3VsZCBoYXZlIHRyaWdnZXJlZCAkc3RhdGVDaGFuZ2VTdWNjZXNzXG4gICAgICAgICAgICBpZiAodHJhbnNpdGlvbk9wdGlvbnMubm90aWZ5KSB7XG4gICAgICAgICAgICAgICRpbmplY3Rvci5pbnZva2UoWyckbG9jYXRpb24nLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVybCA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoICsgJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgICAgICAgIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChub1JvdXRlc09yU3RhdGVzKSB7XG4gICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uIChldmVudCwgY3VycmVudCkge1xuICAgICAgICBpZiAoY3VycmVudCAmJiAoY3VycmVudC4kJHJvdXRlIHx8IGN1cnJlbnQpLnJlZGlyZWN0VG8pIHJldHVybjtcbiAgICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tSZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCArICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICAgIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhZ2VUcmFjaygkbG9jYXRpb24uYWJzVXJsKCksICRsb2NhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MuZGV2ZWxvcGVyTW9kZSkge1xuICAgIGFuZ3VsYXIuZm9yRWFjaCgkYW5hbHl0aWNzLCBmdW5jdGlvbihhdHRyLCBuYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgJGFuYWx5dGljc1tuYW1lXSA9IGZ1bmN0aW9uKCl7fTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhbmFseXRpY3NPbigkYW5hbHl0aWNzKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzKSB7XG4gICAgICB2YXIgZXZlbnRUeXBlID0gJGF0dHJzLmFuYWx5dGljc09uIHx8ICdjbGljayc7XG4gICAgICB2YXIgdHJhY2tpbmdEYXRhID0ge307XG5cbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkYXR0cnMuJGF0dHIsIGZ1bmN0aW9uKGF0dHIsIG5hbWUpIHtcbiAgICAgICAgaWYgKGlzUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICB0cmFja2luZ0RhdGFbcHJvcGVydHlOYW1lKG5hbWUpXSA9ICRhdHRyc1tuYW1lXTtcbiAgICAgICAgICAkYXR0cnMuJG9ic2VydmUobmFtZSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgdHJhY2tpbmdEYXRhW3Byb3BlcnR5TmFtZShuYW1lKV0gPSB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGFuZ3VsYXIuZWxlbWVudCgkZWxlbWVudFswXSkub24oZXZlbnRUeXBlLCBmdW5jdGlvbiAoJGV2ZW50KSB7XG4gICAgICAgIHZhciBldmVudE5hbWUgPSAkYXR0cnMuYW5hbHl0aWNzRXZlbnQgfHwgaW5mZXJFdmVudE5hbWUoJGVsZW1lbnRbMF0pO1xuICAgICAgICB0cmFja2luZ0RhdGEuZXZlbnRUeXBlID0gJGV2ZW50LnR5cGU7XG5cbiAgICAgICAgaWYoJGF0dHJzLmFuYWx5dGljc0lmKXtcbiAgICAgICAgICBpZighICRzY29wZS4kZXZhbCgkYXR0cnMuYW5hbHl0aWNzSWYpKXtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQ2FuY2VsIHRoaXMgZXZlbnQgaWYgd2UgZG9uJ3QgcGFzcyB0aGUgYW5hbHl0aWNzLWlmIGNvbmRpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBbGxvdyBjb21wb25lbnRzIHRvIHBhc3MgdGhyb3VnaCBhbiBleHByZXNzaW9uIHRoYXQgZ2V0cyBtZXJnZWQgb24gdG8gdGhlIGV2ZW50IHByb3BlcnRpZXNcbiAgICAgICAgLy8gZWcuIGFuYWx5dGljcy1wcm9wZXJpdGVzPSdteUNvbXBvbmVudFNjb3BlLnNvbWVDb25maWdFeHByZXNzaW9uLiRhbmFseXRpY3NQcm9wZXJ0aWVzJ1xuICAgICAgICBpZigkYXR0cnMuYW5hbHl0aWNzUHJvcGVydGllcyl7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodHJhY2tpbmdEYXRhLCAkc2NvcGUuJGV2YWwoJGF0dHJzLmFuYWx5dGljc1Byb3BlcnRpZXMpKTtcbiAgICAgICAgfVxuICAgICAgICAkYW5hbHl0aWNzLmV2ZW50VHJhY2soZXZlbnROYW1lLCB0cmFja2luZ0RhdGEpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBleGNlcHRpb25UcmFjaygkcHJvdmlkZSkge1xuICAkcHJvdmlkZS5kZWNvcmF0b3IoJyRleGNlcHRpb25IYW5kbGVyJywgWyckZGVsZWdhdGUnLCAnJGluamVjdG9yJywgZnVuY3Rpb24gKCRkZWxlZ2F0ZSwgJGluamVjdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlcnJvciwgY2F1c2UpIHtcbiAgICAgIHZhciByZXN1bHQgPSAkZGVsZWdhdGUoZXJyb3IsIGNhdXNlKTtcbiAgICAgIHZhciAkYW5hbHl0aWNzID0gJGluamVjdG9yLmdldCgnJGFuYWx5dGljcycpO1xuICAgICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MudHJhY2tFeGNlcHRpb25zKSB7XG4gICAgICAgICRhbmFseXRpY3MuZXhjZXB0aW9uVHJhY2soZXJyb3IsIGNhdXNlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfV0pO1xufVxuXG5mdW5jdGlvbiBpc0NvbW1hbmQoZWxlbWVudCkge1xuICByZXR1cm4gWydhOicsJ2J1dHRvbjonLCdidXR0b246YnV0dG9uJywnYnV0dG9uOnN1Ym1pdCcsJ2lucHV0OmJ1dHRvbicsJ2lucHV0OnN1Ym1pdCddLmluZGV4T2YoXG4gICAgZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkrJzonKyhlbGVtZW50LnR5cGV8fCcnKSkgPj0gMDtcbn1cblxuZnVuY3Rpb24gaW5mZXJFdmVudFR5cGUoZWxlbWVudCkge1xuICBpZiAoaXNDb21tYW5kKGVsZW1lbnQpKSByZXR1cm4gJ2NsaWNrJztcbiAgcmV0dXJuICdjbGljayc7XG59XG5cbmZ1bmN0aW9uIGluZmVyRXZlbnROYW1lKGVsZW1lbnQpIHtcbiAgaWYgKGlzQ29tbWFuZChlbGVtZW50KSkgcmV0dXJuIGVsZW1lbnQuaW5uZXJUZXh0IHx8IGVsZW1lbnQudmFsdWU7XG4gIHJldHVybiBlbGVtZW50LmlkIHx8IGVsZW1lbnQubmFtZSB8fCBlbGVtZW50LnRhZ05hbWU7XG59XG5cbmZ1bmN0aW9uIGlzUHJvcGVydHkobmFtZSkge1xuICByZXR1cm4gbmFtZS5zdWJzdHIoMCwgOSkgPT09ICdhbmFseXRpY3MnICYmIFsnT24nLCAnRXZlbnQnLCAnSWYnLCAnUHJvcGVydGllcycsICdFdmVudFR5cGUnXS5pbmRleE9mKG5hbWUuc3Vic3RyKDkpKSA9PT0gLTE7XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5TmFtZShuYW1lKSB7XG4gIHZhciBzID0gbmFtZS5zbGljZSg5KTsgLy8gc2xpY2Ugb2ZmIHRoZSAnYW5hbHl0aWNzJyBwcmVmaXhcbiAgaWYgKHR5cGVvZiBzICE9PSAndW5kZWZpbmVkJyAmJiBzIT09bnVsbCAmJiBzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcy5zdWJzdHJpbmcoMCwgMSkudG9Mb3dlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG59KShhbmd1bGFyKTtcbiIsInJlcXVpcmUoJy4vYW5ndWxhcnRpY3MnKTtcbm1vZHVsZS5leHBvcnRzID0gJ2FuZ3VsYXJ0aWNzJztcbiIsInJlcXVpcmUoJy4vanMvZ29vZ2xlQW5hbHl0aWNzLm1vZHVsZS5qcycpO1xubW9kdWxlLmV4cG9ydHMgPSAnZ29vZ2xlQW5hbHl0aWNzJztcbiIsImltcG9ydCBcImFuZ3VsYXJ0aWNzXCI7XG5pbXBvcnQgXCJhbmd1bGFydGljcy1nb29nbGUtdGFnLW1hbmFnZXJcIjtcblxuYW5ndWxhci5tb2R1bGUoJ2dvb2dsZUFuYWx5dGljcycsIFtcImFuZ3VsYXJ0aWNzXCIsIFwiYW5ndWxhcnRpY3MuZ29vZ2xlLnRhZ21hbmFnZXJcIl0pXG4gIC5mYWN0b3J5KCdnYUluamVjdGlvblNlcnZpY2UnLCBbJ2dvb2dsZUFuYWx5dGljc0NvbmZpZycsIGZ1bmN0aW9uKGdvb2dsZUFuYWx5dGljc0NvbmZpZykge1xuICAgIGNvbnN0IGRlZmF1bHRDb2RlID0gYHdpbmRvdy5kYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZ3RhZygpe2RhdGFMYXllci5wdXNoKGFyZ3VtZW50cyk7fVxuICAgICAgICAgICAgICAgICAgICAgICAgZ3RhZygnanMnLCBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGd0YWcoJ2NvbmZpZycsICcke2dvb2dsZUFuYWx5dGljc0NvbmZpZy50cmFja2luZ0lkfScpO2A7XG4gICAgY29uc3QgX2lubGluZUNvZGUgPSBnb29nbGVBbmFseXRpY3NDb25maWcuaW5saW5lU2NyaXB0IHx8IGRlZmF1bHRDb2RlO1xuXG4gICAgY29uc3QgZGVmYXVsdFVSTCA9IGBodHRwczovL3d3dy5nb29nbGV0YWdtYW5hZ2VyLmNvbS9ndGFnL2pzP2lkPSR7Z29vZ2xlQW5hbHl0aWNzQ29uZmlnLnRyYWNraW5nSWR9YDtcbiAgICBsZXQgX2V4dGVybmFsU291cmNlO1xuXG4gICAgaWYgKGdvb2dsZUFuYWx5dGljc0NvbmZpZy5leHRlcm5hbFNjcmlwdFVSTCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBfZXh0ZXJuYWxTb3VyY2UgPSBkZWZhdWx0VVJMO1xuICAgIH0gZWxzZSB7XG4gICAgICBfZXh0ZXJuYWxTb3VyY2UgPSBnb29nbGVBbmFseXRpY3NDb25maWcuZXh0ZXJuYWxTY3JpcHRVUkw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICRnZXRFeHRlcm5hbFNvdXJjZTogX2V4dGVybmFsU291cmNlLFxuICAgICAgJGdldElubGluZUNvZGU6IF9pbmxpbmVDb2RlLFxuICAgICAgaW5qZWN0R0FDb2RlKCkge1xuICAgICAgICBpZiAoX2V4dGVybmFsU291cmNlICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgZXh0ZXJuYWxTY3JpcHRUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICBleHRlcm5hbFNjcmlwdFRhZy5zcmMgPSBfZXh0ZXJuYWxTb3VyY2U7XG4gICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChleHRlcm5hbFNjcmlwdFRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbmxpbmVTY3JpcHRUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgaW5saW5lU2NyaXB0VGFnLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcblxuICAgICAgICAvLyBNZXRob2RzIG9mIGFkZGluZyBpbm5lciB0ZXh0IHNvbWV0aW1lcyBkb2Vzbid0IHdvcmsgYWNyb3NzIGJyb3dzZXJzLlxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlubGluZVNjcmlwdFRhZy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShfaW5saW5lQ29kZSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaW5saW5lU2NyaXB0VGFnLnRleHQgPSBfaW5saW5lQ29kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoaW5saW5lU2NyaXB0VGFnKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG4iLCJyZXF1aXJlKCcuL2pzL29hZG9pLWxpbmsubW9kdWxlLmpzJylcbm1vZHVsZS5leHBvcnRzID0gJ29hZG9pJ1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdvYWRvaScsIFtdKVxuICAuY29tcG9uZW50KCdwcm1GdWxsVmlld1NlcnZpY2VDb250YWluZXJBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwgb2Fkb2lTZXJ2aWNlLCBvYWRvaU9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIFx0JHNjb3BlLm9hRGlzcGxheT1mYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgICAgICRzY29wZS5pbWFnZVBhdGg9b2Fkb2lPcHRpb25zLmltYWdlUGF0aDtcbiAgICAgICAgICB2YXIgZW1haWw9b2Fkb2lPcHRpb25zLmVtYWlsO1xuICAgICAgICBcdHZhciBzZWN0aW9uPSRzY29wZS4kcGFyZW50LiRjdHJsLnNlcnZpY2Uuc2Nyb2xsSWQ7XG4gICAgICAgIFx0dmFyIG9iaj0kc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5hZGRhdGE7XG5cbiAgICAgICAgXHRpZiAob2JqLmhhc093blByb3BlcnR5KFwiZG9pXCIpKXtcbiAgICAgICAgXHRcdHZhciBkb2k9b2JqLmRvaVswXTtcbiAgICAgICAgXHRcdGNvbnNvbGUubG9nKFwiZG9pOlwiK2RvaSlcblxuICAgIFx0XHRcdFx0aWYgKGRvaSAmJiBzZWN0aW9uPT1cImdldGl0X2xpbmsxXzBcIil7XG4gICAgXHRcdFx0XHRcdHZhciB1cmw9XCJodHRwczovL2FwaS5vYWRvaS5vcmcvdjIvXCIrZG9pK1wiP2VtYWlsPVwiK2VtYWlsO1xuXG4gICAgICAgICAgICAgIHZhciByZXNwb25zZT1vYWRvaVNlcnZpY2UuZ2V0T2FpRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQgd29ya2VkXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB2YXIgb2FsaW5rPXJlc3BvbnNlLmRhdGEuYmVzdF9vYV9sb2NhdGlvbi51cmw7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cob2FsaW5rKTtcbiAgICAgICAgICAgICAgICBpZihvYWxpbms9PT1udWxsKXtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5vYURpc3BsYXk9ZmFsc2U7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0J3MgZmFsc2VcIik7XG4gICAgICAgICAgICAgICAgICAkc2NvcGUub2FDbGFzcz1cIm5nLWhpZGVcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5vYWxpbms9b2FsaW5rO1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLm9hRGlzcGxheT10cnVlO1xuICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLm9hRGlzcGxheT1mYWxzZSAqL1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLm9hQ2xhc3M9XCJuZy1zaG93XCI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIH0pO1xuXG5cbiAgICBcdFx0XHRcdH1cbiAgICBcdFx0XHRcdGVsc2V7JHNjb3BlLm9hRGlzcGxheT1mYWxzZTtcbiAgICBcdFx0XHRcdH1cbiAgICAgICAgXHR9XG4gICAgICAgIFx0ZWxzZXtcbiAgICAgICAgXHRcdCRzY29wZS5vYUNsYXNzPVwibmctaGlkZVwiO1xuICAgICAgICBcdH1cbiAgICAgICAgfTtcblxuICAgIH0sXG4gIHRlbXBsYXRlOiAnPGRpdiBzdHlsZT1cImhlaWdodDo1MHB4O2JhY2tncm91bmQtY29sb3I6d2hpdGU7cGFkZGluZzoxNXB4O1wiIG5nLXNob3c9XCJ7e29hRGlzcGxheX19XCIgY2xhc3M9XCJ7e29hQ2xhc3N9fVwiPjxpbWcgc3JjPVwie3tpbWFnZVBhdGh9fVwiIHN0eWxlPVwiZmxvYXQ6bGVmdDtoZWlnaHQ6MjJweDt3aWR0aDoyMnB4O21hcmdpbi1yaWdodDoxMHB4XCI+PHAgPlRleHRlIGludMOpZ3JhbCBkaXNwb25pYmxlIGVuIDogPGEgaHJlZj1cInt7b2FsaW5rfX1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBzdHlsZT1cImZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MTVweDtjb2xvcjsjMmM4NWQ0O1wiPk9wZW4gQWNjZXNzPC9hPjwvcD48L2Rpdj4nXG59KS5mYWN0b3J5KCdvYWRvaVNlcnZpY2UnLCBbJyRodHRwJyxmdW5jdGlvbigkaHR0cCl7XG4gIHJldHVybntcbiAgICBnZXRPYWlEYXRhOiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XSkucnVuKFxuICAoJGh0dHApID0+IHtcbiAgICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfVxuICB9LFxuKTtcbiJdfQ==
