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

var _mainmenu = require('./mainmenu.module');

var app = angular.module('viewCustom', ['angularLoad', 'kohaItems', 'kohaAvailabilities', 'sfxHoldings', 'mainmenu', 'googleAnalytics']);

app.constant(_googleAnalyticsConfig.googleAnalyticsConfig.name, _googleAnalyticsConfig.googleAnalyticsConfig.config);

angular.module('primo-explore.config').run(['$templateCache', function ($templateCache) {
       $templateCache.put('components/search/topbar/topbar.html', '');
       $templateCache.put('components/search/searchBar/search-bar.html', '<div layout="column" layout-fill tabindex="-1" role="search" ng-class="{\'zero-padding\': $ctrl.showTabsAndScopesVal()}"><prm-logo class="hide-xs hide-sm hide-md"></prm-logo><div class="search-wrapper dark-toolbar prm-top-bar-container main-header-row" div layout="row" ng-class="{\'facet-to-left\': $ctrl.facetToLeft && !$ctrl.mediaQueries.xs && !$ctrl.mediaQueries.sm && !$ctrl.mediaQueries.md}"><div flex="0" flex-md="0" flex-lg="10" flex-xl="20" ng-class="{\'facet-to-left-spacer\': $ctrl.facetToLeft && !$ctrl.mediaQueries.xl && !$ctrl.mediaQueries.md && !$ctrl.mediaQueries.sm && !$ctrl.mediaQueries.xs, \'flex-xl-25\': $ctrl.facetToLeft}"></div><div class="search-elements-wrapper" layout="column" flex flex-sm="85" flex-md="75" flex-lg="65" flex-xl="50" ng-class="(!$ctrl.advancedSearch ?\'simple-mode\' : \'advanced-mode\')  + \' \' + ($ctrl.mainSearchField ? \'has-input\' : \'\') + \' \' + ($ctrl.mediaQueries.lgPlus ? \'flex-lgPlus-55\' : \'\') + \' \' + ($ctrl.facetToLeft? \'facet-to-left-search-bar\' : \'\')"><div class="simple-search-wrapper layout-full-width" ng-hide="$ctrl.advancedSearch"><form class="layout-full-height" layout="column" name="search-form" ng-submit="$ctrl.onSubmit()"><input type="submit" class="accessible-only" tabindex="-1" aria-hidden="true"/><div class="layout-full-width"><div class="search-element-inner layout-full-width"><div class="search-input"><prm-autocomplete class="search-input-container EXLPRMHeaderAutoComplete" md-input-id="searchBar" md-search-text="$ctrl.mainSearchField" md-search-text-change="$ctrl.autocompleteQuery($ctrl.mainSearchField)" md-selected-item="$ctrl.selectedItem" md-selected-item-change="$ctrl.onSelectItem()" md-item-text="item.display || $ctrl.typedQuery " md-min-length="2" md-autofocus="false" md-no-cache="true" md-items="item in $ctrl.autoCompleteItems" md-item-text="item" placeholder="{{$ctrl.placeHolderText}}" clear="{{$ctrl.clearButtonText}}" flex><md-item-template><div ng-if="item.tab"><span md-highlight-text="$ctrl.mainSearchField">{{$ctrl.mainSearchField}}</span><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="magnifying-glass"></prm-icon><span class="suggestion-scope" translate="{{\'tabbedmenu.\'+item.tab+\'.label\'}}"></span></div><div ng-if="!item.tab" md-highlight-text="$ctrl.mainSearchField">{{item.shortDisplay}}</div></md-item-template></prm-autocomplete></div><div class="search-options" ng-class="{\'flex-sm-0 flex-0 hide-on-xs\':!$ctrl.showTabsAndScopesVal(), \'flex-sm-40 visible\':$ctrl.showTabsAndScopesVal()}"><prm-tabs-and-scopes-selector ng-if="$ctrl.showTabsAndScopesVal()" [(selected-scope)]="$ctrl.scopeField" [(selected-tab)]="$ctrl.selectedTab" ng-class="{\'is-displayed\':$ctrl.showTabsAndScopesVal()}" (update-find-in-db-event)="$ctrl.updateShowFindDBButton($event)" (change-tab-event)="$ctrl.onChangeTabEvent($event)"></prm-tabs-and-scopes-selector></div><div class="search-actions" ng-if="::(!$ctrl.scopesDialerConfiguration.display)" layout-align-xs="start center"><md-button class="zero-margin md-icon-button" ng-if="!$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()" hide-gt-xs><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="tune"></prm-icon></md-button><md-button class="zero-margin button-confirm" aria-label="{{$ctrl.getSubmitAriaLabelCode() | translate}}" (click)="$ctrl.onSubmit()"><prm-icon icon-type="{{::$ctrl.searchBoxIcons.searchTextBox.type}}" svg-icon-set="{{::$ctrl.searchBoxIcons.searchTextBox.iconSet}}" icon-definition="{{::$ctrl.searchBoxIcons.searchTextBox.icon}}"></prm-icon></md-button></div></div></div></form></div><div class="advanced-search-wrapper layout-full-width" layout="row" ng-if="$ctrl.advancedSearch" ng-cloak><prm-advanced-search tabindex="0" id="advanced-search" [(selected-scope)]="$ctrl.scopeField" [(selected-tab)]="$ctrl.selectedTab" [(show-tab-and-scopes)]="$ctrl.showTabsAndScopes" [(typed-query)]="$ctrl.mainSearchField" (update-find-in-db-event)="$ctrl.updateShowFindDBButton($event)"></prm-advanced-search><md-button class="switch-to-simple zero-margin md-icon-button" ng-if="$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()" hide-gt-xs><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="close"></prm-icon></md-button></div><div ng-if="$ctrl.isShowFindDBButton || $ctrl.isPreFilterEnable" class="search-extras layout-full-width"><div layout="row" class="pre-filters-container"><prm-pre-filters ng-if="$ctrl.isPreFilterEnable" [(selected-tab)]="$ctrl.selectedTab" [pre-filters]="$ctrl.pFilters" (search-event)="$ctrl.search($event)" flex="" class="ng-scope ng-isolate-scope flex"></prm-pre-filters><span flex ng-if="!$ctrl.isPreFilterEnable"></span><md-button ng-if="$ctrl.isShowFindDBButton" class="button-with-icon" ng-class="{\'button-over-dark\': !$ctrl.advancedSearch}" (click)="::$ctrl.openFdbIframe();" translate-attr-title="mainmenu.label.moreoptions" aria-label="{{::(\'finddb.sb.title\' | translate)}}"><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="database"></prm-icon><span translate="finddb.sb.title"></span></md-button></div></div></div><div class="search-switch-buttons" layout-sm="column" layout-align-sm="start stretch" hide-xs ng-class="{\'facet-to-left-advanced-search\': $ctrl.facetToLeft}"><md-button aria-label="{{\'nui.aria.searchBar.advancedLink\' | translate}}" class="switch-to-advanced zero-margin button-with-icon" ng-if="!$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()"><span layout="row" layout-align="start center"><span translate="label.advanced_search"></span></span></md-button><md-button class="switch-to-simple zero-margin button-with-icon" ng-if="$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()"><span layout="row" layout-align="start center"><span translate="label.simple_search"></span></span></md-button></div><div flex="0" flex-md="0" flex-sm="0" flex-lg="15" flex-xl="15" ng-class="{\'flex-lgPlus-10\': $ctrl.facetToLeft && !$ctrl.mediaQueries.xs}"></div></div><div layout="row" ng-if="!$ctrl.advancedSearch && $ctrl.showSignIn"><div flex="0" flex-md="0" flex-lg="15" flex-xl="20"></div><prm-alert-bar flex [alert-object]="$ctrl.signInAlert"></prm-alert-bar><div class="padding-left-medium" flex="0" flex-md="25" flex-lg="10" flex-xl="15" hide-xs></div><div flex="0" flex-md="0" flex-sm="10" flex-lg="20" flex-xl="20"></div></div></div><div class="advanced-search-backdrop" ng-class="{\'visible\': $ctrl.advancedSearch}"></div><prm-search-bar-after parent-ctrl="$ctrl"></prm-search-bar-after>');
}]);

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

},{"./googleAnalyticsConfig":1,"./kohaAvailabilities.module":2,"./kohaItems.module":3,"./mainmenu.module":5,"./sfxHoldings.module":6,"./viewName":7,"primo-explore-google-analytics":12}],5:[function(require,module,exports){
'use strict';

angular.module('mainmenu', []).component('prmSearchBarAfter', {
	bindings: { parentCtrl: '<' },
	controller: function controller($scope, $http, $element, kohaitemsService) {
		this.$onInit = function () {};
	},
	templateUrl: 'custom/33UDR2_VU1/html/prmSearchBarAfter.html'
});

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Define the view name here.
var viewName = exports.viewName = "33UDR2_VU1";

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
require('./angulartics-google-tag-manager');
module.exports = 'angulartics.google.tagmanager';

},{"./angulartics-google-tag-manager":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
require('./angulartics');
module.exports = 'angulartics';

},{"./angulartics":10}],12:[function(require,module,exports){
'use strict';

require('./js/googleAnalytics.module.js');
module.exports = 'googleAnalytics';

},{"./js/googleAnalytics.module.js":13}],13:[function(require,module,exports){
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

},{"angulartics":11,"angulartics-google-tag-manager":9}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL2dvb2dsZUFuYWx5dGljc0NvbmZpZy5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUF2YWlsYWJpbGl0aWVzLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMva29oYUl0ZW1zLm1vZHVsZS5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvbWFpbi5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvanMvbWFpbm1lbnUubW9kdWxlLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9qcy9zZnhIb2xkaW5ncy5tb2R1bGUuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL2pzL3ZpZXdOYW1lLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyL2xpYi9hbmd1bGFydGljcy1nb29nbGUtdGFnLW1hbmFnZXIuanMiLCJwcmltby1leHBsb3JlL2N1c3RvbS8zM1VEUjJfVlUxL25vZGVfbW9kdWxlcy9hbmd1bGFydGljcy1nb29nbGUtdGFnLW1hbmFnZXIvbGliL2luZGV4LmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvYW5ndWxhcnRpY3Mvc3JjL2FuZ3VsYXJ0aWNzLmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvYW5ndWxhcnRpY3Mvc3JjL2luZGV4LmpzIiwicHJpbW8tZXhwbG9yZS9jdXN0b20vMzNVRFIyX1ZVMS9ub2RlX21vZHVsZXMvcHJpbW8tZXhwbG9yZS1nb29nbGUtYW5hbHl0aWNzL3NyYy9pbmRleC5qcyIsInByaW1vLWV4cGxvcmUvY3VzdG9tLzMzVURSMl9WVTEvbm9kZV9tb2R1bGVzL3ByaW1vLWV4cGxvcmUtZ29vZ2xlLWFuYWx5dGljcy9zcmMvanMvZ29vZ2xlQW5hbHl0aWNzLm1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQU8sSUFBTSx3REFBd0IsT0FBTyxNQUFQLENBQWM7QUFDakQsUUFBTSx1QkFEMkM7QUFFakQsVUFBUTtBQUNOLGdCQUFZO0FBRE47QUFGeUMsQ0FBZCxDQUE5Qjs7Ozs7QUNBUCxRQUFRLE1BQVIsQ0FBZSxvQkFBZixFQUFxQyxFQUFyQyxFQUF5QyxTQUF6QyxDQUFtRCxxQkFBbkQsRUFBMEU7QUFDeEUsWUFBVSxFQUFFLFlBQVksR0FBZCxFQUQ4RDtBQUV4RSxjQUFZLFNBQVMsVUFBVCxDQUFvQixNQUFwQixFQUE0QixLQUE1QixFQUFtQyxRQUFuQyxFQUE2QyxnQkFBN0MsRUFBK0Q7QUFDekUsU0FBSyxPQUFMLEdBQWUsWUFBWTtBQUN6QixhQUFPLFdBQVAsR0FBcUIsS0FBckIsQ0FEeUIsQ0FDRztBQUM1QixVQUFJLE1BQU0sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixJQUF4QixDQUE2QixHQUE3QixDQUFpQyxPQUEzQztBQUNBLFVBQUksSUFBSSxjQUFKLENBQW1CLGdCQUFuQixLQUF3QyxJQUFJLGNBQUosQ0FBbUIsVUFBbkIsQ0FBNUMsRUFBNEU7QUFDMUUsWUFBSSxLQUFLLElBQUksY0FBSixDQUFtQixDQUFuQixDQUFUO0FBQ0EsWUFBSSxTQUFTLElBQUksUUFBSixDQUFhLENBQWIsQ0FBYjtBQUNBLFlBQUksV0FBVyxJQUFJLFFBQUosQ0FBYSxDQUFiLENBQWY7QUFDQSxZQUFJLE9BQU8sT0FBTyxLQUFQLENBQWEsVUFBYixDQUF3QixJQUF4QixDQUE2QixHQUE3QixDQUFpQyxPQUFqQyxDQUF5QyxJQUF6QyxDQUE4QyxDQUE5QyxDQUFYO0FBQ1I7Ozs7QUFJUSxZQUFJLE1BQU0sVUFBVSxhQUFoQixJQUFpQyxR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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsZkE7QUFDQTtBQUNBOzs7O0FDRkEsUUFBUSxnQ0FBUjtBQUNBLE9BQU8sT0FBUCxHQUFpQixpQkFBakI7Ozs7O0FDREE7O0FBQ0E7O0FBRUEsUUFBUSxNQUFSLENBQWUsaUJBQWYsRUFBa0MsQ0FBQyxhQUFELEVBQWdCLCtCQUFoQixDQUFsQyxFQUNHLE9BREgsQ0FDVyxvQkFEWCxFQUNpQyxDQUFDLHVCQUFELEVBQTBCLFVBQVMscUJBQVQsRUFBZ0M7QUFDdkYsTUFBTSw2TkFHZ0Msc0JBQXNCLFVBSHRELFFBQU47QUFJQSxNQUFNLGNBQWMsc0JBQXNCLFlBQXRCLElBQXNDLFdBQTFEOztBQUVBLE1BQU0sOERBQTRELHNCQUFzQixVQUF4RjtBQUNBLE1BQUksd0JBQUo7O0FBRUEsTUFBSSxzQkFBc0IsaUJBQXRCLEtBQTRDLFNBQWhELEVBQTJEO0FBQ3pELHNCQUFrQixVQUFsQjtBQUNELEdBRkQsTUFFTztBQUNMLHNCQUFrQixzQkFBc0IsaUJBQXhDO0FBQ0Q7O0FBRUQsU0FBTztBQUNMLHdCQUFvQixlQURmO0FBRUwsb0JBQWdCLFdBRlg7QUFHTCxnQkFISywwQkFHVTtBQUNiLFVBQUksb0JBQW9CLElBQXhCLEVBQThCO0FBQzVCLFlBQU0sb0JBQW9CLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUExQjtBQUNBLDBCQUFrQixHQUFsQixHQUF3QixlQUF4QjtBQUNBLGlCQUFTLElBQVQsQ0FBYyxXQUFkLENBQTBCLGlCQUExQjtBQUNEOztBQUVELFVBQU0sa0JBQWtCLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUF4QjtBQUNBLHNCQUFnQixJQUFoQixHQUF1QixpQkFBdkI7O0FBRUE7QUFDQSxVQUFJO0FBQ0Ysd0JBQWdCLFdBQWhCLENBQTRCLFNBQVMsY0FBVCxDQUF3QixXQUF4QixDQUE1QjtBQUNELE9BRkQsQ0FFRSxPQUFPLENBQVAsRUFBVTtBQUNWLHdCQUFnQixJQUFoQixHQUF1QixXQUF2QjtBQUNEOztBQUVELGVBQVMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsZUFBMUI7QUFDRDtBQXJCSSxHQUFQO0FBdUJELENBdkM4QixDQURqQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImV4cG9ydCBjb25zdCBnb29nbGVBbmFseXRpY3NDb25maWcgPSBPYmplY3QuZnJlZXplKHtcbiAgbmFtZTogJ2dvb2dsZUFuYWx5dGljc0NvbmZpZycsXG4gIGNvbmZpZzoge1xuICAgIHRyYWNraW5nSWQ6IFwiVUEtNDc4OTQxOS03XCIsXG4gIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdrb2hhQXZhaWxhYmlsaXRpZXMnLCBbXSkuY29tcG9uZW50KCdwcm1CcmllZlJlc3VsdEFmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwga29oYWF2YWlsU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlOyAvKiBkZWZhdWx0IGhpZGVzIHRlbXBsYXRlICovXG4gICAgICB2YXIgb2JqID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbDtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VyZWNvcmRpZFwiKSAmJiBvYmouaGFzT3duUHJvcGVydHkoXCJzb3VyY2VpZFwiKSkge1xuICAgICAgICB2YXIgYm4gPSBvYmouc291cmNlcmVjb3JkaWRbMF07XG4gICAgICAgIHZhciBzb3VyY2UgPSBvYmouc291cmNlaWRbMF07XG4gICAgICAgIHZhciByZWNvcmRpZCA9IG9iai5yZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHR5cGUgPSAkc2NvcGUuJGN0cmwucGFyZW50Q3RybC5pdGVtLnBueC5kaXNwbGF5LnR5cGVbMF07XG4vKlxuICAgICAgICBjb25zb2xlLmxvZyhcInNvdXJjZTpcIiArIGJuKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJiaWJsaW9udW1iZXI6XCIgKyBibik7XG4qL1xuICAgICAgICBpZiAoYm4gJiYgc291cmNlID09IFwiMzNVRFIyX0tPSEFcIiAmJiB0eXBlICE9IFwiam91cm5hbFwiKSB7XG4gICAgICAgICAgdmFyIHVybCA9IFwiaHR0cHM6Ly9jYXRhbG9ndWUuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9qc29uLmdldEl0ZW1zLnBocD9iaWJsaW9udW1iZXI9XCIgKyBibjtcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBrb2hhYXZhaWxTZXJ2aWNlLmdldEtvaGFEYXRhKHVybCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0ICAgICAgICAgaWYocmVzcG9uc2Upe1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtlZFwiKTtcblx0Ly8gICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHQgICAgICAgICAgICB2YXIgaXRlbXMgPSByZXNwb25zZS5kYXRhO1xuXHQgICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtcyk7XG5cdCAgICAgICAgICAgIHZhciBhdmFpbGFiaWxpdHkgPSBpdGVtcy5hdmFpbGFibGU7XG5cdCAgICAgICAgICAgIGNvbnNvbGUubG9nKGF2YWlsYWJpbGl0eSk7XG5cdCAgICAgICAgICAgIGlmIChhdmFpbGFiaWxpdHkgPT09IG51bGwpIHtcblx0ICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0J3MgZmFsc2VcIik7XG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLmtvaGFEaXNwbGF5ID0gdHJ1ZTtcblx0ICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKFwibmctaGlkZVwiKTsgLyogaW5pdGlhbGx5IHNldCBieSAkc2NvcGUua29oYURpc3BsYXk9ZmFsc2UgKi9cblx0ICAgICAgICAgICAgICAkc2NvcGUuc3RhdHVzID0gaXRlbXMuc3RhdHVzO1xuXHQgICAgICAgICAgICAgICRzY29wZS5yZWNvcmRpZCA9IHJlY29yZGlkO1xuXHQgICAgICAgICAgICAgICRzY29wZS5icmFuY2ggPSBpdGVtcy5ob21lYnJhbmNoO1xuXHQgICAgICAgICAgICAgICRzY29wZS5sb2NhdGlvbiA9IGl0ZW1zLmxvY2F0aW9uO1xuXHQgICAgICAgICAgICAgICRzY29wZS5jbGFzcyA9IGl0ZW1zLmNsYXNzO1xuXHQgICAgICAgICAgICAgICRzY29wZS5jYWxsbnVtYmVyID0gaXRlbXMuaXRlbWNhbGxudW1iZXI7XG5cdCAgICAgICAgICAgICAgJHNjb3BlLm90aGVyTG9jYXRpb25zID0gKGl0ZW1zLnRvdGFsIC0gMSk7XG5cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgICB9IFxuICAgIH07XG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1CcmllZlJlc3VsdEFmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdrb2hhYXZhaWxTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIGdldEtvaGFEYXRhOiBmdW5jdGlvbiBnZXRLb2hhRGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgna29oYUl0ZW1zJywgW10pLmNvbXBvbmVudCgncHJtT3BhY0FmdGVyJywge1xuICBiaW5kaW5nczogeyBwYXJlbnRDdHJsOiAnPCcgfSxcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRodHRwLCAkZWxlbWVudCwga29oYWl0ZW1zU2VydmljZSkge1xuICAgIHRoaXMuJG9uSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5rb2hhRGlzcGxheSA9IGZhbHNlOyAvKiBkZWZhdWx0IGhpZGVzIHRlbXBsYXRlICovXG4gICAgICB2YXIgb2JqID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguY29udHJvbDtcbiAgICAgIHZhciBvcGVudXJsO1xuICAgICAgJHNjb3BlLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZXJlY29yZGlkXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcInNvdXJjZWlkXCIpKSB7XG4gICAgICAgIHZhciBibiA9IG9iai5zb3VyY2VyZWNvcmRpZFswXTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IG9iai5zb3VyY2VpZFswXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzb3VyY2UgOlwiK3NvdXJjZSk7XG4gICAgICAgIHZhciB0eXBlID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5wbnguZGlzcGxheS50eXBlWzBdO1xuICAgICAgICBpZiAoYm4gJiYgKHNvdXJjZSA9PSBcIjMzVURSMl9LT0hBXCIgfHwgIWJuLnN0YXJ0c1dpdGgoXCJkZWR1cG1yZ1wiKSkgJiYgdHlwZSAhPSBcImpvdXJuYWxcIikge1xuICAgICAgICAgIHZhciB1cmwgPSBcImh0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9yMm1pY3Jvd3MvanNvbi5nZXRTcnUucGhwP2luZGV4PXJlYy5pZCZxPVwiICsgYm47XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0ga29oYWl0ZW1zU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5pdGVtO1xuICAgICAgICAgICAgdmFyIGtvaGFpZCA9IHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmJpYmxpb251bWJlcjtcbiAgICAgICAgICAgIHZhciBpbWFnZVBhdGggPSByZXNwb25zZS5kYXRhLnJlY29yZFswXS5jb3ZlcjtcbiAgICAgICAgICAgIGlmIChrb2hhaWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHQgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS1vcGFjID4gbWQtdGFicycpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7IFxuICAgICAgICAgICAgICAkc2NvcGUua29oYWlkID0ga29oYWlkO1xuICAgICAgICAgICAgICAkc2NvcGUuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChibiAmJiBzb3VyY2UgPT0gXCIzM1VEUjJfS09IQVwiICYmIHR5cGUgPT0gXCJqb3VybmFsXCIpIHtcblx0ICAgICAgXHR2YXIgdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2pzb24uZ2V0U3J1LnBocD9pbmRleD1qb3VybmFscyZxPVwiKyBibjtcblx0XHQgIFx0dmFyIHJlc3BvbnNlID0ga29oYWl0ZW1zU2VydmljZS5nZXRLb2hhRGF0YSh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLnJlY29yZCAhPSB1bmRlZmluZWQgJiYgcmVzcG9uc2UuZGF0YS5yZWNvcmQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEucmVjb3JkKTtcblx0XHRcdFx0XHQkc2NvcGUubG9hZGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdwcm0tb3BhYyA+IG1kLXRhYnMnKSlbMF0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXHRcdFx0XHRcdCRzY29wZS5rb2hhaG9sZGluZ3MgPSBbXTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCByZXNwb25zZS5kYXRhLnJlY29yZFswXS5ob2xkaW5ncy5sZW5ndGggOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBob2xkaW5nID0gcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0uaG9sZGluZ3NbaV1cblx0XHRcdFx0XHRcdCRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkc2NvcGUua29oYWhvbGRpbmdzW2ldID0ge1xuXHRcdFx0XHRcdFx0XHRcImxpYnJhcnlcIiA6IGhvbGRpbmdbXCJyY3JcIl0sXG5cdFx0XHRcdFx0XHRcdFwiaG9sZGluZ3NcIiA6IGhvbGRpbmdbXCJob2xkaW5nc1wiXVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmIChob2xkaW5nW1wiaG9sZGluZ3NcIl0ubGVuZ3RoID4gODApIHtcblx0XHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXVtcImhvbGRpbmdzU3VtbWFyeVwiXSA9IGhvbGRpbmdbXCJob2xkaW5nc1wiXS5zdWJzdHJpbmcoMCw3NykrXCIuLi5cIjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLnJlY29yZFswXS5sb2NhdGlvbnNbaV1bXCJyY3JcIl0gPT0gIGhvbGRpbmdbXCJyY3JcIl0pIHtcblx0XHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXVtcImNhbGxudW1iZXJcIl0gPSAgcmVzcG9uc2UuZGF0YS5yZWNvcmRbMF0ubG9jYXRpb25zW2ldW1wiY2FsbG51bWJlclwiXTtcblx0XHRcdFx0XHRcdFx0JHNjb3BlLmtvaGFob2xkaW5nc1tpXVtcImxvY2F0aW9uXCJdID1cdHJlc3BvbnNlLmRhdGEucmVjb3JkWzBdLmxvY2F0aW9uc1tpXVtcImxvY2F0aW9uXCJdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHsgIFxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJqb3VybmFsIDogbm8gcHJpbnQgaG9sZGluZ1wiKTtcblx0XHRcdFx0XHRcdCRzY29wZS5sb2FkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0fSk7XG4vKlxuXHRcdFx0dGhpcy5vbkNsaWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCAkd2luZG93Lm9wZW4oJ2h0dHBzOi8vY2F0YWxvZ3VlLmJ1LnVuaXYtcmVubmVzMi5mci9iaWIvJysgYm4sICdfYmxhbmsnKTtcblx0XHRcdH07XG4qL1xuXHRcdH0gXG5cdFx0XG5cdFx0dmFyIGRlbGl2ZXJ5ID0gJHNjb3BlLiRjdHJsLnBhcmVudEN0cmwuaXRlbS5kZWxpdmVyeTtcblx0XHRpZiAoZGVsaXZlcnkgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMCA7IGkgPCBkZWxpdmVyeS5saW5rLmxlbmd0aCA7IGkrKyl7XG5cdFx0XHRcdGlmIChkZWxpdmVyeS5saW5rW2ldLmRpc3BsYXlMYWJlbCA9PSBcIm9wZW51cmxcIikge1xuXHRcdFx0XHRcdG9wZW51cmwgPSBkZWxpdmVyeS5saW5rW2ldLmxpbmtVUkw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9wZW51cmwgIT0gdW5kZWZpbmVkKXtcblx0XHRcdG9wZW51cmwgPSBvcGVudXJsLnJlcGxhY2UoLy4rXFw/LywgXCJcIik7XG5cdFx0XHQkc2NvcGUucHJveGlmaWVkdXJsID0gXCJodHRwczovL2NhdGFsb2d1ZXByZXByb2QuYnUudW5pdi1yZW5uZXMyLmZyL3IybWljcm93cy9nZXRTZngucGhwP1wiK29wZW51cmw7XG5cdFx0XHQkaHR0cC5qc29ucCgkc2NvcGUucHJveGlmaWVkdXJsKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChyZXNwb25zZS5kYXRhLmVycm9yID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdCB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdCB2YXIgbGVuID0ga2V5cy5sZW5ndGg7XG5cdFx0XHRcdFx0IGNvbnNvbGUubG9nKFwiU0ZYIHJlc3VsdHM6IFwiK2xlbik7XG5cdFx0XHRcdFx0IGlmKGxlbiA+IDApIHtcblx0XHRcdFx0XHRcdCAgJHNjb3BlLnNmeGhvbGRpbmdzID0gcmVzcG9uc2UuZGF0YTtcblx0XHRcdFx0XHQgfVxuXHRcdFx0XHR9XG5cdFx0XHR9KS5jYXRjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdFxuXHRcdFxuICAgICAgfSBcbiAgICB9O1xuICB9LFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS8zM1VEUjJfVlUxL2h0bWwvcHJtT3BhY0FmdGVyLmh0bWwnXG59KS5mYWN0b3J5KCdrb2hhaXRlbXNTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIGdldEtvaGFEYXRhOiBmdW5jdGlvbiBnZXRLb2hhRGF0YSh1cmwpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogJ0pTT05QJyxcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKS5ydW4oZnVuY3Rpb24gKCRodHRwKSB7XG4gIC8vIE5lY2Vzc2FyeSBmb3IgcmVxdWVzdHMgdG8gc3VjY2VlZC4uLm5vdCBzdXJlIHdoeVxuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbiA9IHsgJ1gtRnJvbS1FeEwtQVBJLUdhdGV3YXknOiB1bmRlZmluZWQgfTtcbn0pO1xuXG4iLCJpbXBvcnQgJ3ByaW1vLWV4cGxvcmUtZ29vZ2xlLWFuYWx5dGljcyc7XG5pbXBvcnQgeyB2aWV3TmFtZSB9IGZyb20gJy4vdmlld05hbWUnO1xuaW1wb3J0IHsga29oYUl0ZW1zIH0gZnJvbSAnLi9rb2hhSXRlbXMubW9kdWxlJztcbmltcG9ydCB7IGtvaGFBdmFpbGFiaWxpdGllcyB9IGZyb20gJy4va29oYUF2YWlsYWJpbGl0aWVzLm1vZHVsZSc7XG5pbXBvcnQgeyBzZnhIb2xkaW5ncyB9IGZyb20gJy4vc2Z4SG9sZGluZ3MubW9kdWxlJztcbmltcG9ydCB7IGdvb2dsZUFuYWx5dGljc0NvbmZpZyB9IGZyb20gJy4vZ29vZ2xlQW5hbHl0aWNzQ29uZmlnJztcbmltcG9ydCB7IG1haW5tZW51IH0gZnJvbSAnLi9tYWlubWVudS5tb2R1bGUnO1xubGV0IGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd2aWV3Q3VzdG9tJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbmd1bGFyTG9hZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFJdGVtcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2tvaGFBdmFpbGFiaWxpdGllcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NmeEhvbGRpbmdzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWFpbm1lbnUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnb29nbGVBbmFseXRpY3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuXG5hcHBcbiAgLmNvbnN0YW50KGdvb2dsZUFuYWx5dGljc0NvbmZpZy5uYW1lLCBnb29nbGVBbmFseXRpY3NDb25maWcuY29uZmlnKTtcblxuYW5ndWxhci5tb2R1bGUoJ3ByaW1vLWV4cGxvcmUuY29uZmlnJykucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnY29tcG9uZW50cy9zZWFyY2gvdG9wYmFyL3RvcGJhci5odG1sJywnJyk7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCdjb21wb25lbnRzL3NlYXJjaC9zZWFyY2hCYXIvc2VhcmNoLWJhci5odG1sJywnPGRpdiBsYXlvdXQ9XCJjb2x1bW5cIiBsYXlvdXQtZmlsbCB0YWJpbmRleD1cIi0xXCIgcm9sZT1cInNlYXJjaFwiIG5nLWNsYXNzPVwie1xcJ3plcm8tcGFkZGluZ1xcJzogJGN0cmwuc2hvd1RhYnNBbmRTY29wZXNWYWwoKX1cIj48cHJtLWxvZ28gY2xhc3M9XCJoaWRlLXhzIGhpZGUtc20gaGlkZS1tZFwiPjwvcHJtLWxvZ28+PGRpdiBjbGFzcz1cInNlYXJjaC13cmFwcGVyIGRhcmstdG9vbGJhciBwcm0tdG9wLWJhci1jb250YWluZXIgbWFpbi1oZWFkZXItcm93XCIgZGl2IGxheW91dD1cInJvd1wiIG5nLWNsYXNzPVwie1xcJ2ZhY2V0LXRvLWxlZnRcXCc6ICRjdHJsLmZhY2V0VG9MZWZ0ICYmICEkY3RybC5tZWRpYVF1ZXJpZXMueHMgJiYgISRjdHJsLm1lZGlhUXVlcmllcy5zbSAmJiAhJGN0cmwubWVkaWFRdWVyaWVzLm1kfVwiPjxkaXYgZmxleD1cIjBcIiBmbGV4LW1kPVwiMFwiIGZsZXgtbGc9XCIxMFwiIGZsZXgteGw9XCIyMFwiIG5nLWNsYXNzPVwie1xcJ2ZhY2V0LXRvLWxlZnQtc3BhY2VyXFwnOiAkY3RybC5mYWNldFRvTGVmdCAmJiAhJGN0cmwubWVkaWFRdWVyaWVzLnhsICYmICEkY3RybC5tZWRpYVF1ZXJpZXMubWQgJiYgISRjdHJsLm1lZGlhUXVlcmllcy5zbSAmJiAhJGN0cmwubWVkaWFRdWVyaWVzLnhzLCBcXCdmbGV4LXhsLTI1XFwnOiAkY3RybC5mYWNldFRvTGVmdH1cIj48L2Rpdj48ZGl2IGNsYXNzPVwic2VhcmNoLWVsZW1lbnRzLXdyYXBwZXJcIiBsYXlvdXQ9XCJjb2x1bW5cIiBmbGV4IGZsZXgtc209XCI4NVwiIGZsZXgtbWQ9XCI3NVwiIGZsZXgtbGc9XCI2NVwiIGZsZXgteGw9XCI1MFwiIG5nLWNsYXNzPVwiKCEkY3RybC5hZHZhbmNlZFNlYXJjaCA/XFwnc2ltcGxlLW1vZGVcXCcgOiBcXCdhZHZhbmNlZC1tb2RlXFwnKSAgKyBcXCcgXFwnICsgKCRjdHJsLm1haW5TZWFyY2hGaWVsZCA/IFxcJ2hhcy1pbnB1dFxcJyA6IFxcJ1xcJykgKyBcXCcgXFwnICsgKCRjdHJsLm1lZGlhUXVlcmllcy5sZ1BsdXMgPyBcXCdmbGV4LWxnUGx1cy01NVxcJyA6IFxcJ1xcJykgKyBcXCcgXFwnICsgKCRjdHJsLmZhY2V0VG9MZWZ0PyBcXCdmYWNldC10by1sZWZ0LXNlYXJjaC1iYXJcXCcgOiBcXCdcXCcpXCI+PGRpdiBjbGFzcz1cInNpbXBsZS1zZWFyY2gtd3JhcHBlciBsYXlvdXQtZnVsbC13aWR0aFwiIG5nLWhpZGU9XCIkY3RybC5hZHZhbmNlZFNlYXJjaFwiPjxmb3JtIGNsYXNzPVwibGF5b3V0LWZ1bGwtaGVpZ2h0XCIgbGF5b3V0PVwiY29sdW1uXCIgbmFtZT1cInNlYXJjaC1mb3JtXCIgbmctc3VibWl0PVwiJGN0cmwub25TdWJtaXQoKVwiPjxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJhY2Nlc3NpYmxlLW9ubHlcIiB0YWJpbmRleD1cIi0xXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIvPjxkaXYgY2xhc3M9XCJsYXlvdXQtZnVsbC13aWR0aFwiPjxkaXYgY2xhc3M9XCJzZWFyY2gtZWxlbWVudC1pbm5lciBsYXlvdXQtZnVsbC13aWR0aFwiPjxkaXYgY2xhc3M9XCJzZWFyY2gtaW5wdXRcIj48cHJtLWF1dG9jb21wbGV0ZSBjbGFzcz1cInNlYXJjaC1pbnB1dC1jb250YWluZXIgRVhMUFJNSGVhZGVyQXV0b0NvbXBsZXRlXCIgbWQtaW5wdXQtaWQ9XCJzZWFyY2hCYXJcIiBtZC1zZWFyY2gtdGV4dD1cIiRjdHJsLm1haW5TZWFyY2hGaWVsZFwiIG1kLXNlYXJjaC10ZXh0LWNoYW5nZT1cIiRjdHJsLmF1dG9jb21wbGV0ZVF1ZXJ5KCRjdHJsLm1haW5TZWFyY2hGaWVsZClcIiBtZC1zZWxlY3RlZC1pdGVtPVwiJGN0cmwuc2VsZWN0ZWRJdGVtXCIgbWQtc2VsZWN0ZWQtaXRlbS1jaGFuZ2U9XCIkY3RybC5vblNlbGVjdEl0ZW0oKVwiIG1kLWl0ZW0tdGV4dD1cIml0ZW0uZGlzcGxheSB8fCAkY3RybC50eXBlZFF1ZXJ5IFwiIG1kLW1pbi1sZW5ndGg9XCIyXCIgbWQtYXV0b2ZvY3VzPVwiZmFsc2VcIiBtZC1uby1jYWNoZT1cInRydWVcIiBtZC1pdGVtcz1cIml0ZW0gaW4gJGN0cmwuYXV0b0NvbXBsZXRlSXRlbXNcIiBtZC1pdGVtLXRleHQ9XCJpdGVtXCIgcGxhY2Vob2xkZXI9XCJ7eyRjdHJsLnBsYWNlSG9sZGVyVGV4dH19XCIgY2xlYXI9XCJ7eyRjdHJsLmNsZWFyQnV0dG9uVGV4dH19XCIgZmxleD48bWQtaXRlbS10ZW1wbGF0ZT48ZGl2IG5nLWlmPVwiaXRlbS50YWJcIj48c3BhbiBtZC1oaWdobGlnaHQtdGV4dD1cIiRjdHJsLm1haW5TZWFyY2hGaWVsZFwiPnt7JGN0cmwubWFpblNlYXJjaEZpZWxkfX08L3NwYW4+PHBybS1pY29uIGljb24tdHlwZT1cInN2Z1wiIHN2Zy1pY29uLXNldD1cInByaW1vLXVpXCIgaWNvbi1kZWZpbml0aW9uPVwibWFnbmlmeWluZy1nbGFzc1wiPjwvcHJtLWljb24+PHNwYW4gY2xhc3M9XCJzdWdnZXN0aW9uLXNjb3BlXCIgdHJhbnNsYXRlPVwie3tcXCd0YWJiZWRtZW51LlxcJytpdGVtLnRhYitcXCcubGFiZWxcXCd9fVwiPjwvc3Bhbj48L2Rpdj48ZGl2IG5nLWlmPVwiIWl0ZW0udGFiXCIgbWQtaGlnaGxpZ2h0LXRleHQ9XCIkY3RybC5tYWluU2VhcmNoRmllbGRcIj57e2l0ZW0uc2hvcnREaXNwbGF5fX08L2Rpdj48L21kLWl0ZW0tdGVtcGxhdGU+PC9wcm0tYXV0b2NvbXBsZXRlPjwvZGl2PjxkaXYgY2xhc3M9XCJzZWFyY2gtb3B0aW9uc1wiIG5nLWNsYXNzPVwie1xcJ2ZsZXgtc20tMCBmbGV4LTAgaGlkZS1vbi14c1xcJzohJGN0cmwuc2hvd1RhYnNBbmRTY29wZXNWYWwoKSwgXFwnZmxleC1zbS00MCB2aXNpYmxlXFwnOiRjdHJsLnNob3dUYWJzQW5kU2NvcGVzVmFsKCl9XCI+PHBybS10YWJzLWFuZC1zY29wZXMtc2VsZWN0b3IgbmctaWY9XCIkY3RybC5zaG93VGFic0FuZFNjb3Blc1ZhbCgpXCIgWyhzZWxlY3RlZC1zY29wZSldPVwiJGN0cmwuc2NvcGVGaWVsZFwiIFsoc2VsZWN0ZWQtdGFiKV09XCIkY3RybC5zZWxlY3RlZFRhYlwiIG5nLWNsYXNzPVwie1xcJ2lzLWRpc3BsYXllZFxcJzokY3RybC5zaG93VGFic0FuZFNjb3Blc1ZhbCgpfVwiICh1cGRhdGUtZmluZC1pbi1kYi1ldmVudCk9XCIkY3RybC51cGRhdGVTaG93RmluZERCQnV0dG9uKCRldmVudClcIiAoY2hhbmdlLXRhYi1ldmVudCk9XCIkY3RybC5vbkNoYW5nZVRhYkV2ZW50KCRldmVudClcIj48L3BybS10YWJzLWFuZC1zY29wZXMtc2VsZWN0b3I+PC9kaXY+PGRpdiBjbGFzcz1cInNlYXJjaC1hY3Rpb25zXCIgbmctaWY9XCI6OighJGN0cmwuc2NvcGVzRGlhbGVyQ29uZmlndXJhdGlvbi5kaXNwbGF5KVwiIGxheW91dC1hbGlnbi14cz1cInN0YXJ0IGNlbnRlclwiPjxtZC1idXR0b24gY2xhc3M9XCJ6ZXJvLW1hcmdpbiBtZC1pY29uLWJ1dHRvblwiIG5nLWlmPVwiISRjdHJsLmFkdmFuY2VkU2VhcmNoXCIgbmctY2xpY2s9XCIkY3RybC5zd2l0Y2hBZHZhbmNlZFNlYXJjaCgpXCIgaGlkZS1ndC14cz48cHJtLWljb24gaWNvbi10eXBlPVwic3ZnXCIgc3ZnLWljb24tc2V0PVwicHJpbW8tdWlcIiBpY29uLWRlZmluaXRpb249XCJ0dW5lXCI+PC9wcm0taWNvbj48L21kLWJ1dHRvbj48bWQtYnV0dG9uIGNsYXNzPVwiemVyby1tYXJnaW4gYnV0dG9uLWNvbmZpcm1cIiBhcmlhLWxhYmVsPVwie3skY3RybC5nZXRTdWJtaXRBcmlhTGFiZWxDb2RlKCkgfCB0cmFuc2xhdGV9fVwiIChjbGljayk9XCIkY3RybC5vblN1Ym1pdCgpXCI+PHBybS1pY29uIGljb24tdHlwZT1cInt7OjokY3RybC5zZWFyY2hCb3hJY29ucy5zZWFyY2hUZXh0Qm94LnR5cGV9fVwiIHN2Zy1pY29uLXNldD1cInt7OjokY3RybC5zZWFyY2hCb3hJY29ucy5zZWFyY2hUZXh0Qm94Lmljb25TZXR9fVwiIGljb24tZGVmaW5pdGlvbj1cInt7OjokY3RybC5zZWFyY2hCb3hJY29ucy5zZWFyY2hUZXh0Qm94Lmljb259fVwiPjwvcHJtLWljb24+PC9tZC1idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PC9mb3JtPjwvZGl2PjxkaXYgY2xhc3M9XCJhZHZhbmNlZC1zZWFyY2gtd3JhcHBlciBsYXlvdXQtZnVsbC13aWR0aFwiIGxheW91dD1cInJvd1wiIG5nLWlmPVwiJGN0cmwuYWR2YW5jZWRTZWFyY2hcIiBuZy1jbG9haz48cHJtLWFkdmFuY2VkLXNlYXJjaCB0YWJpbmRleD1cIjBcIiBpZD1cImFkdmFuY2VkLXNlYXJjaFwiIFsoc2VsZWN0ZWQtc2NvcGUpXT1cIiRjdHJsLnNjb3BlRmllbGRcIiBbKHNlbGVjdGVkLXRhYildPVwiJGN0cmwuc2VsZWN0ZWRUYWJcIiBbKHNob3ctdGFiLWFuZC1zY29wZXMpXT1cIiRjdHJsLnNob3dUYWJzQW5kU2NvcGVzXCIgWyh0eXBlZC1xdWVyeSldPVwiJGN0cmwubWFpblNlYXJjaEZpZWxkXCIgKHVwZGF0ZS1maW5kLWluLWRiLWV2ZW50KT1cIiRjdHJsLnVwZGF0ZVNob3dGaW5kREJCdXR0b24oJGV2ZW50KVwiPjwvcHJtLWFkdmFuY2VkLXNlYXJjaD48bWQtYnV0dG9uIGNsYXNzPVwic3dpdGNoLXRvLXNpbXBsZSB6ZXJvLW1hcmdpbiBtZC1pY29uLWJ1dHRvblwiIG5nLWlmPVwiJGN0cmwuYWR2YW5jZWRTZWFyY2hcIiBuZy1jbGljaz1cIiRjdHJsLnN3aXRjaEFkdmFuY2VkU2VhcmNoKClcIiBoaWRlLWd0LXhzPjxwcm0taWNvbiBpY29uLXR5cGU9XCJzdmdcIiBzdmctaWNvbi1zZXQ9XCJwcmltby11aVwiIGljb24tZGVmaW5pdGlvbj1cImNsb3NlXCI+PC9wcm0taWNvbj48L21kLWJ1dHRvbj48L2Rpdj48ZGl2IG5nLWlmPVwiJGN0cmwuaXNTaG93RmluZERCQnV0dG9uIHx8ICRjdHJsLmlzUHJlRmlsdGVyRW5hYmxlXCIgY2xhc3M9XCJzZWFyY2gtZXh0cmFzIGxheW91dC1mdWxsLXdpZHRoXCI+PGRpdiBsYXlvdXQ9XCJyb3dcIiBjbGFzcz1cInByZS1maWx0ZXJzLWNvbnRhaW5lclwiPjxwcm0tcHJlLWZpbHRlcnMgbmctaWY9XCIkY3RybC5pc1ByZUZpbHRlckVuYWJsZVwiIFsoc2VsZWN0ZWQtdGFiKV09XCIkY3RybC5zZWxlY3RlZFRhYlwiIFtwcmUtZmlsdGVyc109XCIkY3RybC5wRmlsdGVyc1wiIChzZWFyY2gtZXZlbnQpPVwiJGN0cmwuc2VhcmNoKCRldmVudClcIiBmbGV4PVwiXCIgY2xhc3M9XCJuZy1zY29wZSBuZy1pc29sYXRlLXNjb3BlIGZsZXhcIj48L3BybS1wcmUtZmlsdGVycz48c3BhbiBmbGV4IG5nLWlmPVwiISRjdHJsLmlzUHJlRmlsdGVyRW5hYmxlXCI+PC9zcGFuPjxtZC1idXR0b24gbmctaWY9XCIkY3RybC5pc1Nob3dGaW5kREJCdXR0b25cIiBjbGFzcz1cImJ1dHRvbi13aXRoLWljb25cIiBuZy1jbGFzcz1cIntcXCdidXR0b24tb3Zlci1kYXJrXFwnOiAhJGN0cmwuYWR2YW5jZWRTZWFyY2h9XCIgKGNsaWNrKT1cIjo6JGN0cmwub3BlbkZkYklmcmFtZSgpO1wiIHRyYW5zbGF0ZS1hdHRyLXRpdGxlPVwibWFpbm1lbnUubGFiZWwubW9yZW9wdGlvbnNcIiBhcmlhLWxhYmVsPVwie3s6OihcXCdmaW5kZGIuc2IudGl0bGVcXCcgfCB0cmFuc2xhdGUpfX1cIj48cHJtLWljb24gaWNvbi10eXBlPVwic3ZnXCIgc3ZnLWljb24tc2V0PVwicHJpbW8tdWlcIiBpY29uLWRlZmluaXRpb249XCJkYXRhYmFzZVwiPjwvcHJtLWljb24+PHNwYW4gdHJhbnNsYXRlPVwiZmluZGRiLnNiLnRpdGxlXCI+PC9zcGFuPjwvbWQtYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJzZWFyY2gtc3dpdGNoLWJ1dHRvbnNcIiBsYXlvdXQtc209XCJjb2x1bW5cIiBsYXlvdXQtYWxpZ24tc209XCJzdGFydCBzdHJldGNoXCIgaGlkZS14cyBuZy1jbGFzcz1cIntcXCdmYWNldC10by1sZWZ0LWFkdmFuY2VkLXNlYXJjaFxcJzogJGN0cmwuZmFjZXRUb0xlZnR9XCI+PG1kLWJ1dHRvbiBhcmlhLWxhYmVsPVwie3tcXCdudWkuYXJpYS5zZWFyY2hCYXIuYWR2YW5jZWRMaW5rXFwnIHwgdHJhbnNsYXRlfX1cIiBjbGFzcz1cInN3aXRjaC10by1hZHZhbmNlZCB6ZXJvLW1hcmdpbiBidXR0b24td2l0aC1pY29uXCIgbmctaWY9XCIhJGN0cmwuYWR2YW5jZWRTZWFyY2hcIiBuZy1jbGljaz1cIiRjdHJsLnN3aXRjaEFkdmFuY2VkU2VhcmNoKClcIj48c3BhbiBsYXlvdXQ9XCJyb3dcIiBsYXlvdXQtYWxpZ249XCJzdGFydCBjZW50ZXJcIj48c3BhbiB0cmFuc2xhdGU9XCJsYWJlbC5hZHZhbmNlZF9zZWFyY2hcIj48L3NwYW4+PC9zcGFuPjwvbWQtYnV0dG9uPjxtZC1idXR0b24gY2xhc3M9XCJzd2l0Y2gtdG8tc2ltcGxlIHplcm8tbWFyZ2luIGJ1dHRvbi13aXRoLWljb25cIiBuZy1pZj1cIiRjdHJsLmFkdmFuY2VkU2VhcmNoXCIgbmctY2xpY2s9XCIkY3RybC5zd2l0Y2hBZHZhbmNlZFNlYXJjaCgpXCI+PHNwYW4gbGF5b3V0PVwicm93XCIgbGF5b3V0LWFsaWduPVwic3RhcnQgY2VudGVyXCI+PHNwYW4gdHJhbnNsYXRlPVwibGFiZWwuc2ltcGxlX3NlYXJjaFwiPjwvc3Bhbj48L3NwYW4+PC9tZC1idXR0b24+PC9kaXY+PGRpdiBmbGV4PVwiMFwiIGZsZXgtbWQ9XCIwXCIgZmxleC1zbT1cIjBcIiBmbGV4LWxnPVwiMTVcIiBmbGV4LXhsPVwiMTVcIiBuZy1jbGFzcz1cIntcXCdmbGV4LWxnUGx1cy0xMFxcJzogJGN0cmwuZmFjZXRUb0xlZnQgJiYgISRjdHJsLm1lZGlhUXVlcmllcy54c31cIj48L2Rpdj48L2Rpdj48ZGl2IGxheW91dD1cInJvd1wiIG5nLWlmPVwiISRjdHJsLmFkdmFuY2VkU2VhcmNoICYmICRjdHJsLnNob3dTaWduSW5cIj48ZGl2IGZsZXg9XCIwXCIgZmxleC1tZD1cIjBcIiBmbGV4LWxnPVwiMTVcIiBmbGV4LXhsPVwiMjBcIj48L2Rpdj48cHJtLWFsZXJ0LWJhciBmbGV4IFthbGVydC1vYmplY3RdPVwiJGN0cmwuc2lnbkluQWxlcnRcIj48L3BybS1hbGVydC1iYXI+PGRpdiBjbGFzcz1cInBhZGRpbmctbGVmdC1tZWRpdW1cIiBmbGV4PVwiMFwiIGZsZXgtbWQ9XCIyNVwiIGZsZXgtbGc9XCIxMFwiIGZsZXgteGw9XCIxNVwiIGhpZGUteHM+PC9kaXY+PGRpdiBmbGV4PVwiMFwiIGZsZXgtbWQ9XCIwXCIgZmxleC1zbT1cIjEwXCIgZmxleC1sZz1cIjIwXCIgZmxleC14bD1cIjIwXCI+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cImFkdmFuY2VkLXNlYXJjaC1iYWNrZHJvcFwiIG5nLWNsYXNzPVwie1xcJ3Zpc2libGVcXCc6ICRjdHJsLmFkdmFuY2VkU2VhcmNofVwiPjwvZGl2Pjxwcm0tc2VhcmNoLWJhci1hZnRlciBwYXJlbnQtY3RybD1cIiRjdHJsXCI+PC9wcm0tc2VhcmNoLWJhci1hZnRlcj4nKTtcbn1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5hcHAuY29uZmlnKFsnJHNjZURlbGVnYXRlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHNjZURlbGVnYXRlUHJvdmlkZXIpIHtcbiAgdmFyIHVybFdoaXRlbGlzdCA9ICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KCk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly8qKi5idS51bml2LXJlbm5lczIqKicpO1xuICB1cmxXaGl0ZWxpc3QucHVzaCgnaHR0cHM6Ly9jYXRhbG9ndWVwcmVwcm9kLmJ1LnVuaXYtcmVubmVzMioqJyk7XG4gIHVybFdoaXRlbGlzdC5wdXNoKCdodHRwOi8vc2Z4LXVuaXYtcmVubmVzMi5ob3N0ZWQuZXhsaWJyaXNncm91cCoqJyk7XG4gICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KHVybFdoaXRlbGlzdCk7XG59XSk7XG5cblxuLy8gY2hhbmdlIGFkdmFuY2VkIHNlYXJjaCB0byBqdW1wIHRvIHJlc3VsdHNcbmFwcC5jb250cm9sbGVyKCdwcm1BZHZhbmNlZFNlYXJjaEFmdGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xuLy8gd2F0Y2ggdG8gc2VlIGlmIGFkdmFuY2VkIHNlYXJjaCBpcyB0aGVyZVxuICAgICAgIHZhciBhZHZhbmNlZFNlYXJjaE9icyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgICAgICAgICBtdXRhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihtdXRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgaWYgKCFtdXRhdGlvbi5hZGRlZE5vZGVzKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBtdXRhdGlvbi5hZGRlZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PSBcIkJVVFRPTlwiICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJwcm0tYWR2YW5jZWQtc2VhcmNoIC5idXR0b24tY29uZmlybS5idXR0b24tbGFyZ2UuYnV0dG9uLXdpdGgtaWNvbi5tZC1idXR0b24ubWQtcHJpbW9FeHBsb3JlLXRoZW1lLm1kLWluay1yaXBwbGVcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL25lZWQgYW4gaWQgdG8ganVtcCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJtaXRBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hZHZhbmNlZC1zZWFyY2gtb3V0cHV0LmxheW91dC1yb3cuZmxleFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtaXRBcmVhLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiYWR2YW5jZWRTZWFyY2hTdWJtaXRBcmVhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN1Ym1pdEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJwcm0tYWR2YW5jZWQtc2VhcmNoIC5idXR0b24tY29uZmlybS5idXR0b24tbGFyZ2UuYnV0dG9uLXdpdGgtaWNvbi5tZC1idXR0b24ubWQtcHJpbW9FeHBsb3JlLXRoZW1lLm1kLWluay1yaXBwbGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3YWl0IGZvciBzb21lIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFkdmFuY2VkU2VhcmNoT2JzMiA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9uczIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11dGF0aW9uczIuZm9yRWFjaChmdW5jdGlvbihtdXRhdGlvbjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW11dGF0aW9uMi5hZGRlZE5vZGVzKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9uMi5hZGRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gbXV0YXRpb24yLmFkZGVkTm9kZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09IFwiUFJNLVNFQVJDSC1SRVNVTFQtU09SVC1CWVwiICYmIHdpbmRvdy5pbm5lckhlaWdodCA8IDc3NSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2g9J2FkdmFuY2VkU2VhcmNoU3VibWl0QXJlYSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlZFNlYXJjaE9iczIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWRTZWFyY2hPYnMyLm9ic2VydmUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BybS1leHBsb3JlLW1haW4nKVswXSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHN1YnRyZWU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgYXR0cmlidXRlczogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgY2hhcmFjdGVyRGF0YTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9lbmQgd2FpdCBmb3Igc29tZSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgfSlcbiAgICAgIFxuICAgICAgIGFkdmFuY2VkU2VhcmNoT2JzLm9ic2VydmUoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3BybS1hZHZhbmNlZC1zZWFyY2gnKVswXSwge1xuICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWVcbiAgICAgICAgICAgICAgLCBzdWJ0cmVlOiB0cnVlXG4gICAgICAgICAgICAgICwgYXR0cmlidXRlczogZmFsc2VcbiAgICAgICAgICAgICAgLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZVxuICAgICAgIH0pXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnbWFpbm1lbnUnLCBbXSkuY29tcG9uZW50KCdwcm1TZWFyY2hCYXJBZnRlcicsIHtcblx0YmluZGluZ3M6IHsgcGFyZW50Q3RybDogJzwnIH0sXG5cdGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkaHR0cCwgJGVsZW1lbnQsIGtvaGFpdGVtc1NlcnZpY2UpIHtcblx0XHR0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0fTtcblx0fSxcblx0dGVtcGxhdGVVcmw6ICdjdXN0b20vMzNVRFIyX1ZVMS9odG1sL3BybVNlYXJjaEJhckFmdGVyLmh0bWwnXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnc2Z4SG9sZGluZ3MnLCBbXSkuY29tcG9uZW50KCdwcm1WaWV3T25saW5lQWZ0ZXInLCB7XG4gIGJpbmRpbmdzOiB7IHBhcmVudEN0cmw6ICc8JyB9LFxuICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJGh0dHAsICRlbGVtZW50LCBzZnhob2xkaW5nc1NlcnZpY2UpIHtcbiAgICB0aGlzLiRvbkluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgJHNjb3BlLnNmeGxvYWRpbmcgPSB0cnVlO1xuICAgICAgdmFyIG9iaiA9ICRzY29wZS4kY3RybC5wYXJlbnRDdHJsLml0ZW0ubGlua0VsZW1lbnQubGlua3NbMF07XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KFwiZ2V0SXRUYWJUZXh0XCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImRpc3BsYXlUZXh0XCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImlzTGlua3RvT25saW5lXCIpICYmIG9iai5oYXNPd25Qcm9wZXJ0eShcImxpbmtcIikpIHtcbiAgICAgICAgaWYgKG9ialsnZGlzcGxheVRleHQnXSA9PSBcIm9wZW51cmxmdWxsdGV4dFwiKSB7XG5cdCAgICAgIGNvbnNvbGUubG9nKG9iaik7XG5cdCAgICAgIGNvbnNvbGUubG9nKG9ialsnbGluayddKTtcbiAgICAgICAgICB2YXIgb3BlbnVybCA9IG9ialsnbGluayddO1xuICAgICAgICAgIHZhciBvcGVudXJsU3ZjID0gb3BlbnVybC5yZXBsYWNlKFwiaHR0cDovL2FjY2VkZXIuYnUudW5pdi1yZW5uZXMyLmZyL3NmeF8zM3B1ZWRiXCIsXCJodHRwczovL2NhdGFsb2d1ZS5idS51bml2LXJlbm5lczIuZnIvcjJtaWNyb3dzL2dldFNmeC5waHBcIik7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0gc2Z4aG9sZGluZ3NTZXJ2aWNlLmdldFNmeERhdGEob3BlbnVybFN2YykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBob2xkaW5ncyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBpZiAoaG9sZGluZ3MgPT09IG51bGwpIHtcblx0ICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BybS12aWV3LW9ubGluZSBkaXYgYS5hcnJvdy1saW5rLm1kLXByaW1vRXhwbG9yZS10aGVtZScpKVswXS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7IFxuXHQgICAgICAgICAgJHNjb3BlLnNmeGxvYWRpbmcgPSBmYWxzZTtcbi8vIFx0ICAgICAgICAgIGNvbnNvbGUubG9nKGhvbGRpbmdzKTtcbiAgICAgICAgICAgICAgJHNjb3BlLnNmeGhvbGRpbmdzID0gaG9sZGluZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgICB9IFxuICAgIH07XG4gIH0sXG4gIHRlbXBsYXRlVXJsOiAnY3VzdG9tLzMzVURSMl9WVTEvaHRtbC9wcm1WaWV3T25saW5lQWZ0ZXIuaHRtbCdcbn0pLmZhY3RvcnkoJ3NmeGhvbGRpbmdzU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbiAoJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTZnhEYXRhOiBmdW5jdGlvbiBnZXRTZnhEYXRhKHVybCkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnSlNPTlAnLFxuICAgICAgICB1cmw6IHVybFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV0pLnJ1bihmdW5jdGlvbiAoJGh0dHApIHtcbiAgLy8gTmVjZXNzYXJ5IGZvciByZXF1ZXN0cyB0byBzdWNjZWVkLi4ubm90IHN1cmUgd2h5XG4gICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uID0geyAnWC1Gcm9tLUV4TC1BUEktR2F0ZXdheSc6IHVuZGVmaW5lZCB9O1xufSk7XG4iLCIvLyBEZWZpbmUgdGhlIHZpZXcgbmFtZSBoZXJlLlxuZXhwb3J0IGxldCB2aWV3TmFtZSA9IFwiMzNVRFIyX1ZVMVwiOyIsIi8qKlxuICogQGxpY2Vuc2UgQW5ndWxhcnRpY3MgdjAuMTkuMlxuICogKGMpIDIwMTMgTHVpcyBGYXJ6YXRpIGh0dHA6Ly9sdWlzZmFyemF0aS5naXRodWIuaW8vYW5ndWxhcnRpY3NcbiAqIEdvb2dsZSBUYWcgTWFuYWdlciBQbHVnaW4gQ29udHJpYnV0ZWQgYnkgaHR0cDovL2dpdGh1Yi5jb20vZGFucm93ZTQ5XG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuXG4oZnVuY3Rpb24gKGFuZ3VsYXIpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBvdmVydmlld1xuICAgKiBAbmFtZSBhbmd1bGFydGljcy5nb29nbGUuYW5hbHl0aWNzXG4gICAqIEVuYWJsZXMgYW5hbHl0aWNzIHN1cHBvcnQgZm9yIEdvb2dsZSBUYWcgTWFuYWdlciAoaHR0cDovL2dvb2dsZS5jb20vdGFnbWFuYWdlcilcbiAgICovXG5cbiAgYW5ndWxhci5tb2R1bGUoJ2FuZ3VsYXJ0aWNzLmdvb2dsZS50YWdtYW5hZ2VyJywgWydhbmd1bGFydGljcyddKVxuICAgIC5jb25maWcoWyckYW5hbHl0aWNzUHJvdmlkZXInLCBmdW5jdGlvbiAoJGFuYWx5dGljc1Byb3ZpZGVyKSB7XG5cbiAgICAgICRhbmFseXRpY3NQcm92aWRlci5zZXR0aW5ncy5nYSA9IHtcbiAgICAgICAgdXNlcklkOiBudWxsXG4gICAgICB9O1xuXG4gICAgICAvKipcbiAgICAgICAqIFNlbmQgY29udGVudCB2aWV3cyB0byB0aGUgZGF0YUxheWVyXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggUmVxdWlyZWQgJ2NvbnRlbnQgbmFtZScgKHN0cmluZykgZGVzY3JpYmVzIHRoZSBjb250ZW50IGxvYWRlZFxuICAgICAgICovXG5cbiAgICAgICRhbmFseXRpY3NQcm92aWRlci5yZWdpc3RlclBhZ2VUcmFjayhmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciA9IHdpbmRvdy5kYXRhTGF5ZXIgfHwgW107XG4gICAgICAgIGRhdGFMYXllci5wdXNoKHtcbiAgICAgICAgICAnZXZlbnQnOiAnY29udGVudC12aWV3JyxcbiAgICAgICAgICAnY29udGVudC1uYW1lJzogcGF0aCxcbiAgICAgICAgICAndXNlcklkJzogJGFuYWx5dGljc1Byb3ZpZGVyLnNldHRpbmdzLmdhLnVzZXJJZFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvKipcbiAgICAgICAqIFNlbmQgaW50ZXJhY3Rpb25zIHRvIHRoZSBkYXRhTGF5ZXIsIGkuZS4gZm9yIGV2ZW50IHRyYWNraW5nIGluIEdvb2dsZSBBbmFseXRpY3NcbiAgICAgICAqIEBuYW1lIGV2ZW50VHJhY2tcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uIFJlcXVpcmVkICdhY3Rpb24nIChzdHJpbmcpIGFzc29jaWF0ZWQgd2l0aCB0aGUgZXZlbnRcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wZXJ0aWVzIENvbXByaXNlZCBvZiB0aGUgbWFuZGF0b3J5IGZpZWxkICdjYXRlZ29yeScgKHN0cmluZykgYW5kIG9wdGlvbmFsICBmaWVsZHMgJ2xhYmVsJyAoc3RyaW5nKSwgJ3ZhbHVlJyAoaW50ZWdlcikgYW5kICdub25pbnRlcmFjdGlvbicgKGJvb2xlYW4pXG4gICAgICAgKi9cblxuICAgICAgJGFuYWx5dGljc1Byb3ZpZGVyLnJlZ2lzdGVyRXZlbnRUcmFjayhmdW5jdGlvbiAoYWN0aW9uLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIHZhciBkYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciB8fCBbXTtcbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwge307XG4gICAgICAgIGRhdGFMYXllci5wdXNoKHtcbiAgICAgICAgICAnZXZlbnQnOiBwcm9wZXJ0aWVzLmV2ZW50IHx8ICdpbnRlcmFjdGlvbicsXG4gICAgICAgICAgJ3RhcmdldCc6IHByb3BlcnRpZXMuY2F0ZWdvcnksXG4gICAgICAgICAgJ2FjdGlvbic6IGFjdGlvbixcbiAgICAgICAgICAndGFyZ2V0LXByb3BlcnRpZXMnOiBwcm9wZXJ0aWVzLmxhYmVsLFxuICAgICAgICAgICd2YWx1ZSc6IHByb3BlcnRpZXMudmFsdWUsXG4gICAgICAgICAgJ2ludGVyYWN0aW9uLXR5cGUnOiBwcm9wZXJ0aWVzLm5vbmludGVyYWN0aW9uLFxuICAgICAgICAgICd1c2VySWQnOiAkYW5hbHl0aWNzUHJvdmlkZXIuc2V0dGluZ3MuZ2EudXNlcklkXG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgdXNlcklkIGZvciB1c2Ugd2l0aCBVbml2ZXJzYWwgQW5hbHl0aWNzIFVzZXIgSUQgZmVhdHVyZVxuICAgICAgICogQG5hbWUgc2V0VXNlcm5hbWVcbiAgICAgICAqIFxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCBSZXF1aXJlZCAndXNlcklkJyB2YWx1ZSAoc3RyaW5nKSB1c2VkIHRvIGlkZW50aWZ5IHVzZXIgY3Jvc3MtZGV2aWNlIGluIEdvb2dsZSBBbmFseXRpY3NcbiAgICAgICAqL1xuXG4gICAgICAkYW5hbHl0aWNzUHJvdmlkZXIucmVnaXN0ZXJTZXRVc2VybmFtZShmdW5jdGlvbiAodXNlcklkKSB7XG4gICAgICAgICRhbmFseXRpY3NQcm92aWRlci5zZXR0aW5ncy5nYS51c2VySWQgPSB1c2VySWQ7XG4gICAgICB9KTtcblxuICAgIH1dKTtcblxufSkoYW5ndWxhcik7XG4iLCJyZXF1aXJlKCcuL2FuZ3VsYXJ0aWNzLWdvb2dsZS10YWctbWFuYWdlcicpO1xubW9kdWxlLmV4cG9ydHMgPSAnYW5ndWxhcnRpY3MuZ29vZ2xlLnRhZ21hbmFnZXInO1xuIiwiLyoqXG4gKiBAbGljZW5zZSBBbmd1bGFydGljc1xuICogKGMpIDIwMTMgTHVpcyBGYXJ6YXRpIGh0dHA6Ly9hbmd1bGFydGljcy5naXRodWIuaW8vXG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuKGZ1bmN0aW9uKGFuZ3VsYXIsIGFuYWx5dGljcykge1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5ndWxhcnRpY3MgPSB3aW5kb3cuYW5ndWxhcnRpY3MgfHwgKHdpbmRvdy5hbmd1bGFydGljcyA9IHt9KTtcbmFuZ3VsYXJ0aWNzLndhaXRGb3JWZW5kb3JDb3VudCA9IDA7XG5hbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQXBpID0gZnVuY3Rpb24gKG9iamVjdE5hbWUsIGRlbGF5LCBjb250YWluc0ZpZWxkLCByZWdpc3RlckZuLCBvblRpbWVvdXQpIHtcbiAgaWYgKCFvblRpbWVvdXQpIHsgYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckNvdW50Kys7IH1cbiAgaWYgKCFyZWdpc3RlckZuKSB7IHJlZ2lzdGVyRm4gPSBjb250YWluc0ZpZWxkOyBjb250YWluc0ZpZWxkID0gdW5kZWZpbmVkOyB9XG4gIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHdpbmRvdywgb2JqZWN0TmFtZSkgfHwgKGNvbnRhaW5zRmllbGQgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3dbb2JqZWN0TmFtZV1bY29udGFpbnNGaWVsZF0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckFwaShvYmplY3ROYW1lLCBkZWxheSwgY29udGFpbnNGaWVsZCwgcmVnaXN0ZXJGbiwgdHJ1ZSk7IH0sIGRlbGF5KTtcbiAgfVxuICBlbHNlIHtcbiAgICBhbmd1bGFydGljcy53YWl0Rm9yVmVuZG9yQ291bnQtLTtcbiAgICByZWdpc3RlckZuKHdpbmRvd1tvYmplY3ROYW1lXSk7XG4gIH1cbn07XG5cbi8qKlxuICogQG5nZG9jIG92ZXJ2aWV3XG4gKiBAbmFtZSBhbmd1bGFydGljc1xuICovXG5hbmd1bGFyLm1vZHVsZSgnYW5ndWxhcnRpY3MnLCBbXSlcbi5wcm92aWRlcignJGFuYWx5dGljcycsICRhbmFseXRpY3MpXG4ucnVuKFsnJHJvb3RTY29wZScsICckd2luZG93JywgJyRhbmFseXRpY3MnLCAnJGluamVjdG9yJywgJGFuYWx5dGljc1J1bl0pXG4uZGlyZWN0aXZlKCdhbmFseXRpY3NPbicsIFsnJGFuYWx5dGljcycsIGFuYWx5dGljc09uXSlcbi5jb25maWcoWyckcHJvdmlkZScsIGV4Y2VwdGlvblRyYWNrXSk7XG5cbmZ1bmN0aW9uICRhbmFseXRpY3MoKSB7XG4gIHZhciB2bSA9IHRoaXM7XG5cbiAgdmFyIHNldHRpbmdzID0ge1xuICAgIHBhZ2VUcmFja2luZzoge1xuICAgICAgYXV0b1RyYWNrRmlyc3RQYWdlOiB0cnVlLFxuICAgICAgYXV0b1RyYWNrVmlydHVhbFBhZ2VzOiB0cnVlLFxuICAgICAgdHJhY2tSZWxhdGl2ZVBhdGg6IGZhbHNlLFxuICAgICAgdHJhY2tSb3V0ZXM6IHRydWUsXG4gICAgICB0cmFja1N0YXRlczogdHJ1ZSxcbiAgICAgIGF1dG9CYXNlUGF0aDogZmFsc2UsXG4gICAgICBiYXNlUGF0aDogJycsXG4gICAgICBleGNsdWRlZFJvdXRlczogW10sXG4gICAgICBxdWVyeUtleXNXaGl0ZWxpc3RlZDogW10sXG4gICAgICBxdWVyeUtleXNCbGFja2xpc3RlZDogW10sXG4gICAgICBmaWx0ZXJVcmxTZWdtZW50czogW11cbiAgICB9LFxuICAgIGV2ZW50VHJhY2tpbmc6IHt9LFxuICAgIGJ1ZmZlckZsdXNoRGVsYXk6IDEwMDAsIC8vIFN1cHBvcnQgb25seSBvbmUgY29uZmlndXJhdGlvbiBmb3IgYnVmZmVyIGZsdXNoIGRlbGF5IHRvIHNpbXBsaWZ5IGJ1ZmZlcmluZ1xuICAgIHRyYWNrRXhjZXB0aW9uczogZmFsc2UsXG4gICAgb3B0T3V0OiBmYWxzZSxcbiAgICBkZXZlbG9wZXJNb2RlOiBmYWxzZSAvLyBQcmV2ZW50IHNlbmRpbmcgZGF0YSBpbiBsb2NhbC9kZXZlbG9wbWVudCBlbnZpcm9ubWVudFxuICB9O1xuXG4gIC8vIExpc3Qgb2Yga25vd24gaGFuZGxlcnMgdGhhdCBwbHVnaW5zIGNhbiByZWdpc3RlciB0aGVtc2VsdmVzIGZvclxuICB2YXIga25vd25IYW5kbGVycyA9IFtcbiAgICAncGFnZVRyYWNrJyxcbiAgICAnZXZlbnRUcmFjaycsXG4gICAgJ2V4Y2VwdGlvblRyYWNrJyxcbiAgICAndHJhbnNhY3Rpb25UcmFjaycsXG4gICAgJ3NldEFsaWFzJyxcbiAgICAnc2V0VXNlcm5hbWUnLFxuICAgICdzZXRVc2VyUHJvcGVydGllcycsXG4gICAgJ3NldFVzZXJQcm9wZXJ0aWVzT25jZScsXG4gICAgJ3NldFN1cGVyUHJvcGVydGllcycsXG4gICAgJ3NldFN1cGVyUHJvcGVydGllc09uY2UnLFxuICAgICdpbmNyZW1lbnRQcm9wZXJ0eScsXG4gICAgJ3VzZXJUaW1pbmdzJyxcbiAgICAnY2xlYXJDb29raWVzJ1xuICBdO1xuICAvLyBDYWNoZSBhbmQgaGFuZGxlciBwcm9wZXJ0aWVzIHdpbGwgbWF0Y2ggdmFsdWVzIGluICdrbm93bkhhbmRsZXJzJyBhcyB0aGUgYnVmZmVyaW5nIGZ1bmN0b25zIGFyZSBpbnN0YWxsZWQuXG4gIHZhciBjYWNoZSA9IHt9O1xuICB2YXIgaGFuZGxlcnMgPSB7fTtcbiAgdmFyIGhhbmRsZXJPcHRpb25zID0ge307XG5cbiAgLy8gR2VuZXJhbCBidWZmZXJpbmcgaGFuZGxlclxuICBmdW5jdGlvbiBidWZmZXJlZEhhbmRsZXIoaGFuZGxlck5hbWUpe1xuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgaWYoYW5ndWxhcnRpY3Mud2FpdEZvclZlbmRvckNvdW50KXtcbiAgICAgICAgaWYoIWNhY2hlW2hhbmRsZXJOYW1lXSl7IGNhY2hlW2hhbmRsZXJOYW1lXSA9IFtdOyB9XG4gICAgICAgIGNhY2hlW2hhbmRsZXJOYW1lXS5wdXNoKGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIEFzIGhhbmRsZXJzIGFyZSBpbnN0YWxsZWQgYnkgcGx1Z2lucywgdGhleSBnZXQgcHVzaGVkIGludG8gYSBsaXN0IGFuZCBpbnZva2VkIGluIG9yZGVyLlxuICBmdW5jdGlvbiB1cGRhdGVIYW5kbGVycyhoYW5kbGVyTmFtZSwgZm4sIG9wdGlvbnMpe1xuICAgIGlmKCFoYW5kbGVyc1toYW5kbGVyTmFtZV0pe1xuICAgICAgaGFuZGxlcnNbaGFuZGxlck5hbWVdID0gW107XG4gICAgfVxuICAgIGhhbmRsZXJzW2hhbmRsZXJOYW1lXS5wdXNoKGZuKTtcbiAgICBoYW5kbGVyT3B0aW9uc1tmbl0gPSBvcHRpb25zO1xuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgaWYoIXRoaXMuc2V0dGluZ3Mub3B0T3V0KSB7XG4gICAgICAgIHZhciBoYW5kbGVyQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcy4kaW5qZWN0KFsnJHEnLCBhbmd1bGFyLmJpbmQodGhpcywgZnVuY3Rpb24oJHEpIHtcbiAgICAgICAgICByZXR1cm4gJHEuYWxsKGhhbmRsZXJzW2hhbmRsZXJOYW1lXS5tYXAoZnVuY3Rpb24oaGFuZGxlckZuKSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IGhhbmRsZXJPcHRpb25zW2hhbmRsZXJGbl0gfHwge307XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hc3luYykge1xuICAgICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICB2YXIgY3VycmVudEFyZ3MgPSBhbmd1bGFyLmNvcHkoaGFuZGxlckFyZ3MpO1xuICAgICAgICAgICAgICBjdXJyZW50QXJncy51bnNoaWZ0KGRlZmVycmVkLnJlc29sdmUpO1xuICAgICAgICAgICAgICBoYW5kbGVyRm4uYXBwbHkodGhpcywgY3VycmVudEFyZ3MpO1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIH0gZWxzZXtcbiAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oaGFuZGxlckZuLmFwcGx5KHRoaXMsIGhhbmRsZXJBcmdzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB9KV0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBUaGUgYXBpIChyZXR1cm5lZCBieSB0aGlzIHByb3ZpZGVyKSBnZXRzIHBvcHVsYXRlZCB3aXRoIGhhbmRsZXJzIGJlbG93LlxuICB2YXIgYXBpID0ge1xuICAgIHNldHRpbmdzOiBzZXR0aW5nc1xuICB9O1xuXG4gIC8vIE9wdCBpbiBhbmQgb3B0IG91dCBmdW5jdGlvbnNcbiAgYXBpLnNldE9wdE91dCA9IGZ1bmN0aW9uKG9wdE91dCkge1xuICAgIHRoaXMuc2V0dGluZ3Mub3B0T3V0ID0gb3B0T3V0O1xuICAgIHRyaWdnZXJSZWdpc3RlcigpO1xuICB9O1xuXG4gIGFwaS5nZXRPcHRPdXQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy5vcHRPdXQ7XG4gIH07XG5cblxuICAvLyBXaWxsIHJ1biBzZXRUaW1lb3V0IGlmIGRlbGF5IGlzID4gMFxuICAvLyBSdW5zIGltbWVkaWF0ZWx5IGlmIG5vIGRlbGF5IHRvIG1ha2Ugc3VyZSBjYWNoZS9idWZmZXIgaXMgZmx1c2hlZCBiZWZvcmUgYW55dGhpbmcgZWxzZS5cbiAgLy8gUGx1Z2lucyBzaG91bGQgdGFrZSBjYXJlIHRvIHJlZ2lzdGVyIGhhbmRsZXJzIGJ5IG9yZGVyIG9mIHByZWNlZGVuY2UuXG4gIGZ1bmN0aW9uIG9uVGltZW91dChmbiwgZGVsYXkpe1xuICAgIGlmKGRlbGF5KXtcbiAgICAgIHNldFRpbWVvdXQoZm4sIGRlbGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm4oKTtcbiAgICB9XG4gIH1cblxuICB2YXIgcHJvdmlkZXIgPSB7XG4gICAgJGdldDogWyckaW5qZWN0b3InLCBmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgIHJldHVybiBhcGlXaXRoSW5qZWN0b3IoJGluamVjdG9yKTtcbiAgICB9XSxcbiAgICBhcGk6IGFwaSxcbiAgICBzZXR0aW5nczogc2V0dGluZ3MsXG4gICAgdmlydHVhbFBhZ2V2aWV3czogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9UcmFja1ZpcnR1YWxQYWdlcyA9IHZhbHVlOyB9LFxuICAgIHRyYWNrU3RhdGVzOiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcudHJhY2tTdGF0ZXMgPSB2YWx1ZTsgfSxcbiAgICB0cmFja1JvdXRlczogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrUm91dGVzID0gdmFsdWU7IH0sXG4gICAgZXhjbHVkZVJvdXRlczogZnVuY3Rpb24ocm91dGVzKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmV4Y2x1ZGVkUm91dGVzID0gcm91dGVzOyB9LFxuICAgIHF1ZXJ5S2V5c1doaXRlbGlzdDogZnVuY3Rpb24oa2V5cykgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5xdWVyeUtleXNXaGl0ZWxpc3RlZCA9IGtleXM7IH0sXG4gICAgcXVlcnlLZXlzQmxhY2tsaXN0OiBmdW5jdGlvbihrZXlzKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLnF1ZXJ5S2V5c0JsYWNrbGlzdGVkID0ga2V5czsgfSxcbiAgICBmaWx0ZXJVcmxTZWdtZW50czogZnVuY3Rpb24oZmlsdGVycykgeyB0aGlzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5maWx0ZXJVcmxTZWdtZW50cyA9IGZpbHRlcnM7IH0sXG4gICAgZmlyc3RQYWdldmlldzogZnVuY3Rpb24gKHZhbHVlKSB7IHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9UcmFja0ZpcnN0UGFnZSA9IHZhbHVlOyB9LFxuICAgIHdpdGhCYXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoID0gKHZhbHVlKSA/IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkuZmluZCgnYmFzZScpLmF0dHIoJ2hyZWYnKSA6ICcnO1xuICAgIH0sXG4gICAgd2l0aEF1dG9CYXNlOiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b0Jhc2VQYXRoID0gdmFsdWU7IH0sXG4gICAgdHJhY2tFeGNlcHRpb25zOiBmdW5jdGlvbiAodmFsdWUpIHsgdGhpcy5zZXR0aW5ncy50cmFja0V4Y2VwdGlvbnMgPSB2YWx1ZTsgfSxcbiAgICBkZXZlbG9wZXJNb2RlOiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLnNldHRpbmdzLmRldmVsb3Blck1vZGUgPSB2YWx1ZTsgfVxuICB9O1xuXG4gIC8vIEdlbmVyYWwgZnVuY3Rpb24gdG8gcmVnaXN0ZXIgcGx1Z2luIGhhbmRsZXJzLiBGbHVzaGVzIGJ1ZmZlcnMgaW1tZWRpYXRlbHkgdXBvbiByZWdpc3RyYXRpb24gYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgZGVsYXkuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyKGhhbmRsZXJOYW1lLCBmbiwgb3B0aW9ucyl7XG4gICAgLy8gRG8gbm90IGFkZCBhIGhhbmRsZXIgaWYgZGV2ZWxvcGVyTW9kZSBpcyB0cnVlXG4gICAgaWYgKHNldHRpbmdzLmRldmVsb3Blck1vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhcGlbaGFuZGxlck5hbWVdID0gdXBkYXRlSGFuZGxlcnMoaGFuZGxlck5hbWUsIGZuLCBvcHRpb25zKTtcbiAgICB2YXIgaGFuZGxlclNldHRpbmdzID0gc2V0dGluZ3NbaGFuZGxlck5hbWVdO1xuICAgIHZhciBoYW5kbGVyRGVsYXkgPSAoaGFuZGxlclNldHRpbmdzKSA/IGhhbmRsZXJTZXR0aW5ncy5idWZmZXJGbHVzaERlbGF5IDogbnVsbDtcbiAgICB2YXIgZGVsYXkgPSAoaGFuZGxlckRlbGF5ICE9PSBudWxsKSA/IGhhbmRsZXJEZWxheSA6IHNldHRpbmdzLmJ1ZmZlckZsdXNoRGVsYXk7XG4gICAgYW5ndWxhci5mb3JFYWNoKGNhY2hlW2hhbmRsZXJOYW1lXSwgZnVuY3Rpb24gKGFyZ3MsIGluZGV4KSB7XG4gICAgICBvblRpbWVvdXQoZnVuY3Rpb24gKCkgeyBmbi5hcHBseSh0aGlzLCBhcmdzKTsgfSwgaW5kZXggKiBkZWxheSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYXBpdGFsaXplKGlucHV0KSB7XG4gICAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvXi4vLCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICByZXR1cm4gbWF0Y2gudG9VcHBlckNhc2UoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy9wcm92aWRlIGEgbWV0aG9kIHRvIGluamVjdCBzZXJ2aWNlcyBpbnRvIGhhbmRsZXJzXG4gIHZhciBhcGlXaXRoSW5qZWN0b3IgPSBmdW5jdGlvbihpbmplY3Rvcikge1xuICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZChhcGksIHtcbiAgICAgICckaW5qZWN0JzogaW5qZWN0b3IuaW52b2tlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQWRkcyB0byB0aGUgcHJvdmlkZXIgYSAncmVnaXN0ZXIje2hhbmRsZXJOYW1lfScgZnVuY3Rpb24gdGhhdCBtYW5hZ2VzIG11bHRpcGxlIHBsdWdpbnMgYW5kIGJ1ZmZlciBmbHVzaGluZy5cbiAgZnVuY3Rpb24gaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKGhhbmRsZXJOYW1lKXtcbiAgICB2YXIgcmVnaXN0ZXJOYW1lID0gJ3JlZ2lzdGVyJytjYXBpdGFsaXplKGhhbmRsZXJOYW1lKTtcbiAgICBwcm92aWRlcltyZWdpc3Rlck5hbWVdID0gZnVuY3Rpb24oZm4sIG9wdGlvbnMpe1xuICAgICAgcmVnaXN0ZXIoaGFuZGxlck5hbWUsIGZuLCBvcHRpb25zKTtcbiAgICB9O1xuICAgIGFwaVtoYW5kbGVyTmFtZV0gPSB1cGRhdGVIYW5kbGVycyhoYW5kbGVyTmFtZSwgYnVmZmVyZWRIYW5kbGVyKGhhbmRsZXJOYW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydFJlZ2lzdGVyaW5nKF9wcm92aWRlciwgX2tub3duSGFuZGxlcnMsIF9pbnN0YWxsSGFuZGxlclJlZ2lzdGVyRnVuY3Rpb24pIHtcbiAgICBhbmd1bGFyLmZvckVhY2goX2tub3duSGFuZGxlcnMsIF9pbnN0YWxsSGFuZGxlclJlZ2lzdGVyRnVuY3Rpb24pO1xuXG4gICAgZm9yICh2YXIga2V5IGluIF9wcm92aWRlcikge1xuICAgICAgdm1ba2V5XSA9IF9wcm92aWRlcltrZXldO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFsbG93ICRhbmd1bGFydGljcyB0byB0cmlnZ2VyIHRoZSByZWdpc3RlciB0byB1cGRhdGUgb3B0IGluL291dFxuICB2YXIgdHJpZ2dlclJlZ2lzdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgc3RhcnRSZWdpc3RlcmluZyhwcm92aWRlciwga25vd25IYW5kbGVycywgaW5zdGFsbEhhbmRsZXJSZWdpc3RlckZ1bmN0aW9uKTtcbiAgfTtcblxuICAvLyBJbml0aWFsIHJlZ2lzdGVyXG4gIHN0YXJ0UmVnaXN0ZXJpbmcocHJvdmlkZXIsIGtub3duSGFuZGxlcnMsIGluc3RhbGxIYW5kbGVyUmVnaXN0ZXJGdW5jdGlvbik7XG5cbn1cblxuZnVuY3Rpb24gJGFuYWx5dGljc1J1bigkcm9vdFNjb3BlLCAkd2luZG93LCAkYW5hbHl0aWNzLCAkaW5qZWN0b3IpIHtcblxuICBmdW5jdGlvbiBtYXRjaGVzRXhjbHVkZWRSb3V0ZSh1cmwpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmV4Y2x1ZGVkUm91dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZXhjbHVkZWRSb3V0ZSA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmV4Y2x1ZGVkUm91dGVzW2ldO1xuICAgICAgaWYgKChleGNsdWRlZFJvdXRlIGluc3RhbmNlb2YgUmVnRXhwICYmIGV4Y2x1ZGVkUm91dGUudGVzdCh1cmwpKSB8fCB1cmwuaW5kZXhPZihleGNsdWRlZFJvdXRlKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBhcnJheURpZmZlcmVuY2UoYTEsIGEyKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYTEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhMi5pbmRleE9mKGExW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goYTFbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsdGVyUXVlcnlTdHJpbmcodXJsLCBrZXlzTWF0Y2hBcnIsIHRoaXNUeXBlKXtcbiAgICBpZiAoL1xcPy8udGVzdCh1cmwpICYmIGtleXNNYXRjaEFyci5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgdXJsQXJyID0gdXJsLnNwbGl0KCc/Jyk7XG4gICAgICB2YXIgdXJsQmFzZSA9IHVybEFyclswXTtcbiAgICAgIHZhciBwYWlycyA9IHVybEFyclsxXS5zcGxpdCgnJicpO1xuICAgICAgdmFyIG1hdGNoZWRQYWlycyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXNNYXRjaEFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbGlzdGVkS2V5ID0ga2V5c01hdGNoQXJyW2ldO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBhaXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKChsaXN0ZWRLZXkgaW5zdGFuY2VvZiBSZWdFeHAgJiYgbGlzdGVkS2V5LnRlc3QocGFpcnNbal0pKSB8fCBwYWlyc1tqXS5pbmRleE9mKGxpc3RlZEtleSkgPiAtMSkgbWF0Y2hlZFBhaXJzLnB1c2gocGFpcnNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBtYXRjaGVkUGFpcnNBcnIgPSAodGhpc1R5cGUgPT0gJ3doaXRlJyA/IG1hdGNoZWRQYWlycyA6IGFycmF5RGlmZmVyZW5jZShwYWlycyxtYXRjaGVkUGFpcnMpKTtcbiAgICAgIGlmKG1hdGNoZWRQYWlyc0Fyci5sZW5ndGggPiAwKXtcbiAgICAgICAgcmV0dXJuIHVybEJhc2UgKyAnPycgKyBtYXRjaGVkUGFpcnNBcnIuam9pbignJicpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiB1cmxCYXNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdXJsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdoaXRlbGlzdFF1ZXJ5U3RyaW5nKHVybCl7XG4gICAgcmV0dXJuIGZpbHRlclF1ZXJ5U3RyaW5nKHVybCwgJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcucXVlcnlLZXlzV2hpdGVsaXN0ZWQsICd3aGl0ZScpO1xuICB9XG5cbiAgZnVuY3Rpb24gYmxhY2tsaXN0UXVlcnlTdHJpbmcodXJsKXtcbiAgICByZXR1cm4gZmlsdGVyUXVlcnlTdHJpbmcodXJsLCAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5xdWVyeUtleXNCbGFja2xpc3RlZCwgJ2JsYWNrJyk7XG4gIH1cblxuICBmdW5jdGlvbiBmaWx0ZXJVcmxTZWdtZW50cyh1cmwpe1xuICAgIHZhciBzZWdtZW50RmlsdGVyc0FyciA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmZpbHRlclVybFNlZ21lbnRzO1xuXG4gICAgaWYgKHNlZ21lbnRGaWx0ZXJzQXJyLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciB1cmxBcnIgPSB1cmwuc3BsaXQoJz8nKTtcbiAgICAgIHZhciB1cmxCYXNlID0gdXJsQXJyWzBdO1xuXG4gICAgICB2YXIgc2VnbWVudHMgPSB1cmxCYXNlLnNwbGl0KCcvJyk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VnbWVudEZpbHRlcnNBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNlZ21lbnRGaWx0ZXIgPSBzZWdtZW50RmlsdGVyc0FycltpXTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHNlZ21lbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgLyogRmlyc3Qgc2VnbWVudCB3aWxsIGJlIGhvc3QvcHJvdG9jb2wgb3IgYmFzZSBwYXRoLiAqL1xuICAgICAgICAgIGlmICgoc2VnbWVudEZpbHRlciBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBzZWdtZW50RmlsdGVyLnRlc3Qoc2VnbWVudHNbal0pKSB8fCBzZWdtZW50c1tqXS5pbmRleE9mKHNlZ21lbnRGaWx0ZXIpID4gLTEpIHtcbiAgICAgICAgICAgIHNlZ21lbnRzW2pdID0gJ0ZJTFRFUkVEJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pIHtcbiAgICBpZiAoIW1hdGNoZXNFeGNsdWRlZFJvdXRlKHVybCkpIHtcbiAgICAgIHVybCA9IHdoaXRlbGlzdFF1ZXJ5U3RyaW5nKHVybCk7XG4gICAgICB1cmwgPSBibGFja2xpc3RRdWVyeVN0cmluZyh1cmwpO1xuICAgICAgdXJsID0gZmlsdGVyVXJsU2VnbWVudHModXJsKTtcbiAgICAgICRhbmFseXRpY3MucGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b1RyYWNrRmlyc3RQYWdlKSB7XG4gICAgLyogT25seSB0cmFjayB0aGUgJ2ZpcnN0IHBhZ2UnIGlmIHRoZXJlIGFyZSBubyByb3V0ZXMgb3Igc3RhdGVzIG9uIHRoZSBwYWdlICovXG4gICAgdmFyIG5vUm91dGVzT3JTdGF0ZXMgPSB0cnVlO1xuICAgIGlmICgkaW5qZWN0b3IuaGFzKCckcm91dGUnKSkge1xuICAgICAgIHZhciAkcm91dGUgPSAkaW5qZWN0b3IuZ2V0KCckcm91dGUnKTtcbiAgICAgICBpZiAoJHJvdXRlKSB7XG4gICAgICAgIGZvciAodmFyIHJvdXRlIGluICRyb3V0ZS5yb3V0ZXMpIHtcbiAgICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICB9IGVsc2UgaWYgKCRyb3V0ZSA9PT0gbnVsbCl7XG4gICAgICAgIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICAgICB9XG4gICAgfSBlbHNlIGlmICgkaW5qZWN0b3IuaGFzKCckc3RhdGUnKSkge1xuICAgICAgdmFyICRzdGF0ZSA9ICRpbmplY3Rvci5nZXQoJyRzdGF0ZScpO1xuICAgICAgaWYgKCRzdGF0ZS5nZXQoKS5sZW5ndGggPiAxKSBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChub1JvdXRlc09yU3RhdGVzKSB7XG4gICAgICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b0Jhc2VQYXRoKSB7XG4gICAgICAgICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoID0gJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICAgIH1cbiAgICAgICRpbmplY3Rvci5pbnZva2UoWyckbG9jYXRpb24nLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG4gICAgICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1JlbGF0aXZlUGF0aCkge1xuICAgICAgICAgIHZhciB1cmwgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCArICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhZ2VUcmFjaygkbG9jYXRpb24uYWJzVXJsKCksICRsb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1dKTtcbiAgICB9XG4gIH1cblxuICBpZiAoJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYXV0b1RyYWNrVmlydHVhbFBhZ2VzKSB7XG4gICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmF1dG9CYXNlUGF0aCkge1xuICAgICAgLyogQWRkIHRoZSBmdWxsIHJvdXRlIHRvIHRoZSBiYXNlLiAqL1xuICAgICAgJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggPSAkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgXCIjXCI7XG4gICAgfVxuICAgIHZhciBub1JvdXRlc09yU3RhdGVzID0gdHJ1ZTtcblxuICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1JvdXRlcykge1xuICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJyRyb3V0ZScpKSB7XG4gICAgICAgIHZhciAkcm91dGUgPSAkaW5qZWN0b3IuZ2V0KCckcm91dGUnKTtcbiAgICAgICAgaWYgKCRyb3V0ZSkge1xuICAgICAgICAgIGZvciAodmFyIHJvdXRlIGluICRyb3V0ZS5yb3V0ZXMpIHtcbiAgICAgICAgICAgIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgkcm91dGUgPT09IG51bGwpe1xuICAgICAgICAgIG5vUm91dGVzT3JTdGF0ZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uIChldmVudCwgY3VycmVudCkge1xuICAgICAgICAgIGlmIChjdXJyZW50ICYmIChjdXJyZW50LiQkcm91dGV8fGN1cnJlbnQpLnJlZGlyZWN0VG8pIHJldHVybjtcbiAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICAgICAgdmFyIHVybCA9ICRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLmJhc2VQYXRoICsgJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgICAgcGFnZVRyYWNrKHVybCwgJGxvY2F0aW9uKTtcbiAgICAgICAgICB9XSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy50cmFja1N0YXRlcykge1xuICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJyRzdGF0ZScpICYmICEkaW5qZWN0b3IuaGFzKCckdHJhbnNpdGlvbnMnKSkge1xuICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24gKGV2ZW50LCBjdXJyZW50KSB7XG4gICAgICAgICAgJGluamVjdG9yLmludm9rZShbJyRsb2NhdGlvbicsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCArICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICAgIHBhZ2VUcmFjayh1cmwsICRsb2NhdGlvbik7XG4gICAgICAgICAgfV0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCckc3RhdGUnKSAmJiAkaW5qZWN0b3IuaGFzKCckdHJhbnNpdGlvbnMnKSkge1xuICAgICAgICBub1JvdXRlc09yU3RhdGVzID0gZmFsc2U7XG4gICAgICAgICRpbmplY3Rvci5pbnZva2UoWyckdHJhbnNpdGlvbnMnLCBmdW5jdGlvbigkdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgICAkdHJhbnNpdGlvbnMub25TdWNjZXNzKHt9LCBmdW5jdGlvbigkdHJhbnNpdGlvbiQpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2l0aW9uT3B0aW9ucyA9ICR0cmFuc2l0aW9uJC5vcHRpb25zKCk7XG5cbiAgICAgICAgICAgIC8vIG9ubHkgdHJhY2sgZm9yIHRyYW5zaXRpb25zIHRoYXQgd291bGQgaGF2ZSB0cmlnZ2VyZWQgJHN0YXRlQ2hhbmdlU3VjY2Vzc1xuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb25PcHRpb25zLm5vdGlmeSkge1xuICAgICAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKFsnJGxvY2F0aW9uJywgZnVuY3Rpb24gKCRsb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciB1cmwgPSAkYW5hbHl0aWNzLnNldHRpbmdzLnBhZ2VUcmFja2luZy5iYXNlUGF0aCArICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICAgICAgICBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1dKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobm9Sb3V0ZXNPclN0YXRlcykge1xuICAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbiAoZXZlbnQsIGN1cnJlbnQpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQgJiYgKGN1cnJlbnQuJCRyb3V0ZSB8fCBjdXJyZW50KS5yZWRpcmVjdFRvKSByZXR1cm47XG4gICAgICAgICRpbmplY3Rvci5pbnZva2UoWyckbG9jYXRpb24nLCBmdW5jdGlvbiAoJGxvY2F0aW9uKSB7XG4gICAgICAgICAgaWYgKCRhbmFseXRpY3Muc2V0dGluZ3MucGFnZVRyYWNraW5nLnRyYWNrUmVsYXRpdmVQYXRoKSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gJGFuYWx5dGljcy5zZXR0aW5ncy5wYWdlVHJhY2tpbmcuYmFzZVBhdGggKyAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgICBwYWdlVHJhY2sodXJsLCAkbG9jYXRpb24pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdlVHJhY2soJGxvY2F0aW9uLmFic1VybCgpLCAkbG9jYXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfV0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLmRldmVsb3Blck1vZGUpIHtcbiAgICBhbmd1bGFyLmZvckVhY2goJGFuYWx5dGljcywgZnVuY3Rpb24oYXR0ciwgbmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiBhdHRyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICRhbmFseXRpY3NbbmFtZV0gPSBmdW5jdGlvbigpe307XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5hbHl0aWNzT24oJGFuYWx5dGljcykge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xuICAgICAgdmFyIGV2ZW50VHlwZSA9ICRhdHRycy5hbmFseXRpY3NPbiB8fCAnY2xpY2snO1xuICAgICAgdmFyIHRyYWNraW5nRGF0YSA9IHt9O1xuXG4gICAgICBhbmd1bGFyLmZvckVhY2goJGF0dHJzLiRhdHRyLCBmdW5jdGlvbihhdHRyLCBuYW1lKSB7XG4gICAgICAgIGlmIChpc1Byb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgdHJhY2tpbmdEYXRhW3Byb3BlcnR5TmFtZShuYW1lKV0gPSAkYXR0cnNbbmFtZV07XG4gICAgICAgICAgJGF0dHJzLiRvYnNlcnZlKG5hbWUsIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgIHRyYWNraW5nRGF0YVtwcm9wZXJ0eU5hbWUobmFtZSldID0gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoJGVsZW1lbnRbMF0pLm9uKGV2ZW50VHlwZSwgZnVuY3Rpb24gKCRldmVudCkge1xuICAgICAgICB2YXIgZXZlbnROYW1lID0gJGF0dHJzLmFuYWx5dGljc0V2ZW50IHx8IGluZmVyRXZlbnROYW1lKCRlbGVtZW50WzBdKTtcbiAgICAgICAgdHJhY2tpbmdEYXRhLmV2ZW50VHlwZSA9ICRldmVudC50eXBlO1xuXG4gICAgICAgIGlmKCRhdHRycy5hbmFseXRpY3NJZil7XG4gICAgICAgICAgaWYoISAkc2NvcGUuJGV2YWwoJGF0dHJzLmFuYWx5dGljc0lmKSl7XG4gICAgICAgICAgICByZXR1cm47IC8vIENhbmNlbCB0aGlzIGV2ZW50IGlmIHdlIGRvbid0IHBhc3MgdGhlIGFuYWx5dGljcy1pZiBjb25kaXRpb25cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsb3cgY29tcG9uZW50cyB0byBwYXNzIHRocm91Z2ggYW4gZXhwcmVzc2lvbiB0aGF0IGdldHMgbWVyZ2VkIG9uIHRvIHRoZSBldmVudCBwcm9wZXJ0aWVzXG4gICAgICAgIC8vIGVnLiBhbmFseXRpY3MtcHJvcGVyaXRlcz0nbXlDb21wb25lbnRTY29wZS5zb21lQ29uZmlnRXhwcmVzc2lvbi4kYW5hbHl0aWNzUHJvcGVydGllcydcbiAgICAgICAgaWYoJGF0dHJzLmFuYWx5dGljc1Byb3BlcnRpZXMpe1xuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRyYWNraW5nRGF0YSwgJHNjb3BlLiRldmFsKCRhdHRycy5hbmFseXRpY3NQcm9wZXJ0aWVzKSk7XG4gICAgICAgIH1cbiAgICAgICAgJGFuYWx5dGljcy5ldmVudFRyYWNrKGV2ZW50TmFtZSwgdHJhY2tpbmdEYXRhKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZXhjZXB0aW9uVHJhY2soJHByb3ZpZGUpIHtcbiAgJHByb3ZpZGUuZGVjb3JhdG9yKCckZXhjZXB0aW9uSGFuZGxlcicsIFsnJGRlbGVnYXRlJywgJyRpbmplY3RvcicsIGZ1bmN0aW9uICgkZGVsZWdhdGUsICRpbmplY3Rvcikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyb3IsIGNhdXNlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gJGRlbGVnYXRlKGVycm9yLCBjYXVzZSk7XG4gICAgICB2YXIgJGFuYWx5dGljcyA9ICRpbmplY3Rvci5nZXQoJyRhbmFseXRpY3MnKTtcbiAgICAgIGlmICgkYW5hbHl0aWNzLnNldHRpbmdzLnRyYWNrRXhjZXB0aW9ucykge1xuICAgICAgICAkYW5hbHl0aWNzLmV4Y2VwdGlvblRyYWNrKGVycm9yLCBjYXVzZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH1dKTtcbn1cblxuZnVuY3Rpb24gaXNDb21tYW5kKGVsZW1lbnQpIHtcbiAgcmV0dXJuIFsnYTonLCdidXR0b246JywnYnV0dG9uOmJ1dHRvbicsJ2J1dHRvbjpzdWJtaXQnLCdpbnB1dDpidXR0b24nLCdpbnB1dDpzdWJtaXQnXS5pbmRleE9mKFxuICAgIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpKyc6JysoZWxlbWVudC50eXBlfHwnJykpID49IDA7XG59XG5cbmZ1bmN0aW9uIGluZmVyRXZlbnRUeXBlKGVsZW1lbnQpIHtcbiAgaWYgKGlzQ29tbWFuZChlbGVtZW50KSkgcmV0dXJuICdjbGljayc7XG4gIHJldHVybiAnY2xpY2snO1xufVxuXG5mdW5jdGlvbiBpbmZlckV2ZW50TmFtZShlbGVtZW50KSB7XG4gIGlmIChpc0NvbW1hbmQoZWxlbWVudCkpIHJldHVybiBlbGVtZW50LmlubmVyVGV4dCB8fCBlbGVtZW50LnZhbHVlO1xuICByZXR1cm4gZWxlbWVudC5pZCB8fCBlbGVtZW50Lm5hbWUgfHwgZWxlbWVudC50YWdOYW1lO1xufVxuXG5mdW5jdGlvbiBpc1Byb3BlcnR5KG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUuc3Vic3RyKDAsIDkpID09PSAnYW5hbHl0aWNzJyAmJiBbJ09uJywgJ0V2ZW50JywgJ0lmJywgJ1Byb3BlcnRpZXMnLCAnRXZlbnRUeXBlJ10uaW5kZXhPZihuYW1lLnN1YnN0cig5KSkgPT09IC0xO1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eU5hbWUobmFtZSkge1xuICB2YXIgcyA9IG5hbWUuc2xpY2UoOSk7IC8vIHNsaWNlIG9mZiB0aGUgJ2FuYWx5dGljcycgcHJlZml4XG4gIGlmICh0eXBlb2YgcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcyE9PW51bGwgJiYgcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHMuc3Vic3RyaW5nKDAsIDEpLnRvTG93ZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gcztcbiAgfVxufVxufSkoYW5ndWxhcik7XG4iLCJyZXF1aXJlKCcuL2FuZ3VsYXJ0aWNzJyk7XG5tb2R1bGUuZXhwb3J0cyA9ICdhbmd1bGFydGljcyc7XG4iLCJyZXF1aXJlKCcuL2pzL2dvb2dsZUFuYWx5dGljcy5tb2R1bGUuanMnKTtcbm1vZHVsZS5leHBvcnRzID0gJ2dvb2dsZUFuYWx5dGljcyc7XG4iLCJpbXBvcnQgXCJhbmd1bGFydGljc1wiO1xuaW1wb3J0IFwiYW5ndWxhcnRpY3MtZ29vZ2xlLXRhZy1tYW5hZ2VyXCI7XG5cbmFuZ3VsYXIubW9kdWxlKCdnb29nbGVBbmFseXRpY3MnLCBbXCJhbmd1bGFydGljc1wiLCBcImFuZ3VsYXJ0aWNzLmdvb2dsZS50YWdtYW5hZ2VyXCJdKVxuICAuZmFjdG9yeSgnZ2FJbmplY3Rpb25TZXJ2aWNlJywgWydnb29nbGVBbmFseXRpY3NDb25maWcnLCBmdW5jdGlvbihnb29nbGVBbmFseXRpY3NDb25maWcpIHtcbiAgICBjb25zdCBkZWZhdWx0Q29kZSA9IGB3aW5kb3cuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGd0YWcoKXtkYXRhTGF5ZXIucHVzaChhcmd1bWVudHMpO31cbiAgICAgICAgICAgICAgICAgICAgICAgIGd0YWcoJ2pzJywgbmV3IERhdGUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBndGFnKCdjb25maWcnLCAnJHtnb29nbGVBbmFseXRpY3NDb25maWcudHJhY2tpbmdJZH0nKTtgO1xuICAgIGNvbnN0IF9pbmxpbmVDb2RlID0gZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLmlubGluZVNjcmlwdCB8fCBkZWZhdWx0Q29kZTtcblxuICAgIGNvbnN0IGRlZmF1bHRVUkwgPSBgaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20vZ3RhZy9qcz9pZD0ke2dvb2dsZUFuYWx5dGljc0NvbmZpZy50cmFja2luZ0lkfWA7XG4gICAgbGV0IF9leHRlcm5hbFNvdXJjZTtcblxuICAgIGlmIChnb29nbGVBbmFseXRpY3NDb25maWcuZXh0ZXJuYWxTY3JpcHRVUkwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgX2V4dGVybmFsU291cmNlID0gZGVmYXVsdFVSTDtcbiAgICB9IGVsc2Uge1xuICAgICAgX2V4dGVybmFsU291cmNlID0gZ29vZ2xlQW5hbHl0aWNzQ29uZmlnLmV4dGVybmFsU2NyaXB0VVJMO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAkZ2V0RXh0ZXJuYWxTb3VyY2U6IF9leHRlcm5hbFNvdXJjZSxcbiAgICAgICRnZXRJbmxpbmVDb2RlOiBfaW5saW5lQ29kZSxcbiAgICAgIGluamVjdEdBQ29kZSgpIHtcbiAgICAgICAgaWYgKF9leHRlcm5hbFNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGV4dGVybmFsU2NyaXB0VGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgZXh0ZXJuYWxTY3JpcHRUYWcuc3JjID0gX2V4dGVybmFsU291cmNlO1xuICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZXh0ZXJuYWxTY3JpcHRUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5saW5lU2NyaXB0VGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgIGlubGluZVNjcmlwdFRhZy50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG5cbiAgICAgICAgLy8gTWV0aG9kcyBvZiBhZGRpbmcgaW5uZXIgdGV4dCBzb21ldGltZXMgZG9lc24ndCB3b3JrIGFjcm9zcyBicm93c2Vycy5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpbmxpbmVTY3JpcHRUYWcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoX2lubGluZUNvZGUpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlubGluZVNjcmlwdFRhZy50ZXh0ID0gX2lubGluZUNvZGU7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGlubGluZVNjcmlwdFRhZyk7XG4gICAgICB9XG4gICAgfTtcbiAgfV0pO1xuIl19
