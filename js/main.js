import 'primo-explore-google-analytics';
import { viewName } from './viewName';
import { kohaItems } from './kohaItems.module';
import { kohaAvailabilities } from './kohaAvailabilities.module';
import { sfxHoldings } from './sfxHoldings.module';
import { googleAnalyticsConfig } from './googleAnalyticsConfig';
import { libraryhours } from './libraryhours.module';
import { reportProblem } from './reportProblem.module';
import { getThumbnail } from './getThumbnail.module';
import { kohaLists } from './koha-lists.module';

let app = angular.module('viewCustom', [
                                        'angularLoad',
                                        'kohaItems',
                                        'kohaAvailabilities',
                                        'sfxHoldings',
                     										'googleAnalytics',
                                        'libraryhours',
                                        'getThumbnail',
                                        'kohaLists',
                    										'reportProblem'
                                      ], function ($compileProvider) {
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
	});

// app.run(['$templateCache', function($templateCache) {
//   // $templateCache.put('components/search/topbar/userArea/libraryCard/library-card-menu.html','<md-button aria-label="{{$ctrl.getLibraryCardAriaLabel() | translate}}" class="md-icon-button button-over-dark" (click)="$ctrl.goToMyLibraryCard();"  aria-label="{{\'nui.menu.librarycard\' | translate}}" (keydown)="$ctrl.keydownSupport($event)"><md-tooltip md-delay="400"><span translate="nui.menu.librarycard"></span></md-tooltip><prm-icon [icon-type]="::$ctrl.topBarIcons.library.type" [svg-icon-set]="::$ctrl.topBarIcons.library.iconSet" [icon-definition]="::$ctrl.topBarIcons.library.icon"></prm-icon></md-button><prm-library-card-menu-after parent-ctrl="$ctrl"></prm-library-card-menu-after>');	
//   // $templateCache.put('components/search/topbar/bookmarkFilter/search-bookmark-filter.html','<prm-library-card-menu></prm-library-card-menu><md-button ng-if="!$ctrl.isFavorites && $ctrl.showSearchHistoryTab()" class="md-icon-button button-over-dark" aria-label="{{\'nui.favorites.gohistory.tooltip\' | translate}}" ng-click="$ctrl.goToSearchHistory()" ui-state="$ctrl.FAVORITES_STATE" ui-state-params="$ctrl.searchHistoryParams" ui-sref-opts="{reload: true, inherit:false}" href=""><md-tooltip md-delay="400"><span translate="nui.favorites.gohistory.tooltip"></span></md-tooltip><prm-icon class="rotate-25" icon-type="svg" svg-icon-set="primo-ui" icon-definition="restore"></prm-icon></md-button><div id="fixed-buttons-holder" ng-class="{\'fixed-to-top\': $ctrl.fixedToTop()}" layout="row" layout-align="center center"><md-button ng-if="$ctrl.isFavorites" id="search-button" class="md-icon-button button-over-dark" aria-label="{{\'nui.favorites.goSearch.tooltip\' | translate}}" ng-click="$ctrl.goToSearch()" ui-state="$ctrl.uiState" ui-state-params="$ctrl.searchStateParams" ui-sref-opts="{reload: true, inherit:false}" href=""><md-tooltip md-delay="400"><span translate="nui.favorites.goSearch.tooltip"></span></md-tooltip><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="magnifying-glass" layout="row"></prm-icon></md-button><md-button ng-if="!$ctrl.isFavorites" id="favorites-button" class="md-icon-button button-over-dark" aria-label="{{\'nui.favorites.goFavorites.tooltip\' | translate}}" ng-click="$ctrl.goToFavorties()" ui-state="$ctrl.FAVORITES_STATE" ui-state-params="$ctrl.favoritesStateParams" ui-sref-opts="{reload: true, inherit:false}" href=""><md-tooltip md-delay="400"><span translate="nui.favorites.goFavorites.tooltip"></span></md-tooltip><prm-icon class="rotate-25" icon-type="svg" svg-icon-set="primo-ui" icon-definition="prm_pin"></prm-icon></md-button><div ng-if="$ctrl.fixedToTop()" class="ng-scope"><md-button id="back-to-top-button" class="zero-margin md-icon-button md-button md-ink-ripple" type="button" aria-label="User Action" ng-click="$ctrl.backToTop()"><prm-icon icon-type="{{$ctrl.backToTopIcon.backToTop.type}}" svg-icon-set="{{$ctrl.backToTopIcon.backToTop.iconSet}}" icon-definition="{{$ctrl.backToTopIcon.backToTop.icon}}"></prm-icon><div class="md-ripple-container"></div></md-button></div></div><prm-search-bookmark-filter-after parent-ctrl="$ctrl"></prm-search-bookmark-filter-after>');
// }]);


app
  .constant(googleAnalyticsConfig.name, googleAnalyticsConfig.config);

app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
  var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
  urlWhitelist.push('https://catalogue.bu.univ-rennes2**');
  urlWhitelist.push('https://**.bu.univ-rennes2**');
  urlWhitelist.push('https://cataloguepreprod.bu.univ-rennes2**');
  urlWhitelist.push('http://sfx-univ-rennes2.hosted.exlibrisgroup**');
  urlWhitelist.push('https://**.image.tmdb.org**');
  $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
}]);

//Report a problem init
app.component('prmSaveToFavoritesButtonAfter', {
	bindings: {parentCtrl: '<'},
	controller: 'prmSaveToFavoritesButtonAfterController',
	templateUrl: 'custom/33UDR2_VU1/html/reportProblemButton.html'
});
 
/** Tabs and Scopes for Basic Searches **/
app.component('prmSearchBarAfter', {
	 bindings: {parentCtrl: '<'},
	 controller: 'SearchBarAfterController'
});

//AngularJS' orderBy filter does just support arrays - no objects. So you have to write an own small filter, which does the sorting for you.
app.filter('orderObjectBy', function(){
 return function(input, attribute) {
    if (!angular.isObject(input)) return input;

    var array = [];
    for(var objectKey in input) {
        array.push(input[objectKey]);
    }

    array.sort(function(a, b){
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
    });
    return array;
 }
});

app.run(runBlock);
runBlock.$inject = ['gaInjectionService'];
function runBlock(gaInjectionService) {
  gaInjectionService.injectGACode();
}
