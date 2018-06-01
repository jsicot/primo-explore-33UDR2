(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var googleAnalyticsConfig = exports.googleAnalyticsConfig = Object.freeze({
  name: 'googleAnalyticsConfig',
  config: {
    trackingId: "UA-4789419-7"
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
							angular.element(document.querySelector('prm-opac > md-tabs'))[0].style.display = "none";
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

app.constant(_googleAnalyticsConfig.googleAnalyticsConfig.name, _googleAnalyticsConfig.googleAnalyticsConfig.config);

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

},{"./googleAnalyticsConfig":1,"./kohaAvailabilities.module":2,"./kohaItems.module":3,"./sfxHoldings.module":5,"./viewName":6,"primo-explore-google-analytics":11}],5:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2dvb2dsZUFuYWx5dGljc0NvbmZpZy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUF2YWlsYWJpbGl0aWVzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUl0ZW1zLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvbWFpbi5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvc2Z4SG9sZGluZ3MubW9kdWxlLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9qcy92aWV3TmFtZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzLWdvb2dsZS10YWctbWFuYWdlci9saWIvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyL2xpYi9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzL3NyYy9hbmd1bGFydGljcy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL2FuZ3VsYXJ0aWNzL3NyYy9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL3ByaW1vLWV4cGxvcmUtZ29vZ2xlLWFuYWx5dGljcy9zcmMvaW5kZXguanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL25vZGVfbW9kdWxlcy9wcmltby1leHBsb3JlLWdvb2dsZS1hbmFseXRpY3Mvc3JjL2pzL2dvb2dsZUFuYWx5dGljcy5tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FPLElBQU0sd0RBQXdCLE9BQU8sTUFBUCxDQUFjO0FBQ2pELFFBQU0sdUJBRDJDO0FBRWpELFVBQVE7QUFDTixnQkFBWTtBQUROO0FBRnlDLENBQWQsQ0FBOUI7Ozs7O0FDQVAsUUFBUSxNQUFSLENBQWUsb0JBQWYsRUFBcUMsRUFBckMsRUFBeUMsU0FBekMsQ0FBbUQscUJBQW5ELEVBQTBFO0FBQ3hFLFlBQVUsRUFBRSxZQUFZLEdBQWQsRUFEOEQ7QUFFeEUsY0FBWSxTQUFTLFVBQVQsQ0FBb0IsTUFBcEIsRUFBNEIsS0FBNUIsRUFBbUMsUUFBbkMsRUFBNkMsZ0JBQTdDLEVBQStEO0FBQ3pFLFNBQUssT0FBTCxHQUFlLFlBQVk7QUFDekIsYUFBTyxXQUFQLEdBQXFCLEtBQXJCLENBRHlCLENBQ0c7QUFDNUIsVUFBSSxNQUFNLE9BQU8sS0FBUCxDQUFhLFVBQWIsQ0FBd0IsSUFBeEIsQ0FBNkIsR0FBN0IsQ0FBaUMsT0FBM0M7QUFDQSxVQUFJLElBQUksY0FBSixDQUFtQixnQkFBbkIsS0FBd0MsSUFBSSxjQUFKLENBQW1CLFVBQW5CLENBQTVDLEVBQTRFO0FBQzFFLFlBQUksS0FBSyxJQUFJLGNBQUosQ0FBbUIsQ0FBbkIsQ0FBVDtBQUNBLFlBQUksU0FBUyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWI7QUFDQSxZQUFJLFdBQVcsSUFBSSxRQUFKLENBQWEsQ0FBYixDQUFmO0FBQ0EsWUFBSSxPQUFPLE9BQU8sS0FBUCxDQUFhLFVBQWIsQ0FBd0IsSUFBeEIsQ0FBNkIsR0FBN0IsQ0FBaUMsT0FBakMsQ0FBeUMsSUFBekMsQ0FBOEMsQ0FBOUMsQ0FBWDtBQUNSOzs7O0FBSVEsWUFBSSxNQUFNLFVBQVUsYUFBaEIsSUFBaUMsUUFBUSxTQUE3QyxFQUF3RDtBQUN0RCxjQUFJLE1BQU0sbUZBQW1GLEVBQTdGO0FBQ0EsY0FBSSxX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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGZBO0FBQ0E7QUFDQTs7OztBQ0ZBLFFBQVEsZ0NBQVI7QUFDQSxPQUFPLE9BQVAsR0FBaUIsaUJBQWpCOzs7OztBQ0RBOztBQUNBOztBQUVBLFFBQVEsTUFBUixDQUFlLGlCQUFmLEVBQWtDLENBQUMsYUFBRCxFQUFnQiwrQkFBaEIsQ0FBbEMsRUFDRyxPQURILENBQ1csb0JBRFgsRUFDaUMsQ0FBQyx1QkFBRCxFQUEwQixVQUFTLHFCQUFULEVBQWdDO0FBQ3ZGLE1BQU0sNk5BR2dDLHNCQUFzQixVQUh0RCxRQUFOO0FBSUEsTUFBTSxjQUFjLHNCQUFzQixZQUF0QixJQUFzQyxXQUExRDs7QUFFQSxNQUFNLDhEQUE0RCxzQkFBc0IsVUFBeEY7QUFDQSxNQUFJLHdCQUFKOztBQUVBLE1BQUksc0JBQXNCLGlCQUF0QixLQUE0QyxTQUFoRCxFQUEyRDtBQUN6RCxzQkFBa0IsVUFBbEI7QUFDRCxHQUZELE1BRU87QUFDTCxzQkFBa0Isc0JBQXNCLGlCQUF4QztBQUNEOztBQUVELFNBQU87QUFDTCx3QkFBb0IsZUFEZjtBQUVMLG9CQUFnQixXQUZYO0FBR0wsZ0JBSEssMEJBR1U7QUFDYixVQUFJLG9CQUFvQixJQUF4QixFQUE4QjtBQUM1QixZQUFNLG9CQUFvQixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBMUI7QUFDQSwwQkFBa0IsR0FBbEIsR0FBd0IsZUFBeEI7QUFDQSxpQkFBUyxJQUFULENBQWMsV0FBZCxDQUEwQixpQkFBMUI7QUFDRDs7QUFFRCxVQUFNLGtCQUFrQixTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBeEI7QUFDQSxzQkFBZ0IsSUFBaEIsR0FBdUIsaUJBQXZCOztBQUVBO0FBQ0EsVUFBSTtBQUNGLHdCQUFnQixXQUFoQixDQUE0QixTQUFTLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBNUI7QUFDRCxPQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVix3QkFBZ0IsSUFBaEIsR0FBdUIsV0FBdkI7QUFDRDs7QUFFRCxlQUFTLElBQVQsQ0FBYyxXQUFkLENBQTBCLGVBQTFCO0FBQ0Q7QUFyQkksR0FBUDtBQXVCRCxDQXZDOEIsQ0FEakMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJleHBvcnQgY29uc3QgZ29vZ2xlQW5hbHl0aWNzQ29uZmlnID0gT2JqZWN0LmZyZWV6ZSh7XG4gIG5hbWU6ICdnb29nbGVBbmFseXRpY3NDb25maWcnLFxuICBjb25maWc6IHtcbiAgICB0cmFja2luZ0lkOiBcIlVBLTQ3ODk0MTktN1wiLFxuICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgna29oYUF2YWlsYWJpbGl0aWVzJywgW10pLmNvbXBvbmVudCgncHJtQnJpZWZSZXN1bHRBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFhdmFpbFNlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwic291cmNlcmVjb3JkaWRcIikgJiYgb2JqLmhhc093blByb3BlcnR5KFwic291cmNlaWRcIikpIHtcbiAgICAgICAgdmFyIGJuID0gb2JqLnNvdXJjZXJlY29yZGlkWzBdO1xuICAgICAgICB2YXIgc291cmNlID0gb2JqLnNvdXJjZWlkWzBdO1xuICAgICAgICB2YXIgcmVjb3JkaWQgPSBvYmoucmVjb3JkaWRbMF07XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguZGlzcGxheS50eXBlWzBdO1xuLypcbiAgICAgICAgY29uc29sZS5sb2coXCJzb3VyY2U6XCIgKyBibik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmlibGlvbnVtYmVyOlwiICsgYm4pO1xuKi9cbiAgICAgICAgaWYgKGJuICYmIHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRJdGVtcy5waHA/YmlibGlvbnVtYmVyPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWF2YWlsU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdCAgICAgICAgIGlmKHJlc3BvbnNlKXtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCB3b3JrZWRcIik7XG5cdC8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0ICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YTtcblx0ICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbXMpO1xuXHQgICAgICAgICAgICB2YXIgYXZhaWxhYmlsaXR5ID0gaXRlbXMuYXZhaWxhYmxlO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhhdmFpbGFiaWxpdHkpO1xuXHQgICAgICAgICAgICBpZiAoYXZhaWxhYmlsaXR5ID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCdzIGZhbHNlXCIpO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IHRydWU7XG5cdCAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhcIm5nLWhpZGVcIik7IC8qIGluaXRpYWxseSBzZXQgYnkgJHNjb3BlLmtvaGFEaXNwbGF5PWZhbHNlICovXG5cdCAgICAgICAgICAgICAgJHNjb3BlLnN0YXR1cyA9IGl0ZW1zLnN0YXR1cztcblx0ICAgICAgICAgICAgICAkc2NvcGUucmVjb3JkaWQgPSByZWNvcmRpZDtcblx0ICAgICAgICAgICAgICAkc2NvcGUuYnJhbmNoID0gaXRlbXMuaG9tZWJyYW5jaDtcblx0ICAgICAgICAgICAgICAkc2NvcGUubG9jYXRpb24gPSBpdGVtcy5sb2NhdGlvbjtcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2xhc3MgPSBpdGVtcy5jbGFzcztcblx0ICAgICAgICAgICAgICAkc2NvcGUuY2FsbG51bWJlciA9IGl0ZW1zLml0ZW1jYWxsbnVtYmVyO1xuXHQgICAgICAgICAgICAgICRzY29wZS5vdGhlckxvY2F0aW9ucyA9IChpdGVtcy50b3RhbCAtIDEpO1xuXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtQnJpZWZSZXN1bHRBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgna29oYWF2YWlsU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiYW5ndWxhci5tb2R1bGUoJ2tvaGFJdGVtcycsIFtdKS5jb21wb25lbnQoJ3BybU9wYWNBZnRlcicsIHtcbiAgYmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFpdGVtc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUua29oYURpc3BsYXkgPSBmYWxzZTsgLyogZGVmYXVsdCBoaWRlcyB0ZW1wbGF0ZSAqL1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmNvbnRyb2w7XG4gICAgICB2YXIgb3BlbnVybDtcbiAgICAgICRzY29wZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwic291cmNlIDpcIitzb3VyY2UpO1xuICAgICAgICB2YXIgdHlwZSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ucG54LmRpc3BsYXkudHlwZVswXTtcbiAgICAgICAgaWYgKGJuICYmIChzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiIHx8ICFibi5zdGFydHNXaXRoKFwiZGVkdXBtcmdcIikpICYmIHR5cGUgIT0gXCJqb3VybmFsXCIpIHtcbiAgICAgICAgICB2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0U3J1LnBocD9pbmRleD1yZWMuaWQmcT1cIiArIGJuO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaXRlbTtcbiAgICAgICAgICAgIHZhciBrb2hhaWQgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5iaWJsaW9udW1iZXI7XG4gICAgICAgICAgICB2YXIgaW1hZ2VQYXRoID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uY292ZXI7XG4gICAgICAgICAgICBpZiAoa29oYWlkID09PSBudWxsKSB7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgJHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblx0ICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyBcbiAgICAgICAgICAgICAgJHNjb3BlLmtvaGFpZCA9IGtvaGFpZDtcbiAgICAgICAgICAgICAgJHNjb3BlLml0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlID09IFwiam91cm5hbFwiKSB7XG5cdCAgICAgIFx0dmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldFNydS5waHA/aW5kZXg9am91cm5hbHMmcT1cIisgYm47XG5cdFx0ICBcdHZhciByZXNwb25zZSA9IGtvaGFpdGVtc1NlcnZpY2UuZ2V0S29oYURhdGEodXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmQgIT0gdW5kZWZpbmVkICYmIHJlc3BvbnNlLmRhdGEucmVjb3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhLnJlY29yZCk7XG5cdFx0XHRcdFx0JHNjb3BlLmxvYWRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHRhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcigncHJtLW9wYWMgPiBtZC10YWJzJykpWzBdLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzID0gW107XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDAgOyBpIDwgcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaG9sZGluZ3MubGVuZ3RoIDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaG9sZGluZyA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmhvbGRpbmdzW2ldXG5cdFx0XHRcdFx0XHQkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXSA9IHtcblx0XHRcdFx0XHRcdFx0XCJsaWJyYXJ5XCIgOiBob2xkaW5nW1wicmNyXCJdLFxuXHRcdFx0XHRcdFx0XHRcImhvbGRpbmdzXCIgOiBob2xkaW5nW1wiaG9sZGluZ3NcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoaG9sZGluZ1tcImhvbGRpbmdzXCJdLmxlbmd0aCA+IDgwKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJob2xkaW5nc1N1bW1hcnlcIl0gPSBob2xkaW5nW1wiaG9sZGluZ3NcIl0uc3Vic3RyaW5nKDAsNzcpK1wiLi4uXCI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wicmNyXCJdID09ICBob2xkaW5nW1wicmNyXCJdKSB7XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJjYWxsbnVtYmVyXCJdID0gIHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImNhbGxudW1iZXJcIl07XG5cdFx0XHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3NbaV1bXCJsb2NhdGlvblwiXSA9XHRyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJsb2NhdGlvblwiXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7ICBcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiam91cm5hbCA6IG5vIHByaW50IGhvbGRpbmdcIik7XG5cdFx0XHRcdFx0XHQkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdH0pO1xuLypcblx0XHRcdHRoaXMub25DbGljayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQgJHdpbmRvdy5vcGVuKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvYmliLycrIGJuLCAnX2JsYW5rJyk7XG5cdFx0XHR9O1xuKi9cblx0XHR9IFxuXHRcdFxuXHRcdHZhciBkZWxpdmVyeSA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0uZGVsaXZlcnk7XG5cdFx0aWYgKGRlbGl2ZXJ5ICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAgOyBpIDwgZGVsaXZlcnkubGluay5sZW5ndGggOyBpKyspe1xuXHRcdFx0XHRpZiAoZGVsaXZlcnkubGlua1tpXS5kaXNwbGF5TGFiZWwgPT0gXCJvcGVudXJsXCIpIHtcblx0XHRcdFx0XHRvcGVudXJsID0gZGVsaXZlcnkubGlua1tpXS5saW5rVVJMO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvcGVudXJsICE9IHVuZGVmaW5lZCl7XG5cdFx0XHRvcGVudXJsID0gb3BlbnVybC5yZXBsYWNlKC8uK1xcPy8sIFwiXCIpO1xuXHRcdFx0JHNjb3BlLnByb3hpZmllZHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvZ2V0U2Z4LnBocD9cIitvcGVudXJsO1xuXHRcdFx0JGh0dHAuanNvbnAoJHNjb3BlLnByb3hpZmllZHVybCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRpZiAocmVzcG9uc2UuZGF0YS5lcnJvciA9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHQgdmFyIGxlbiA9IGtleXMubGVuZ3RoO1xuXHRcdFx0XHRcdCBjb25zb2xlLmxvZyhcIlNGWCByZXN1bHRzOiBcIitsZW4pO1xuXHRcdFx0XHRcdCBpZihsZW4gPiAwKSB7XG5cdFx0XHRcdFx0XHQgICRzY29wZS5zZnhob2xkaW5ncyA9IHJlc3BvbnNlLmRhdGE7XG5cdFx0XHRcdFx0IH1cblx0XHRcdFx0fVxuXHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHRcbiAgICAgIH0gXG4gICAgfTtcbiAgfSxcbiAgdGVtcGxhdGVVcmw6ICdjdXN0b20vMzNVRFIyX1ZVMS9odG1sL3BybU9wYWNBZnRlci5odG1sJ1xufSkuZmFjdG9yeSgna29oYWl0ZW1zU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRLb2hhRGF0YTogZnVuY3Rpb24gZ2V0S29oYURhdGEodXJsKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdKU09OUCcsXG4gICAgICAgIHVybDogdXJsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSkucnVuKGZ1bmN0aW9uICgkaHR0cCkge1xuICAvLyBOZWNlc3NhcnkgZm9yIHJlcXVlc3RzIHRvIHN1Y2NlZWQuLi5ub3Qgc3VyZSB3aHlcbiAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb24gPSB7ICdYLUZyb20tRXhMLUFQSS1HYXRld2F5JzogdW5kZWZpbmVkIH07XG59KTtcblxuIiwiaW1wb3J0ICdwcmltby1leHBsb3JlLWdvb2dsZS1hbmFseXRpY3MnO1xuaW1wb3J0IHsgdmlld05hbWUgfSBmcm9tICcuL3ZpZXdOYW1lJztcbmltcG9ydCB7IGtvaGFJdGVtcyB9IGZyb20gJy4va29oYUl0ZW1zLm1vZHVsZSc7XG5pbXBvcnQgeyBrb2hhQXZhaWxhYmlsaXRpZXMgfSBmcm9tICcuL2tvaGFBdmFpbGFiaWxpdGllcy5tb2R1bGUnO1xuaW1wb3J0IHsgc2Z4SG9sZGluZ3MgfSBmcm9tICcuL3NmeEhvbGRpbmdzLm1vZHVsZSc7XG5pbXBvcnQgeyBnb29nbGVBbmFseXRpY3NDb25maWcgfSBmcm9tICcuL2dvb2dsZUFuYWx5dGljc0NvbmZpZyc7XG5sZXQgYXBwID0gYW5ndWxhci5tb2R1bGUoJ3ZpZXdDdXN0b20nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FuZ3VsYXJMb2FkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAna29oYUl0ZW1zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAna29oYUF2YWlsYWJpbGl0aWVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2Z4SG9sZGluZ3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ29vZ2xlQW5hbHl0aWNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcblxuYXBwXG4gIC5jb25zdGFudChnb29nbGVBbmFseXRpY3NDb25maWcubmFtZSwgZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLmNvbmZpZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuYXBwLmNvbmZpZyhbJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSB7XG4gIHZhciB1cmxXaGl0ZWxpc3QgPSAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCgpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vKiouYnUudW5pdi1yZW5uZXMyKionKTtcbiAgdXJsV2hpdGVsaXN0LnB1c2goJ2h0dHBzOi8vY2F0YWxvZ3VlcHJlcHJvZC5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cDovL3NmeC11bml2LXJlbm5lczIuaG9zdGVkLmV4bGlicmlzZ3JvdXAqKicpO1xuICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdCh1cmxXaGl0ZWxpc3QpO1xufV0pO1xuXG5cbi8vIGNoYW5nZSBhZHZhbmNlZCBzZWFyY2ggdG8ganVtcCB0byByZXN1bHRzXG5hcHAuY29udHJvbGxlcigncHJtQWR2YW5jZWRTZWFyY2hBZnRlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHtcbi8vIHdhdGNoIHRvIHNlZSBpZiBhZHZhbmNlZCBzZWFyY2ggaXMgdGhlcmVcbiAgICAgICB2YXIgYWR2YW5jZWRTZWFyY2hPYnMgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgIGlmICghbXV0YXRpb24uYWRkZWROb2RlcykgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uLmFkZGVkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gbXV0YXRpb24uYWRkZWROb2Rlc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT0gXCJCVVRUT05cIiAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwicHJtLWFkdmFuY2VkLXNlYXJjaCAuYnV0dG9uLWNvbmZpcm0uYnV0dG9uLWxhcmdlLmJ1dHRvbi13aXRoLWljb24ubWQtYnV0dG9uLm1kLXByaW1vRXhwbG9yZS10aGVtZS5tZC1pbmstcmlwcGxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9uZWVkIGFuIGlkIHRvIGp1bXAgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3VibWl0QXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWR2YW5jZWQtc2VhcmNoLW91dHB1dC5sYXlvdXQtcm93LmZsZXhcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QXJlYS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBcImFkdmFuY2VkU2VhcmNoU3VibWl0QXJlYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwicHJtLWFkdmFuY2VkLXNlYXJjaCAuYnV0dG9uLWNvbmZpcm0uYnV0dG9uLWxhcmdlLmJ1dHRvbi13aXRoLWljb24ubWQtYnV0dG9uLm1kLXByaW1vRXhwbG9yZS10aGVtZS5tZC1pbmstcmlwcGxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1pdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2FpdCBmb3Igc29tZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhZHZhbmNlZFNlYXJjaE9iczIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdXRhdGlvbnMyLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtdXRhdGlvbjIuYWRkZWROb2RlcykgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtdXRhdGlvbjIuYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IG11dGF0aW9uMi5hZGRlZE5vZGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PSBcIlBSTS1TRUFSQ0gtUkVTVUxULVNPUlQtQllcIiAmJiB3aW5kb3cuaW5uZXJIZWlnaHQgPCA3NzUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoPSdhZHZhbmNlZFNlYXJjaFN1Ym1pdEFyZWEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWRTZWFyY2hPYnMyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2VkU2VhcmNoT2JzMi5vYnNlcnZlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwcm0tZXhwbG9yZS1tYWluJylbMF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBzdWJ0cmVlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGF0dHJpYnV0ZXM6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIGNoYXJhY3RlckRhdGE6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZW5kIHdhaXQgZm9yIHNvbWUgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgIH0pXG4gICAgICBcbiAgICAgICBhZHZhbmNlZFNlYXJjaE9icy5vYnNlcnZlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdwcm0tYWR2YW5jZWQtc2VhcmNoJylbMF0sIHtcbiAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICAgICAgICAgICwgc3VidHJlZTogdHJ1ZVxuICAgICAgICAgICAgICAsIGF0dHJpYnV0ZXM6IGZhbHNlXG4gICAgICAgICAgICAgICwgY2hhcmFjdGVyRGF0YTogZmFsc2VcbiAgICAgICB9KVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ3NmeEhvbGRpbmdzJywgW10pLmNvbXBvbmVudCgncHJtVmlld09ubGluZUFmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwgc2Z4aG9sZGluZ3NTZXJ2aWNlKSB7XG4gICAgdGhpcy4kb25Jbml0ID0gZnVuY3Rpb24gKCkge1xuXHQgICRzY29wZS5zZnhsb2FkaW5nID0gdHJ1ZTtcbiAgICAgIHZhciBvYmogPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLmxpbmtFbGVtZW50LmxpbmtzWzBdO1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShcImdldEl0VGFiVGV4dFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJkaXNwbGF5VGV4dFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJpc0xpbmt0b09ubGluZVwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJsaW5rXCIpKSB7XG4gICAgICAgIGlmIChvYmpbJ2Rpc3BsYXlUZXh0J10gPT0gXCJvcGVudXJsZnVsbHRleHRcIikge1xuXHQgICAgICBjb25zb2xlLmxvZyhvYmopO1xuXHQgICAgICBjb25zb2xlLmxvZyhvYmpbJ2xpbmsnXSk7XG4gICAgICAgICAgdmFyIG9wZW51cmwgPSBvYmpbJ2xpbmsnXTtcbiAgICAgICAgICB2YXIgb3BlbnVybFN2YyA9IG9wZW51cmwucmVwbGFjZShcImh0dHA6Ly9hY2NlZGVyLmJ1LnVuaXYtcmVubmVzMi5mci9zZnhfMzNwdWVkYlwiLFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9nZXRTZngucGhwXCIpO1xuICAgICAgICAgIHZhciByZXNwb25zZSA9IHNmeGhvbGRpbmdzU2VydmljZS5nZXRTZnhEYXRhKG9wZW51cmxTdmMpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgaG9sZGluZ3MgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgaWYgKGhvbGRpbmdzID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tdmlldy1vbmxpbmUgZGl2IGEuYXJyb3ctbGluay5tZC1wcmltb0V4cGxvcmUtdGhlbWUnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiOyBcblx0ICAgICAgICAgICRzY29wZS5zZnhsb2FkaW5nID0gZmFsc2U7XG4vLyBcdCAgICAgICAgICBjb25zb2xlLmxvZyhob2xkaW5ncyk7XG4gICAgICAgICAgICAgICRzY29wZS5zZnhob2xkaW5ncyA9IGhvbGRpbmdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtVmlld09ubGluZUFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdzZnhob2xkaW5nc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24gKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2Z4RGF0YTogZnVuY3Rpb24gZ2V0U2Z4RGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuIiwiLy8gRGVmaW5lIHRoZSB2aWV3IG5hbWUgaGVyZS5cbmV4cG9ydCBsZXQgdmlld05hbWUgPSBcIjMzVURSMl9WVTFcIjsiLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJ0aWNzIHYwLjE5LjJcbiAqIChjKSAyMDEzIEx1aXMgRmFyemF0aSBodHRwOi8vbHVpc2ZhcnphdGkuZ2l0aHViLmlvL2FuZ3VsYXJ0aWNzXG4gKiBHb29nbGUgVGFnIE1hbmFnZXIgUGx1Z2luIENvbnRyaWJ1dGVkIGJ5IGh0dHA6Ly9naXRodWIuY29tL2RhbnJvd2U0OVxuICogTGljZW5zZTogTUlUXG4gKi9cblxuKGZ1bmN0aW9uIChhbmd1bGFyKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuXG4gIC8qKlxuICAgKiBAbmdkb2Mgb3ZlcnZpZXdcbiAgICogQG5hbWUgYW5ndWxhcnRpY3MuZ29vZ2xlLmFuYWx5dGljc1xuICAgKiBFbmFibGVzIGFuYWx5dGljcyBzdXBwb3J0IGZvciBHb29nbGUgVGFnIE1hbmFnZXIgKGh0dHA6Ly9nb29nbGUuY29tL3RhZ21hbmFnZXIpXG4gICAqL1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdhbmd1bGFydGljcy5nb29nbGUudGFnbWFuYWdlcicsIFsnYW5ndWxhcnRpY3MnXSlcbiAgICAuY29uZmlnKFsnJGFuYWx5dGljc1Byb3ZpZGVyJywgZnVuY3Rpb24gKCRhbmFseXRpY3NQcm92aWRlcikge1xuXG4gICAgICAkYW5hbHl0aWNzUHJvdmlkZXIuc2V0dGluZ3MuZ2EgPSB7XG4gICAgICAgIHVzZXJJZDogbnVsbFxuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBTZW5kIGNvbnRlbnQgdmlld3MgdG8gdGhlIGRhdGFMYXllclxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFJlcXVpcmVkICdjb250ZW50IG5hbWUnIChzdHJpbmcpIGRlc2NyaWJlcyB0aGUgY29udGVudCBsb2FkZWRcbiAgICAgICAqL1xuXG4gICAgICAkYW5hbHl0aWNzUHJvdmlkZXIucmVnaXN0ZXJQYWdlVHJhY2soZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIGRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyIHx8IFtdO1xuICAgICAgICBkYXRhTGF5ZXIucHVzaCh7XG4gICAgICAgICAgJ2V2ZW50JzogJ2NvbnRlbnQtdmlldycsXG4gICAgICAgICAgJ2NvbnRlbnQtbmFtZSc6IHBhdGgsXG4gICAgICAgICAgJ3VzZXJJZCc6ICRhbmFseXRpY3NQcm92aWRlci5zZXR0aW5ncy5nYS51c2VySWRcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgLyoqXG4gICAgICAgKiBTZW5kIGludGVyYWN0aW9ucyB0byB0aGUgZGF0YUxheWVyLCBpLmUuIGZvciBldmVudCB0cmFja2luZyBpbiBHb29nbGUgQW5hbHl0aWNzXG4gICAgICAgKiBAbmFtZSBldmVudFRyYWNrXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbiBSZXF1aXJlZCAnYWN0aW9uJyAoc3RyaW5nKSBhc3NvY2lhdGVkIHdpdGggdGhlIGV2ZW50XG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvcGVydGllcyBDb21wcmlzZWQgb2YgdGhlIG1hbmRhdG9yeSBmaWVsZCAnY2F0ZWdvcnknIChzdHJpbmcpIGFuZCBvcHRpb25hbCAgZmllbGRzICdsYWJlbCcgKHN0cmluZyksICd2YWx1ZScgKGludGVnZXIpIGFuZCAnbm9uaW50ZXJhY3Rpb24nIChib29sZWFuKVxuICAgICAgICovXG5cbiAgICAgICRhbmFseXRpY3NQcm92aWRlci5yZWdpc3RlckV2ZW50VHJhY2soZnVuY3Rpb24gKGFjdGlvbiwgcHJvcGVydGllcykge1xuICAgICAgICB2YXIgZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG4gICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgICAgICBkYXRhTGF5ZXIucHVzaCh7XG4gICAgICAgICAgJ2V2ZW50JzogcHJvcGVydGllcy5ldmVudCB8fCAnaW50ZXJhY3Rpb24nLFxuICAgICAgICAgICd0YXJnZXQnOiBwcm9wZXJ0aWVzLmNhdGVnb3J5LFxuICAgICAgICAgICdhY3Rpb24nOiBhY3Rpb24sXG4gICAgICAgICAgJ3RhcmdldC1wcm9wZXJ0aWVzJzogcHJvcGVydGllcy5sYWJlbCxcbiAgICAgICAgICAndmFsdWUnOiBwcm9wZXJ0aWVzLnZhbHVlLFxuICAgICAgICAgICdpbnRlcmFjdGlvbi10eXBlJzogcHJvcGVydGllcy5ub25pbnRlcmFjdGlvbixcbiAgICAgICAgICAndXNlcklkJzogJGFuYWx5dGljc1Byb3ZpZGVyLnNldHRpbmdzLmdhLnVzZXJJZFxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IHVzZXJJZCBmb3IgdXNlIHdpdGggVW5pdmVyc2FsIEFuYWx5dGljcyBVc2VyIElEIGZlYXR1cmVcbiAgICAgICAqIEBuYW1lIHNldFVzZXJuYW1lXG4gICAgICAgKiBcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1c2VySWQgUmVxdWlyZWQgJ3VzZXJJZCcgdmFsdWUgKHN0cmluZykgdXNlZCB0byBpZGVudGlmeSB1c2VyIGNyb3NzLWRldmljZSBpbiBHb29nbGUgQW5hbHl0aWNzXG4gICAgICAgKi9cblxuICAgICAgJGFuYWx5dGljc1Byb3ZpZGVyLnJlZ2lzdGVyU2V0VXNlcm5hbWUoZnVuY3Rpb24gKHVzZXJJZCkge1xuICAgICAgICAkYW5hbHl0aWNzUHJvdmlkZXIuc2V0dGluZ3MuZ2EudXNlcklkID0gdXNlcklkO1xuICAgICAgfSk7XG5cbiAgICB9XSk7XG5cbn0pKGFuZ3VsYXIpO1xuIiwicmVxdWlyZSgnLi9hbmd1bGFydGljcy1nb29nbGUtdGFnLW1hbmFnZXInKTtcbm1vZHVsZS5leHBvcnRzID0gJ2FuZ3VsYXJ0aWNzLmdvb2dsZS50YWdtYW5hZ2VyJztcbiIsIi8qKlxuICogQGxpY2Vuc2UgQW5ndWxhcnRpY3NcbiAqIChjKSAyMDEzIEx1aXMgRmFyemF0aSBodHRwOi8vYW5ndWxhcnRpY3MuZ2l0aHViLmlvL1xuICogTGljZW5zZTogTUlUXG4gKi9cbihmdW5jdGlvbihhbmd1bGFyLCBhbmFseXRpY3MpIHtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFuZ3VsYXJ0aWNzID0gd2luZG93LmFuZ3VsYXJ0aWNzIHx8ICh3aW5kb3cuYW5ndWxhcnRpY3MgPSB7fSk7XG5hbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQ291bnQgPSAwO1xuYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckFwaSA9IGZ1bmN0aW9uIChvYmplY3ROYW1lLCBkZWxheSwgY29udGFpbnNGaWVsZCwgcmVnaXN0ZXJGbiwgb25UaW1lb3V0KSB7XG4gIGlmICghb25UaW1lb3V0KSB7IGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JDb3VudCsrOyB9XG4gIGlmICghcmVnaXN0ZXJGbikgeyByZWdpc3RlckZuID0gY29udGFpbnNGaWVsZDsgY29udGFpbnNGaWVsZCA9IHVuZGVmaW5lZDsgfVxuICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh3aW5kb3csIG9iamVjdE5hbWUpIHx8IChjb250YWluc0ZpZWxkICE9PSB1bmRlZmluZWQgJiYgd2luZG93W29iamVjdE5hbWVdW2NvbnRhaW5zRmllbGRdID09PSB1bmRlZmluZWQpKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JBcGkob2JqZWN0TmFtZSwgZGVsYXksIGNvbnRhaW5zRmllbGQsIHJlZ2lzdGVyRm4sIHRydWUpOyB9LCBkZWxheSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckNvdW50LS07XG4gICAgcmVnaXN0ZXJGbih3aW5kb3dbb2JqZWN0TmFtZV0pO1xuICB9XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgYW5ndWxhcnRpY3NcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJ0aWNzJywgW10pXG4ucHJvdmlkZXIoJyRhbmFseXRpY3MnLCAkYW5hbHl0aWNzKVxuLnJ1bihbJyRyb290U2NvcGUnLCAnJHdpbmRvdycsICckYW5hbHl0aWNzJywgJyRpbmplY3RvcicsICRhbmFseXRpY3NSdW5dKVxuLmRpcmVjdGl2ZSgnYW5hbHl0aWNzT24nLCBbJyRhbmFseXRpY3MnLCBhbmFseXRpY3NPbl0pXG4uY29uZmlnKFsnJHByb3ZpZGUnLCBleGNlcHRpb25UcmFja10pO1xuXG5mdW5jdGlvbiAkYW5hbHl0aWNzKCkge1xuICB2YXIgdm0gPSB0aGlzO1xuXG4gIHZhciBzZXR0aW5ncyA9IHtcbiAgICBwYWdlVHJhY2tpbmc6IHtcbiAgICAgIGF1dG9UcmFja0ZpcnN0UGFnZTogdHJ1ZSxcbiAgICAgIGF1dG9UcmFja1ZpcnR1YWxQYWdlczogdHJ1ZSxcbiAgICAgIHRyYWNrUmVsYXRpdmVQYXRoOiBmYWxzZSxcbiAgICAgIHRyYWNrUm91dGVzOiB0cnVlLFxuICAgICAgdHJhY2tTdGF0ZXM6IHRydWUsXG4gICAgICBhdXRvQmFzZVBhdGg6IGZhbHNlLFxuICAgICAgYmFzZVBhdGg6ICcnLFxuICAgICAgZXhjbHVkZWRSb3V0ZXM6IFtdLFxuICAgICAgcXVlcnlLZXlzV2hpdGVsaXN0ZWQ6IFtdLFxuICAgICAgcXVlcnlLZXlzQmxhY2tsaXN0ZWQ6IFtdLFxuICAgICAgZmlsdGVyVXJsU2VnbWVudHM6IFtdXG4gICAgfSxcbiAgICBldmVudFRyYWNraW5nOiB7fSxcbiAgICBidWZmZXJGbHVzaERlbGF5OiAxMDAwLCAvLyBTdXBwb3J0IG9ubHkgb25lIGNvbmZpZ3VyYXRpb24gZm9yIGJ1ZmZlciBmbHVzaCBkZWxheSB0byBzaW1wbGlmeSBidWZmZXJpbmdcbiAgICB0cmFja0V4Y2VwdGlvbnM6IGZhbHNlLFxuICAgIG9wdE91dDogZmFsc2UsXG4gICAgZGV2ZWxvcGVyTW9kZTogZmFsc2UgLy8gUHJldmVudCBzZW5kaW5nIGRhdGEgaW4gbG9jYWwvZGV2ZWxvcG1lbnQgZW52aXJvbm1lbnRcbiAgfTtcblxuICAvLyBMaXN0IG9mIGtub3duIGhhbmRsZXJzIHRoYXQgcGx1Z2lucyBjYW4gcmVnaXN0ZXIgdGhlbXNlbHZlcyBmb3JcbiAgdmFyIGtub3duSGFuZGxlcnMgPSBbXG4gICAgJ3BhZ2VUcmFjaycsXG4gICAgJ2V2ZW50VHJhY2snLFxuICAgICdleGNlcHRpb25UcmFjaycsXG4gICAgJ3RyYW5zYWN0aW9uVHJhY2snLFxuICAgICdzZXRBbGlhcycsXG4gICAgJ3NldFVzZXJuYW1lJyxcbiAgICAnc2V0VXNlclByb3BlcnRpZXMnLFxuICAgICdzZXRVc2VyUHJvcGVydGllc09uY2UnLFxuICAgICdzZXRTdXBlclByb3BlcnRpZXMnLFxuICAgICdzZXRTdXBlclByb3BlcnRpZXNPbmNlJyxcbiAgICAnaW5jcmVtZW50UHJvcGVydHknLFxuICAgICd1c2VyVGltaW5ncycsXG4gICAgJ2NsZWFyQ29va2llcydcbiAgXTtcbiAgLy8gQ2FjaGUgYW5kIGhhbmRsZXIgcHJvcGVydGllcyB3aWxsIG1hdGNoIHZhbHVlcyBpbiAna25vd25IYW5kbGVycycgYXMgdGhlIGJ1ZmZlcmluZyBmdW5jdG9ucyBhcmUgaW5zdGFsbGVkLlxuICB2YXIgY2FjaGUgPSB7fTtcbiAgdmFyIGhhbmRsZXJzID0ge307XG4gIHZhciBoYW5kbGVyT3B0aW9ucyA9IHt9O1xuXG4gIC8vIEdlbmVyYWwgYnVmZmVyaW5nIGhhbmRsZXJcbiAgZnVuY3Rpb24gYnVmZmVyZWRIYW5kbGVyKGhhbmRsZXJOYW1lKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIGlmKGFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JDb3VudCl7XG4gICAgICAgIGlmKCFjYWNoZVtoYW5kbGVyTmFtZV0peyBjYWNoZVtoYW5kbGVyTmFtZV0gPSBbXTsgfVxuICAgICAgICBjYWNoZVtoYW5kbGVyTmFtZV0ucHVzaChhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBBcyBoYW5kbGVycyBhcmUgaW5zdGFsbGVkIGJ5IHBsdWdpbnMsIHRoZXkgZ2V0IHB1c2hlZCBpbnRvIGEgbGlzdCBhbmQgaW52b2tlZCBpbiBvcmRlci5cbiAgZnVuY3Rpb24gdXBkYXRlSGFuZGxlcnMoaGFuZGxlck5hbWUsIGZuLCBvcHRpb25zKXtcbiAgICBpZighaGFuZGxlcnNbaGFuZGxlck5hbWVdKXtcbiAgICAgIGhhbmRsZXJzW2hhbmRsZXJOYW1lXSA9IFtdO1xuICAgIH1cbiAgICBoYW5kbGVyc1toYW5kbGVyTmFtZV0ucHVzaChmbik7XG4gICAgaGFuZGxlck9wdGlvbnNbZm5dID0gb3B0aW9ucztcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCF0aGlzLnNldHRpbmdzLm9wdE91dCkge1xuICAgICAgICB2YXIgaGFuZGxlckFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGluamVjdChbJyRxJywgYW5ndWxhci5iaW5kKHRoaXMsIGZ1bmN0aW9uKCRxKSB7XG4gICAgICAgICAgcmV0dXJuICRxLmFsbChoYW5kbGVyc1toYW5kbGVyTmFtZV0ubWFwKGZ1bmN0aW9uKGhhbmRsZXJGbikge1xuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBoYW5kbGVyT3B0aW9uc1toYW5kbGVyRm5dIHx8IHt9O1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXN5bmMpIHtcbiAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRBcmdzID0gYW5ndWxhci5jb3B5KGhhbmRsZXJBcmdzKTtcbiAgICAgICAgICAgICAgY3VycmVudEFyZ3MudW5zaGlmdChkZWZlcnJlZC5yZXNvbHZlKTtcbiAgICAgICAgICAgICAgaGFuZGxlckZuLmFwcGx5KHRoaXMsIGN1cnJlbnRBcmdzKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKGhhbmRsZXJGbi5hcHBseSh0aGlzLCBoYW5kbGVyQXJncykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgfSldKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gVGhlIGFwaSAocmV0dXJuZWQgYnkgdGhpcyBwcm92aWRlcikgZ2V0cyBwb3B1bGF0ZWQgd2l0aCBoYW5kbGVycyBiZWxvdy5cbiAgdmFyIGFwaSA9IHtcbiAgICBzZXR0aW5nczogc2V0dGluZ3NcbiAgfTtcblxuICAvLyBPcHQgaW4gYW5kIG9wdCBvdXQgZnVuY3Rpb25zXG4gIGFwaS5zZXRPcHRPdXQgPSBmdW5jdGlvbihvcHRPdXQpIHtcbiAgICB0aGlzLnNldHRpbmdzLm9wdE91dCA9IG9wdE91dDtcbiAgICB0cmlnZ2VyUmVnaXN0ZXIoKTtcbiAgfTtcblxuICBhcGkuZ2V0T3B0T3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0dGluZ3Mub3B0T3V0O1xuICB9O1xuXG5cbiAgLy8gV2lsbCBydW4gc2V0VGltZW91dCBpZiBkZWxheSBpcyA+IDBcbiAgLy8gUnVucyBpbW1lZGlhdGVseSBpZiBubyBkZWxheSB0byBtYWtlIHN1cmUgY2FjaGUvYnVmZmVyIGlzIGZsdXNoZWQgYmVmb3JlIGFueXRoaW5nIGVsc2UuXG4gIC8vIFBsdWdpbnMgc2hvdWxkIHRha2UgY2FyZSB0byByZWdpc3RlciBoYW5kbGVycyBieSBvcmRlciBvZiBwcmVjZWRlbmNlLlxuICBmdW5jdGlvbiBvblRpbWVvdXQoZm4sIGRlbGF5KXtcbiAgICBpZihkZWxheSl7XG4gICAgICBzZXRUaW1lb3V0KGZuLCBkZWxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZuKCk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHByb3ZpZGVyID0ge1xuICAgICRnZXQ6IFsnJGluamVjdG9yJywgZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICByZXR1cm4gYXBpV2l0aEluamVjdG9yKCRpbmplY3Rvcik7XG4gICAgfV0sXG4gICAgYXBpOiBhcGksXG4gICAgc2V0dGluZ3M6IHNldHRpbmdzLFxuICAgIHZpcnR1YWxQYWdldmlld3M6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvVHJhY2tWaXJ0dWFsUGFnZXMgPSB2YWx1ZTsgfSxcbiAgICB0cmFja1N0YXRlczogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrU3RhdGVzID0gdmFsdWU7IH0sXG4gICAgdHJhY2tSb3V0ZXM6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1JvdXRlcyA9IHZhbHVlOyB9LFxuICAgIGV4Y2x1ZGVSb3V0ZXM6IGZ1bmN0aW9uKHJvdXRlcykgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5leGNsdWRlZFJvdXRlcyA9IHJvdXRlczsgfSxcbiAgICBxdWVyeUtleXNXaGl0ZWxpc3Q6IGZ1bmN0aW9uKGtleXMpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcucXVlcnlLZXlzV2hpdGVsaXN0ZWQgPSBrZXlzOyB9LFxuICAgIHF1ZXJ5S2V5c0JsYWNrbGlzdDogZnVuY3Rpb24oa2V5cykgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5xdWVyeUtleXNCbGFja2xpc3RlZCA9IGtleXM7IH0sXG4gICAgZmlsdGVyVXJsU2VnbWVudHM6IGZ1bmN0aW9uKGZpbHRlcnMpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuZmlsdGVyVXJsU2VnbWVudHMgPSBmaWx0ZXJzOyB9LFxuICAgIGZpcnN0UGFnZXZpZXc6IGZ1bmN0aW9uICh2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvVHJhY2tGaXJzdFBhZ2UgPSB2YWx1ZTsgfSxcbiAgICB3aXRoQmFzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCA9ICh2YWx1ZSkgPyBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLmZpbmQoJ2Jhc2UnKS5hdHRyKCdocmVmJykgOiAnJztcbiAgICB9LFxuICAgIHdpdGhBdXRvQmFzZTogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9CYXNlUGF0aCA9IHZhbHVlOyB9LFxuICAgIHRyYWNrRXhjZXB0aW9uczogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MudHJhY2tFeGNlcHRpb25zID0gdmFsdWU7IH0sXG4gICAgZGV2ZWxvcGVyTW9kZTogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5kZXZlbG9wZXJNb2RlID0gdmFsdWU7IH1cbiAgfTtcblxuICAvLyBHZW5lcmFsIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHBsdWdpbiBoYW5kbGVycy4gRmx1c2hlcyBidWZmZXJzIGltbWVkaWF0ZWx5IHVwb24gcmVnaXN0cmF0aW9uIGFjY29yZGluZyB0byB0aGUgc3BlY2lmaWVkIGRlbGF5LlxuICBmdW5jdGlvbiByZWdpc3RlcihoYW5kbGVyTmFtZSwgZm4sIG9wdGlvbnMpe1xuICAgIC8vIERvIG5vdCBhZGQgYSBoYW5kbGVyIGlmIGRldmVsb3Blck1vZGUgaXMgdHJ1ZVxuICAgIGlmIChzZXR0aW5ncy5kZXZlbG9wZXJNb2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXBpW2hhbmRsZXJOYW1lXSA9IHVwZGF0ZUhhbmRsZXJzKGhhbmRsZXJOYW1lLCBmbiwgb3B0aW9ucyk7XG4gICAgdmFyIGhhbmRsZXJTZXR0aW5ncyA9IHNldHRpbmdzW2hhbmRsZXJOYW1lXTtcbiAgICB2YXIgaGFuZGxlckRlbGF5ID0gKGhhbmRsZXJTZXR0aW5ncykgPyBoYW5kbGVyU2V0dGluZ3MuYnVmZmVyRmx1c2hEZWxheSA6IG51bGw7XG4gICAgdmFyIGRlbGF5ID0gKGhhbmRsZXJEZWxheSAhPT0gbnVsbCkgPyBoYW5kbGVyRGVsYXkgOiBzZXR0aW5ncy5idWZmZXJGbHVzaERlbGF5O1xuICAgIGFuZ3VsYXIuZm9yRWFjaChjYWNoZVtoYW5kbGVyTmFtZV0sIGZ1bmN0aW9uIChhcmdzLCBpbmRleCkge1xuICAgICAgb25UaW1lb3V0KGZ1bmN0aW9uICgpIHsgZm4uYXBwbHkodGhpcywgYXJncyk7IH0sIGluZGV4ICogZGVsYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FwaXRhbGl6ZShpbnB1dCkge1xuICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL14uLywgZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoLnRvVXBwZXJDYXNlKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vcHJvdmlkZSBhIG1ldGhvZCB0byBpbmplY3Qgc2VydmljZXMgaW50byBoYW5kbGVyc1xuICB2YXIgYXBpV2l0aEluamVjdG9yID0gZnVuY3Rpb24oaW5qZWN0b3IpIHtcbiAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoYXBpLCB7XG4gICAgICAnJGluamVjdCc6IGluamVjdG9yLmludm9rZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZHMgdG8gdGhlIHByb3ZpZGVyIGEgJ3JlZ2lzdGVyI3toYW5kbGVyTmFtZX0nIGZ1bmN0aW9uIHRoYXQgbWFuYWdlcyBtdWx0aXBsZSBwbHVnaW5zIGFuZCBidWZmZXIgZmx1c2hpbmcuXG4gIGZ1bmN0aW9uIGluc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbihoYW5kbGVyTmFtZSl7XG4gICAgdmFyIHJlZ2lzdGVyTmFtZSA9ICdyZWdpc3RlcicrY2FwaXRhbGl6ZShoYW5kbGVyTmFtZSk7XG4gICAgcHJvdmlkZXJbcmVnaXN0ZXJOYW1lXSA9IGZ1bmN0aW9uKGZuLCBvcHRpb25zKXtcbiAgICAgIHJlZ2lzdGVyKGhhbmRsZXJOYW1lLCBmbiwgb3B0aW9ucyk7XG4gICAgfTtcbiAgICBhcGlbaGFuZGxlck5hbWVdID0gdXBkYXRlSGFuZGxlcnMoaGFuZGxlck5hbWUsIGJ1ZmZlcmVkSGFuZGxlcihoYW5kbGVyTmFtZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRSZWdpc3RlcmluZyhfcHJvdmlkZXIsIF9rbm93bkhhbmRsZXJzLCBfaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKF9rbm93bkhhbmRsZXJzLCBfaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBfcHJvdmlkZXIpIHtcbiAgICAgIHZtW2tleV0gPSBfcHJvdmlkZXJba2V5XTtcbiAgICB9XG4gIH1cblxuICAvLyBBbGxvdyAkYW5ndWxhcnRpY3MgdG8gdHJpZ2dlciB0aGUgcmVnaXN0ZXIgdG8gdXBkYXRlIG9wdCBpbi9vdXRcbiAgdmFyIHRyaWdnZXJSZWdpc3RlciA9IGZ1bmN0aW9uKCkge1xuICAgIHN0YXJ0UmVnaXN0ZXJpbmcocHJvdmlkZXIsIGtub3duSGFuZGxlcnMsIGluc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbik7XG4gIH07XG5cbiAgLy8gSW5pdGlhbCByZWdpc3RlclxuICBzdGFydFJlZ2lzdGVyaW5nKHByb3ZpZGVyLCBrbm93bkhhbmRsZXJzLCBpbnN0YWxsSGFuZGxlclJlZ2lzdGVyRnVuY3Rpb24pO1xuXG59XG5cbmZ1bmN0aW9uICRhbmFseXRpY3NSdW4oJHJvb3RTY29wZSwgJHdpbmRvdywgJGFuYWx5dGljcywgJGluamVjdG9yKSB7XG5cbiAgZnVuY3Rpb24gbWF0Y2hlc0V4Y2x1ZGVkUm91dGUodXJsKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5leGNsdWRlZFJvdXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGV4Y2x1ZGVkUm91dGUgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5leGNsdWRlZFJvdXRlc1tpXTtcbiAgICAgIGlmICgoZXhjbHVkZWRSb3V0ZSBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBleGNsdWRlZFJvdXRlLnRlc3QodXJsKSkgfHwgdXJsLmluZGV4T2YoZXhjbHVkZWRSb3V0ZSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlEaWZmZXJlbmNlKGExLCBhMikge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGExLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYTIuaW5kZXhPZihhMVtpXSkgPT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGExW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbHRlclF1ZXJ5U3RyaW5nKHVybCwga2V5c01hdGNoQXJyLCB0aGlzVHlwZSl7XG4gICAgaWYgKC9cXD8vLnRlc3QodXJsKSAmJiBrZXlzTWF0Y2hBcnIubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIHVybEFyciA9IHVybC5zcGxpdCgnPycpO1xuICAgICAgdmFyIHVybEJhc2UgPSB1cmxBcnJbMF07XG4gICAgICB2YXIgcGFpcnMgPSB1cmxBcnJbMV0uc3BsaXQoJyYnKTtcbiAgICAgIHZhciBtYXRjaGVkUGFpcnMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzTWF0Y2hBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGxpc3RlZEtleSA9IGtleXNNYXRjaEFycltpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBwYWlycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICgobGlzdGVkS2V5IGluc3RhbmNlb2YgUmVnRXhwICYmIGxpc3RlZEtleS50ZXN0KHBhaXJzW2pdKSkgfHwgcGFpcnNbal0uaW5kZXhPZihsaXN0ZWRLZXkpID4gLTEpIG1hdGNoZWRQYWlycy5wdXNoKHBhaXJzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbWF0Y2hlZFBhaXJzQXJyID0gKHRoaXNUeXBlID09ICd3aGl0ZScgPyBtYXRjaGVkUGFpcnMgOiBhcnJheURpZmZlcmVuY2UocGFpcnMsbWF0Y2hlZFBhaXJzKSk7XG4gICAgICBpZihtYXRjaGVkUGFpcnNBcnIubGVuZ3RoID4gMCl7XG4gICAgICAgIHJldHVybiB1cmxCYXNlICsgJz8nICsgbWF0Y2hlZFBhaXJzQXJyLmpvaW4oJyYnKTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gdXJsQmFzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB3aGl0ZWxpc3RRdWVyeVN0cmluZyh1cmwpe1xuICAgIHJldHVybiBmaWx0ZXJRdWVyeVN0cmluZyh1cmwsICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnF1ZXJ5S2V5c1doaXRlbGlzdGVkLCAnd2hpdGUnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJsYWNrbGlzdFF1ZXJ5U3RyaW5nKHVybCl7XG4gICAgcmV0dXJuIGZpbHRlclF1ZXJ5U3RyaW5nKHVybCwgJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcucXVlcnlLZXlzQmxhY2tsaXN0ZWQsICdibGFjaycpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsdGVyVXJsU2VnbWVudHModXJsKXtcbiAgICB2YXIgc2VnbWVudEZpbHRlcnNBcnIgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5maWx0ZXJVcmxTZWdtZW50cztcblxuICAgIGlmIChzZWdtZW50RmlsdGVyc0Fyci5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdXJsQXJyID0gdXJsLnNwbGl0KCc/Jyk7XG4gICAgICB2YXIgdXJsQmFzZSA9IHVybEFyclswXTtcblxuICAgICAgdmFyIHNlZ21lbnRzID0gdXJsQmFzZS5zcGxpdCgnLycpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlZ21lbnRGaWx0ZXJzQXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzZWdtZW50RmlsdGVyID0gc2VnbWVudEZpbHRlcnNBcnJbaV07XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBzZWdtZW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIC8qIEZpcnN0IHNlZ21lbnQgd2lsbCBiZSBob3N0L3Byb3RvY29sIG9yIGJhc2UgcGF0aC4gKi9cbiAgICAgICAgICBpZiAoKHNlZ21lbnRGaWx0ZXIgaW5zdGFuY2VvZiBSZWdFeHAgJiYgc2VnbWVudEZpbHRlci50ZXN0KHNlZ21lbnRzW2pdKSkgfHwgc2VnbWVudHNbal0uaW5kZXhPZihzZWdtZW50RmlsdGVyKSA+IC0xKSB7XG4gICAgICAgICAgICBzZWdtZW50c1tqXSA9ICdGSUxURVJFRCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cy5qb2luKCcvJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKSB7XG4gICAgaWYgKCFtYXRjaGVzRXhjbHVkZWRSb3V0ZSh1cmwpKSB7XG4gICAgICB1cmwgPSB3aGl0ZWxpc3RRdWVyeVN0cmluZyh1cmwpO1xuICAgICAgdXJsID0gYmxhY2tsaXN0UXVlcnlTdHJpbmcodXJsKTtcbiAgICAgIHVybCA9IGZpbHRlclVybFNlZ21lbnRzKHVybCk7XG4gICAgICAkYW5hbHl0aWNzLnBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9UcmFja0ZpcnN0UGFnZSkge1xuICAgIC8qIE9ubHkgdHJhY2sgdGhlICdmaXJzdCBwYWdlJyBpZiB0aGVyZSBhcmUgbm8gcm91dGVzIG9yIHN0YXRlcyBvbiB0aGUgcGFnZSAqL1xuICAgIHZhciBub1JvdXRlc09yU3RhdGVzID0gdHJ1ZTtcbiAgICBpZiAoJGluamVjdG9yLmhhcygnJHJvdXRlJykpIHtcbiAgICAgICB2YXIgJHJvdXRlID0gJGluamVjdG9yLmdldCgnJHJvdXRlJyk7XG4gICAgICAgaWYgKCRyb3V0ZSkge1xuICAgICAgICBmb3IgKHZhciByb3V0ZSBpbiAkcm91dGUucm91dGVzKSB7XG4gICAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgfSBlbHNlIGlmICgkcm91dGUgPT09IG51bGwpe1xuICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgfVxuICAgIH0gZWxzZSBpZiAoJGluamVjdG9yLmhhcygnJHN0YXRlJykpIHtcbiAgICAgIHZhciAkc3RhdGUgPSAkaW5qZWN0b3IuZ2V0KCckc3RhdGUnKTtcbiAgICAgIGlmICgkc3RhdGUuZ2V0KCkubGVuZ3RoID4gMSkgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAobm9Sb3V0ZXNPclN0YXRlcykge1xuICAgICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9CYXNlUGF0aCkge1xuICAgICAgICAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCA9ICR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgICB9XG4gICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tSZWxhdGl2ZVBhdGgpIHtcbiAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYWdlVHJhY2soJGxvY2F0aW9uLmFic1VybCgpLCAkbG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9UcmFja1ZpcnR1YWxQYWdlcykge1xuICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5hdXRvQmFzZVBhdGgpIHtcbiAgICAgIC8qIEFkZCB0aGUgZnVsbCByb3V0ZSB0byB0aGUgYmFzZS4gKi9cbiAgICAgICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoID0gJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIFwiI1wiO1xuICAgIH1cbiAgICB2YXIgbm9Sb3V0ZXNPclN0YXRlcyA9IHRydWU7XG5cbiAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tSb3V0ZXMpIHtcbiAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCckcm91dGUnKSkge1xuICAgICAgICB2YXIgJHJvdXRlID0gJGluamVjdG9yLmdldCgnJHJvdXRlJyk7XG4gICAgICAgIGlmICgkcm91dGUpIHtcbiAgICAgICAgICBmb3IgKHZhciByb3V0ZSBpbiAkcm91dGUucm91dGVzKSB7XG4gICAgICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoJHJvdXRlID09PSBudWxsKXtcbiAgICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJlbnQpIHtcbiAgICAgICAgICBpZiAoY3VycmVudCAmJiAoY3VycmVudC4kJHJvdXRlfHxjdXJyZW50KS5yZWRpcmVjdFRvKSByZXR1cm47XG4gICAgICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCArICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICAgIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgICAgICAgfV0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tTdGF0ZXMpIHtcbiAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCckc3RhdGUnKSAmJiAhJGluamVjdG9yLmhhcygnJHRyYW5zaXRpb25zJykpIHtcbiAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uIChldmVudCwgY3VycmVudCkge1xuICAgICAgICAgICRpbmplY3Rvci5pbnZva2UoWyckbG9jYXRpb24nLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgICBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgICAgICAgIH1dKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoJGluamVjdG9yLmhhcygnJHN0YXRlJykgJiYgJGluamVjdG9yLmhhcygnJHRyYW5zaXRpb25zJykpIHtcbiAgICAgICAgbm9Sb3V0ZXNPclN0YXRlcyA9IGZhbHNlO1xuICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJHRyYW5zaXRpb25zJywgZnVuY3Rpb24oJHRyYW5zaXRpb25zKSB7XG4gICAgICAgICAgJHRyYW5zaXRpb25zLm9uU3VjY2Vzcyh7fSwgZnVuY3Rpb24oJHRyYW5zaXRpb24kKSB7XG4gICAgICAgICAgICB2YXIgdHJhbnNpdGlvbk9wdGlvbnMgPSAkdHJhbnNpdGlvbiQub3B0aW9ucygpO1xuXG4gICAgICAgICAgICAvLyBvbmx5IHRyYWNrIGZvciB0cmFuc2l0aW9ucyB0aGF0IHdvdWxkIGhhdmUgdHJpZ2dlcmVkICRzdGF0ZUNoYW5nZVN1Y2Nlc3NcbiAgICAgICAgICAgIGlmICh0cmFuc2l0aW9uT3B0aW9ucy5ub3RpZnkpIHtcbiAgICAgICAgICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5vUm91dGVzT3JTdGF0ZXMpIHtcbiAgICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKGV2ZW50LCBjdXJyZW50KSB7XG4gICAgICAgIGlmIChjdXJyZW50ICYmIChjdXJyZW50LiQkcm91dGUgfHwgY3VycmVudCkucmVkaXJlY3RUbykgcmV0dXJuO1xuICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1JlbGF0aXZlUGF0aCkge1xuICAgICAgICAgICAgdmFyIHVybCA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoICsgJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnZVRyYWNrKCRsb2NhdGlvbi5hYnNVcmwoKSwgJGxvY2F0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1dKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5kZXZlbG9wZXJNb2RlKSB7XG4gICAgYW5ndWxhci5mb3JFYWNoKCRhbmFseXRpY3MsIGZ1bmN0aW9uKGF0dHIsIG5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAkYW5hbHl0aWNzW25hbWVdID0gZnVuY3Rpb24oKXt9O1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuYWx5dGljc09uKCRhbmFseXRpY3MpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6IGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMpIHtcbiAgICAgIHZhciBldmVudFR5cGUgPSAkYXR0cnMuYW5hbHl0aWNzT24gfHwgJ2NsaWNrJztcbiAgICAgIHZhciB0cmFja2luZ0RhdGEgPSB7fTtcblxuICAgICAgYW5ndWxhci5mb3JFYWNoKCRhdHRycy4kYXR0ciwgZnVuY3Rpb24oYXR0ciwgbmFtZSkge1xuICAgICAgICBpZiAoaXNQcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgIHRyYWNraW5nRGF0YVtwcm9wZXJ0eU5hbWUobmFtZSldID0gJGF0dHJzW25hbWVdO1xuICAgICAgICAgICRhdHRycy4kb2JzZXJ2ZShuYW1lLCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgICB0cmFja2luZ0RhdGFbcHJvcGVydHlOYW1lKG5hbWUpXSA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgYW5ndWxhci5lbGVtZW50KCRlbGVtZW50WzBdKS5vbihldmVudFR5cGUsIGZ1bmN0aW9uICgkZXZlbnQpIHtcbiAgICAgICAgdmFyIGV2ZW50TmFtZSA9ICRhdHRycy5hbmFseXRpY3NFdmVudCB8fCBpbmZlckV2ZW50TmFtZSgkZWxlbWVudFswXSk7XG4gICAgICAgIHRyYWNraW5nRGF0YS5ldmVudFR5cGUgPSAkZXZlbnQudHlwZTtcblxuICAgICAgICBpZigkYXR0cnMuYW5hbHl0aWNzSWYpe1xuICAgICAgICAgIGlmKCEgJHNjb3BlLiRldmFsKCRhdHRycy5hbmFseXRpY3NJZikpe1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBDYW5jZWwgdGhpcyBldmVudCBpZiB3ZSBkb24ndCBwYXNzIHRoZSBhbmFseXRpY3MtaWYgY29uZGl0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IGNvbXBvbmVudHMgdG8gcGFzcyB0aHJvdWdoIGFuIGV4cHJlc3Npb24gdGhhdCBnZXRzIG1lcmdlZCBvbiB0byB0aGUgZXZlbnQgcHJvcGVydGllc1xuICAgICAgICAvLyBlZy4gYW5hbHl0aWNzLXByb3Blcml0ZXM9J215Q29tcG9uZW50U2NvcGUuc29tZUNvbmZpZ0V4cHJlc3Npb24uJGFuYWx5dGljc1Byb3BlcnRpZXMnXG4gICAgICAgIGlmKCRhdHRycy5hbmFseXRpY3NQcm9wZXJ0aWVzKXtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh0cmFja2luZ0RhdGEsICRzY29wZS4kZXZhbCgkYXR0cnMuYW5hbHl0aWNzUHJvcGVydGllcykpO1xuICAgICAgICB9XG4gICAgICAgICRhbmFseXRpY3MuZXZlbnRUcmFjayhldmVudE5hbWUsIHRyYWNraW5nRGF0YSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGV4Y2VwdGlvblRyYWNrKCRwcm92aWRlKSB7XG4gICRwcm92aWRlLmRlY29yYXRvcignJGV4Y2VwdGlvbkhhbmRsZXInLCBbJyRkZWxlZ2F0ZScsICckaW5qZWN0b3InLCBmdW5jdGlvbiAoJGRlbGVnYXRlLCAkaW5qZWN0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGVycm9yLCBjYXVzZSkge1xuICAgICAgdmFyIHJlc3VsdCA9ICRkZWxlZ2F0ZShlcnJvciwgY2F1c2UpO1xuICAgICAgdmFyICRhbmFseXRpY3MgPSAkaW5qZWN0b3IuZ2V0KCckYW5hbHl0aWNzJyk7XG4gICAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy50cmFja0V4Y2VwdGlvbnMpIHtcbiAgICAgICAgJGFuYWx5dGljcy5leGNlcHRpb25UcmFjayhlcnJvciwgY2F1c2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9XSk7XG59XG5cbmZ1bmN0aW9uIGlzQ29tbWFuZChlbGVtZW50KSB7XG4gIHJldHVybiBbJ2E6JywnYnV0dG9uOicsJ2J1dHRvbjpidXR0b24nLCdidXR0b246c3VibWl0JywnaW5wdXQ6YnV0dG9uJywnaW5wdXQ6c3VibWl0J10uaW5kZXhPZihcbiAgICBlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSsnOicrKGVsZW1lbnQudHlwZXx8JycpKSA+PSAwO1xufVxuXG5mdW5jdGlvbiBpbmZlckV2ZW50VHlwZShlbGVtZW50KSB7XG4gIGlmIChpc0NvbW1hbmQoZWxlbWVudCkpIHJldHVybiAnY2xpY2snO1xuICByZXR1cm4gJ2NsaWNrJztcbn1cblxuZnVuY3Rpb24gaW5mZXJFdmVudE5hbWUoZWxlbWVudCkge1xuICBpZiAoaXNDb21tYW5kKGVsZW1lbnQpKSByZXR1cm4gZWxlbWVudC5pbm5lclRleHQgfHwgZWxlbWVudC52YWx1ZTtcbiAgcmV0dXJuIGVsZW1lbnQuaWQgfHwgZWxlbWVudC5uYW1lIHx8IGVsZW1lbnQudGFnTmFtZTtcbn1cblxuZnVuY3Rpb24gaXNQcm9wZXJ0eShuYW1lKSB7XG4gIHJldHVybiBuYW1lLnN1YnN0cigwLCA5KSA9PT0gJ2FuYWx5dGljcycgJiYgWydPbicsICdFdmVudCcsICdJZicsICdQcm9wZXJ0aWVzJywgJ0V2ZW50VHlwZSddLmluZGV4T2YobmFtZS5zdWJzdHIoOSkpID09PSAtMTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlOYW1lKG5hbWUpIHtcbiAgdmFyIHMgPSBuYW1lLnNsaWNlKDkpOyAvLyBzbGljZSBvZmYgdGhlICdhbmFseXRpY3MnIHByZWZpeFxuICBpZiAodHlwZW9mIHMgIT09ICd1bmRlZmluZWQnICYmIHMhPT1udWxsICYmIHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBzLnN1YnN0cmluZygwLCAxKS50b0xvd2VyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cbn0pKGFuZ3VsYXIpO1xuIiwicmVxdWlyZSgnLi9hbmd1bGFydGljcycpO1xubW9kdWxlLmV4cG9ydHMgPSAnYW5ndWxhcnRpY3MnO1xuIiwicmVxdWlyZSgnLi9qcy9nb29nbGVBbmFseXRpY3MubW9kdWxlLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9ICdnb29nbGVBbmFseXRpY3MnO1xuIiwiaW1wb3J0IFwiYW5ndWxhcnRpY3NcIjtcbmltcG9ydCBcImFuZ3VsYXJ0aWNzLWdvb2dsZS10YWctbWFuYWdlclwiO1xuXG5hbmd1bGFyLm1vZHVsZSgnZ29vZ2xlQW5hbHl0aWNzJywgW1wiYW5ndWxhcnRpY3NcIiwgXCJhbmd1bGFydGljcy5nb29nbGUudGFnbWFuYWdlclwiXSlcbiAgLmZhY3RvcnkoJ2dhSW5qZWN0aW9uU2VydmljZScsIFsnZ29vZ2xlQW5hbHl0aWNzQ29uZmlnJywgZnVuY3Rpb24oZ29vZ2xlQW5hbHl0aWNzQ29uZmlnKSB7XG4gICAgY29uc3QgZGVmYXVsdENvZGUgPSBgd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBndGFnKCl7ZGF0YUxheWVyLnB1c2goYXJndW1lbnRzKTt9XG4gICAgICAgICAgICAgICAgICAgICAgICBndGFnKCdqcycsIG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3RhZygnY29uZmlnJywgJyR7Z29vZ2xlQW5hbHl0aWNzQ29uZmlnLnRyYWNraW5nSWR9Jyk7YDtcbiAgICBjb25zdCBfaW5saW5lQ29kZSA9IGdvb2dsZUFuYWx5dGljc0NvbmZpZy5pbmxpbmVTY3JpcHQgfHwgZGVmYXVsdENvZGU7XG5cbiAgICBjb25zdCBkZWZhdWx0VVJMID0gYGh0dHBzOi8vd3d3Lmdvb2dsZXRhZ21hbmFnZXIuY29tL2d0YWcvanM/aWQ9JHtnb29nbGVBbmFseXRpY3NDb25maWcudHJhY2tpbmdJZH1gO1xuICAgIGxldCBfZXh0ZXJuYWxTb3VyY2U7XG5cbiAgICBpZiAoZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLmV4dGVybmFsU2NyaXB0VVJMID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9leHRlcm5hbFNvdXJjZSA9IGRlZmF1bHRVUkw7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9leHRlcm5hbFNvdXJjZSA9IGdvb2dsZUFuYWx5dGljc0NvbmZpZy5leHRlcm5hbFNjcmlwdFVSTDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJGdldEV4dGVybmFsU291cmNlOiBfZXh0ZXJuYWxTb3VyY2UsXG4gICAgICAkZ2V0SW5saW5lQ29kZTogX2lubGluZUNvZGUsXG4gICAgICBpbmplY3RHQUNvZGUoKSB7XG4gICAgICAgIGlmIChfZXh0ZXJuYWxTb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBleHRlcm5hbFNjcmlwdFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgIGV4dGVybmFsU2NyaXB0VGFnLnNyYyA9IF9leHRlcm5hbFNvdXJjZTtcbiAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGV4dGVybmFsU2NyaXB0VGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlubGluZVNjcmlwdFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICBpbmxpbmVTY3JpcHRUYWcudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuXG4gICAgICAgIC8vIE1ldGhvZHMgb2YgYWRkaW5nIGlubmVyIHRleHQgc29tZXRpbWVzIGRvZXNuJ3Qgd29yayBhY3Jvc3MgYnJvd3NlcnMuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaW5saW5lU2NyaXB0VGFnLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKF9pbmxpbmVDb2RlKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpbmxpbmVTY3JpcHRUYWcudGV4dCA9IF9pbmxpbmVDb2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChpbmxpbmVTY3JpcHRUYWcpO1xuICAgICAgfVxuICAgIH07XG4gIH1dKTtcbiJdfQ==
