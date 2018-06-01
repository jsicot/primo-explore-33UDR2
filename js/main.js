import 'primo-explore-google-analytics';
import { viewName } from './viewName';
import { kohaItems } from './kohaItems.module';
import { kohaAvailabilities } from './kohaAvailabilities.module';
import { sfxHoldings } from './sfxHoldings.module';
import { googleAnalyticsConfig } from './googleAnalyticsConfig';
import { mainmenu } from './mainmenu.module';
let app = angular.module('viewCustom', [
                                        'angularLoad',
                                        'kohaItems',
                                        'kohaAvailabilities',
                                        'sfxHoldings',
                                        'mainmenu',
                                        'googleAnalytics'
                                      ]);

app
  .constant(googleAnalyticsConfig.name, googleAnalyticsConfig.config);

angular.module('primo-explore.config').run(['$templateCache', function($templateCache) {
    $templateCache.put('components/search/topbar/topbar.html','');
    $templateCache.put('components/search/searchBar/search-bar.html','<div layout="column" layout-fill tabindex="-1" role="search" ng-class="{\'zero-padding\': $ctrl.showTabsAndScopesVal()}"><prm-logo class="hide-xs hide-sm hide-md"></prm-logo><div class="search-wrapper dark-toolbar prm-top-bar-container main-header-row" div layout="row" ng-class="{\'facet-to-left\': $ctrl.facetToLeft && !$ctrl.mediaQueries.xs && !$ctrl.mediaQueries.sm && !$ctrl.mediaQueries.md}"><div flex="0" flex-md="0" flex-lg="10" flex-xl="20" ng-class="{\'facet-to-left-spacer\': $ctrl.facetToLeft && !$ctrl.mediaQueries.xl && !$ctrl.mediaQueries.md && !$ctrl.mediaQueries.sm && !$ctrl.mediaQueries.xs, \'flex-xl-25\': $ctrl.facetToLeft}"></div><div class="search-elements-wrapper" layout="column" flex flex-sm="85" flex-md="75" flex-lg="65" flex-xl="50" ng-class="(!$ctrl.advancedSearch ?\'simple-mode\' : \'advanced-mode\')  + \' \' + ($ctrl.mainSearchField ? \'has-input\' : \'\') + \' \' + ($ctrl.mediaQueries.lgPlus ? \'flex-lgPlus-55\' : \'\') + \' \' + ($ctrl.facetToLeft? \'facet-to-left-search-bar\' : \'\')"><div class="simple-search-wrapper layout-full-width" ng-hide="$ctrl.advancedSearch"><form class="layout-full-height" layout="column" name="search-form" ng-submit="$ctrl.onSubmit()"><input type="submit" class="accessible-only" tabindex="-1" aria-hidden="true"/><div class="layout-full-width"><div class="search-element-inner layout-full-width"><div class="search-input"><prm-autocomplete class="search-input-container EXLPRMHeaderAutoComplete" md-input-id="searchBar" md-search-text="$ctrl.mainSearchField" md-search-text-change="$ctrl.autocompleteQuery($ctrl.mainSearchField)" md-selected-item="$ctrl.selectedItem" md-selected-item-change="$ctrl.onSelectItem()" md-item-text="item.display || $ctrl.typedQuery " md-min-length="2" md-autofocus="false" md-no-cache="true" md-items="item in $ctrl.autoCompleteItems" md-item-text="item" placeholder="{{$ctrl.placeHolderText}}" clear="{{$ctrl.clearButtonText}}" flex><md-item-template><div ng-if="item.tab"><span md-highlight-text="$ctrl.mainSearchField">{{$ctrl.mainSearchField}}</span><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="magnifying-glass"></prm-icon><span class="suggestion-scope" translate="{{\'tabbedmenu.\'+item.tab+\'.label\'}}"></span></div><div ng-if="!item.tab" md-highlight-text="$ctrl.mainSearchField">{{item.shortDisplay}}</div></md-item-template></prm-autocomplete></div><div class="search-options" ng-class="{\'flex-sm-0 flex-0 hide-on-xs\':!$ctrl.showTabsAndScopesVal(), \'flex-sm-40 visible\':$ctrl.showTabsAndScopesVal()}"><prm-tabs-and-scopes-selector ng-if="$ctrl.showTabsAndScopesVal()" [(selected-scope)]="$ctrl.scopeField" [(selected-tab)]="$ctrl.selectedTab" ng-class="{\'is-displayed\':$ctrl.showTabsAndScopesVal()}" (update-find-in-db-event)="$ctrl.updateShowFindDBButton($event)" (change-tab-event)="$ctrl.onChangeTabEvent($event)"></prm-tabs-and-scopes-selector></div><div class="search-actions" ng-if="::(!$ctrl.scopesDialerConfiguration.display)" layout-align-xs="start center"><md-button class="zero-margin md-icon-button" ng-if="!$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()" hide-gt-xs><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="tune"></prm-icon></md-button><md-button class="zero-margin button-confirm" aria-label="{{$ctrl.getSubmitAriaLabelCode() | translate}}" (click)="$ctrl.onSubmit()"><prm-icon icon-type="{{::$ctrl.searchBoxIcons.searchTextBox.type}}" svg-icon-set="{{::$ctrl.searchBoxIcons.searchTextBox.iconSet}}" icon-definition="{{::$ctrl.searchBoxIcons.searchTextBox.icon}}"></prm-icon></md-button></div></div></div></form></div><div class="advanced-search-wrapper layout-full-width" layout="row" ng-if="$ctrl.advancedSearch" ng-cloak><prm-advanced-search tabindex="0" id="advanced-search" [(selected-scope)]="$ctrl.scopeField" [(selected-tab)]="$ctrl.selectedTab" [(show-tab-and-scopes)]="$ctrl.showTabsAndScopes" [(typed-query)]="$ctrl.mainSearchField" (update-find-in-db-event)="$ctrl.updateShowFindDBButton($event)"></prm-advanced-search><md-button class="switch-to-simple zero-margin md-icon-button" ng-if="$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()" hide-gt-xs><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="close"></prm-icon></md-button></div><div ng-if="$ctrl.isShowFindDBButton || $ctrl.isPreFilterEnable" class="search-extras layout-full-width"><div layout="row" class="pre-filters-container"><prm-pre-filters ng-if="$ctrl.isPreFilterEnable" [(selected-tab)]="$ctrl.selectedTab" [pre-filters]="$ctrl.pFilters" (search-event)="$ctrl.search($event)" flex="" class="ng-scope ng-isolate-scope flex"></prm-pre-filters><span flex ng-if="!$ctrl.isPreFilterEnable"></span><md-button ng-if="$ctrl.isShowFindDBButton" class="button-with-icon" ng-class="{\'button-over-dark\': !$ctrl.advancedSearch}" (click)="::$ctrl.openFdbIframe();" translate-attr-title="mainmenu.label.moreoptions" aria-label="{{::(\'finddb.sb.title\' | translate)}}"><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="database"></prm-icon><span translate="finddb.sb.title"></span></md-button></div></div></div><div class="search-switch-buttons" layout-sm="column" layout-align-sm="start stretch" hide-xs ng-class="{\'facet-to-left-advanced-search\': $ctrl.facetToLeft}"><md-button aria-label="{{\'nui.aria.searchBar.advancedLink\' | translate}}" class="switch-to-advanced zero-margin button-with-icon" ng-if="!$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()"><span layout="row" layout-align="start center"><span translate="label.advanced_search"></span></span></md-button><md-button class="switch-to-simple zero-margin button-with-icon" ng-if="$ctrl.advancedSearch" ng-click="$ctrl.switchAdvancedSearch()"><span layout="row" layout-align="start center"><span translate="label.simple_search"></span></span></md-button></div><div flex="0" flex-md="0" flex-sm="0" flex-lg="15" flex-xl="15" ng-class="{\'flex-lgPlus-10\': $ctrl.facetToLeft && !$ctrl.mediaQueries.xs}"></div></div><div layout="row" ng-if="!$ctrl.advancedSearch && $ctrl.showSignIn"><div flex="0" flex-md="0" flex-lg="15" flex-xl="20"></div><prm-alert-bar flex [alert-object]="$ctrl.signInAlert"></prm-alert-bar><div class="padding-left-medium" flex="0" flex-md="25" flex-lg="10" flex-xl="15" hide-xs></div><div flex="0" flex-md="0" flex-sm="10" flex-lg="20" flex-xl="20"></div></div></div><div class="advanced-search-backdrop" ng-class="{\'visible\': $ctrl.advancedSearch}"></div><prm-search-bar-after parent-ctrl="$ctrl"></prm-search-bar-after>');
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
app.controller('prmAdvancedSearchAfterController', function($scope) {
// watch to see if advanced search is there
       var advancedSearchObs = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                     if (!mutation.addedNodes) return
                     for (var i = 0; i < mutation.addedNodes.length; i++) {
                           var node = mutation.addedNodes[i];

                           if (node.nodeName == "BUTTON" && document.querySelector("prm-advanced-search .button-confirm.button-large.button-with-icon.md-button.md-primoExplore-theme.md-ink-ripple")) {
                                  //need an id to jump to
                                  let submitArea = document.querySelector(".advanced-search-output.layout-row.flex");
                                  submitArea.setAttribute("id", "advancedSearchSubmitArea");
                                 
                                  var submitBtn = document.querySelector("prm-advanced-search .button-confirm.button-large.button-with-icon.md-button.md-primoExplore-theme.md-ink-ripple");
                                  submitBtn.addEventListener("click", function(){
                                         // wait for some results
                                         var advancedSearchObs2 = new MutationObserver(function(mutations2) {
                                                mutations2.forEach(function(mutation2) {
                                                       if (!mutation2.addedNodes) return
                                                       for (var i = 0; i < mutation2.addedNodes.length; i++) {
                                                              var node = mutation2.addedNodes[i];
                                                              if (node.nodeName == "PRM-SEARCH-RESULT-SORT-BY" && window.innerHeight < 775) {
                                                                     window.location.hash='advancedSearchSubmitArea';
                                                                     advancedSearchObs2.disconnect();
                                                              }
                                                       }
                                                });
                                         });
                                               
                                         advancedSearchObs2.observe(document.getElementsByTagName('prm-explore-main')[0], {
                                                childList: true
                                                , subtree: true
                                                , attributes: false
                                                , characterData: false
                                         })
                                         //end wait for some results
                                  });
                           }
                     }
              })
       })
      
       advancedSearchObs.observe(document.getElementsByTagName('prm-advanced-search')[0], {
              childList: true
              , subtree: true
              , attributes: false
              , characterData: false
       })
});