import 'primo-explore-google-analytics';
// import 'primo-explore-oadoi-link';
import { viewName } from './viewName';
import { kohaItems } from './kohaItems.module';
import { kohaAvailabilities } from './kohaAvailabilities.module';
import { sfxHoldings } from './sfxHoldings.module';
import { googleAnalyticsConfig } from './googleAnalyticsConfig';
let app = angular.module('viewCustom', [
                                        'angularLoad',
                                        'kohaItems',
                                        'kohaAvailabilities',
                                        'sfxHoldings',
										'googleAnalytics'
                                      ]);


app
  .constant(googleAnalyticsConfig.name, googleAnalyticsConfig.config);
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