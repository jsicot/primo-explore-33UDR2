// import 'primo-explore-google-analytics';
import { viewName } from './viewName';
import { kohaItems } from './kohaItems.module';
import { kohaAvailabilities } from './kohaAvailabilities.module';
import { sfxHoldings } from './sfxHoldings.module';
// import { googleAnalyticsConfig } from './googleAnalyticsConfig';
import { libraryhours } from './libraryhours.module';
import { reportProblem } from './reportProblem.module';
import { getThumbnail } from './getThumbnail.module';
import { kohaLists } from './koha-lists.module';
import { courseReserves } from './course-reserves.module';

let app = angular.module('viewCustom', [
    'courseReserves',
    'angularLoad',
    'kohaItems',
    'kohaAvailabilities',
    'sfxHoldings',
    'libraryhours',
    'getThumbnail',
    'kohaLists',
    'reportProblem'
]);

// app.run(['$templateCache', function($templateCache) {
//   // $templateCache.put('components/search/topbar/userArea/libraryCard/library-card-menu.html','<md-button aria-label="{{$ctrl.getLibraryCardAriaLabel() | translate}}" class="md-icon-button button-over-dark" (click)="$ctrl.goToMyLibraryCard();"  aria-label="{{\'nui.menu.librarycard\' | translate}}" (keydown)="$ctrl.keydownSupport($event)"><md-tooltip md-delay="400"><span translate="nui.menu.librarycard"></span></md-tooltip><prm-icon [icon-type]="::$ctrl.topBarIcons.library.type" [svg-icon-set]="::$ctrl.topBarIcons.library.iconSet" [icon-definition]="::$ctrl.topBarIcons.library.icon"></prm-icon></md-button><prm-library-card-menu-after parent-ctrl="$ctrl"></prm-library-card-menu-after>');	
//   // $templateCache.put('components/search/topbar/bookmarkFilter/search-bookmark-filter.html','<prm-library-card-menu></prm-library-card-menu><md-button ng-if="!$ctrl.isFavorites && $ctrl.showSearchHistoryTab()" class="md-icon-button button-over-dark" aria-label="{{\'nui.favorites.gohistory.tooltip\' | translate}}" ng-click="$ctrl.goToSearchHistory()" ui-state="$ctrl.FAVORITES_STATE" ui-state-params="$ctrl.searchHistoryParams" ui-sref-opts="{reload: true, inherit:false}" href=""><md-tooltip md-delay="400"><span translate="nui.favorites.gohistory.tooltip"></span></md-tooltip><prm-icon class="rotate-25" icon-type="svg" svg-icon-set="primo-ui" icon-definition="restore"></prm-icon></md-button><div id="fixed-buttons-holder" ng-class="{\'fixed-to-top\': $ctrl.fixedToTop()}" layout="row" layout-align="center center"><md-button ng-if="$ctrl.isFavorites" id="search-button" class="md-icon-button button-over-dark" aria-label="{{\'nui.favorites.goSearch.tooltip\' | translate}}" ng-click="$ctrl.goToSearch()" ui-state="$ctrl.uiState" ui-state-params="$ctrl.searchStateParams" ui-sref-opts="{reload: true, inherit:false}" href=""><md-tooltip md-delay="400"><span translate="nui.favorites.goSearch.tooltip"></span></md-tooltip><prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="magnifying-glass" layout="row"></prm-icon></md-button><md-button ng-if="!$ctrl.isFavorites" id="favorites-button" class="md-icon-button button-over-dark" aria-label="{{\'nui.favorites.goFavorites.tooltip\' | translate}}" ng-click="$ctrl.goToFavorties()" ui-state="$ctrl.FAVORITES_STATE" ui-state-params="$ctrl.favoritesStateParams" ui-sref-opts="{reload: true, inherit:false}" href=""><md-tooltip md-delay="400"><span translate="nui.favorites.goFavorites.tooltip"></span></md-tooltip><prm-icon class="rotate-25" icon-type="svg" svg-icon-set="primo-ui" icon-definition="prm_pin"></prm-icon></md-button><div ng-if="$ctrl.fixedToTop()" class="ng-scope"><md-button id="back-to-top-button" class="zero-margin md-icon-button md-button md-ink-ripple" type="button" aria-label="User Action" ng-click="$ctrl.backToTop()"><prm-icon icon-type="{{$ctrl.backToTopIcon.backToTop.type}}" svg-icon-set="{{$ctrl.backToTopIcon.backToTop.iconSet}}" icon-definition="{{$ctrl.backToTopIcon.backToTop.icon}}"></prm-icon><div class="md-ripple-container"></div></md-button></div></div><prm-search-bookmark-filter-after parent-ctrl="$ctrl"></prm-search-bookmark-filter-after>');
// }]);


// app
//   .constant(googleAnalyticsConfig.name, googleAnalyticsConfig.config);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/**-------------- Insert Custom header  -------------- **/

var url = new URL(document.location.href);
var lang = url.searchParams.get('lang');
var homeLink = location.origin + '/primo-explore/search?vid=' + window.appConfig.vid + '&lang=' + lang;


function add_custom_header(header_container) {
    console.log("... in add_custom_header function");
    var header_container = angular.element(document.getElementsByClassName('custom-header'));

    if (header_container.length == 0) {
        var custom_header_html = '<link rel="stylesheet" id="r2-portalbar-css"  href="https://static.univ-rennes2.fr/barre-portail/jquery.barre-portail-R2.min.css" type="text/css" media="all" /><div class="custom-header"><header id="r2-portalbar"><nav role="navigation" aria-labelledby="block-nosportails-menu" id="block-nosportails" class="navbar-is-fixed-top container"><ul class="menu nos-portails"><li> <a href="https://www.univ-rennes2.fr" class="site-public">Universit&eacute; Rennes 2</a></li><li> <a href="https://ent.univ-rennes2.fr/etudiants" class="site-etudiant">&eacute;tudiants</a></li><li> <a href="https://ent.univ-rennes2.fr/personnels" class="site-personnel">Personnels</a></li><li> <a href="https://international.univ-rennes2.fr/" class="site-internat">International website</a></li><li> <a href="https://www.univ-rennes2.fr/partenaires-pro" class="site-pro">Partenaires pro</a></li><li> <a href="https://www.bu.univ-rennes2.fr/" class="site-bu is-active" data-active-regexp="^(\\w+\\.bu|bu\\-test)\\.univ\\-rennes2\\.fr" class="site-bu">Biblioth&egrave;ques</a></li><li> <a href="https://www.lairedu.fr/" class="site-webmedia">Webmedia</a></li></ul></nav></header></div>';
        var prm_explore_main = angular.element(document.querySelector('prm-explore-main'));
        if (prm_explore_main.length == 1) {
            prm_explore_main.after(custom_header_html);
            var header_container = angular.element(document.getElementsByClassName('custom-header'));
            angular.element(header_container).after(prm_explore_main);
            initR2PortalBar();
        }

        var prm_full_view_page = angular.element(document.querySelector('prm-full-view-page'));
        if (prm_full_view_page.length == 1) {
            prm_full_view_page.after(custom_header_html);
            var header_container = angular.element(document.getElementsByClassName('custom-header'));
            header_container.after(prm_full_view_page);
            initR2PortalBar();
        }

        var prm_services_page = angular.element(document.querySelector('prm-services-page'));
        if (prm_services_page.length == 1) {
            prm_services_page.after(custom_header_html);
            var header_container = angular.element(document.getElementsByClassName('custom-header'));
            header_container.after(prm_services_page);
            initR2PortalBar();
        }
    } else {
        console.log("header already exists - this function shouldn't have been called?!");
        console.log("path name: " + window.location.pathname);
    }
}

app.constant('courseLists', [{
    group: "burennes2",
    title: "Préparer un cours ou un concours",
    description: "Ceci est un texte pour présenter la section",
    filter: "CO_",
    sortType: "name"
}, {
    group: "burennes2",
    title: "Listes Thématiques",
    description: "Ceci est un texte pour présenter la section",
    filter: "THEMA_",
    sortType: "name"
}]);

app.constant('URLs', {
    courses: 'https://cataloguepreprod.bu.univ-rennes2.fr/api/v1/contrib/course/search/',
    course: 'https://cataloguepreprod.bu.univ-rennes2.fr/api/v1/contrib/course/biblios/',
    bibs: 'https://api-eu.hosted.exlibrisgroup.com/primo/v1/search',
    avail: "https://catalogue.bu.univ-rennes2.fr/r2microws/json.getItems.php",
    covers: 'https://catalogue.bu.univ-rennes2.fr/r2microws/getCover.php?biblionumbers[]='
});

app.constant('EXL', {
    apikey: YOUR_API_KEY,
});



// load jquery
app.component('prmTopBarBefore', {
    bindings: { parentCtrl: '<' },
    controller: [function controller() {
        this.$onInit = function() {
            loadScript("https://static.univ-rennes2.fr/bootstrap/3.1/js/jquery.js", jquery_loaded);
        };
    }]
});

function loadScript(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = callback;
    script.onload = callback;
    head.appendChild(script);
}

var script_loaded = function() {
    console.log("external script loaded");
};

function initR2PortalBar() {
    jQuery('head').append('<link rel="stylesheet" as="style" href="https://static.univ-rennes2.fr/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css" type="text/css" />');
    jQuery.ajaxSetup({
        cache: true
    });
    jQuery.getScript('https://static.univ-rennes2.fr/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js', function() {
        jQuery("#block-nosportails").mCustomScrollbar({
            axis: "x",
            theme: "minimal",
            callbacks: {
                onInit: function() {
                    moveScrollGradient(this);
                },
                whileScrolling: function() {
                    moveScrollGradient(this);
                },
                onOverflowX: function() {
                    jQuery(this).addClass('showGradient');
                },
                onOverflowXNone: function() {
                    jQuery(this).removeClass('showGradient');
                }
            }
        });
    });
}

function moveScrollGradient(el) {
    if (el.mcs.leftPct < 5) {
        jQuery('#block-nosportails').addClass('scroll-full-left');
    } else {
        jQuery('#block-nosportails').removeClass('scroll-full-left');
    }
    if (el.mcs.leftPct > 95) {
        jQuery('#block-nosportails').addClass('scroll-full-right');
    } else {
        jQuery('#block-nosportails').removeClass('scroll-full-right');
    }
}



var jquery_loaded = function() {
    console.log("jquery loaded");
    // load custom header
    $(document).ready(function() {
        var header_container = angular.element(document.getElementsByClassName('custom-header'));
        if (header_container.length > 0)
            console.log(" ### header exists when jquery loaded");
        else
            add_custom_header();
        initR2PortalBar();
        console.log(" ### path name: " + window.location.pathname);


    });
};


app.config(['$sceDelegateProvider', function($sceDelegateProvider) {
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
    bindings: { parentCtrl: '<' },
    controller: 'prmSaveToFavoritesButtonAfterController',
    templateUrl: 'custom/' + viewName + '/html/reportProblemButton.html'
});

/** Tabs and Scopes for Basic Searches **/
app.component('prmSearchBarAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'SearchBarAfterController'
});

app.controller('SearchBarAfterController', ['angularLoad', function(angularLoad) {
    var vm = this;
    vm.parentCtrl.showTabsAndScopes = true;
}]);

// change advanced search to jump to results
app.controller('prmAdvancedSearchAfterController', ['$scope', function controller($scope) {
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
                    submitBtn.addEventListener("click", function() {
                        // wait for some results
                        var advancedSearchObs2 = new MutationObserver(function(mutations2) {
                            mutations2.forEach(function(mutation2) {
                                if (!mutation2.addedNodes) return
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
                            })
                            //end wait for some results
                    });
                }
            }
        })
    })
    advancedSearchObs.observe(document.getElementsByTagName('prm-advanced-search')[0], {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    })
}]);

//AngularJS' orderBy filter does just support arrays - no objects. So you have to write an own small filter, which does the sorting for you.
app.filter('orderObjectBy', function() {
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for (var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b) {
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
});

// app.run(runBlock);
// runBlock.$inject = ['gaInjectionService'];
// function runBlock(gaInjectionService) {
//   gaInjectionService.injectGACode();
// }