import 'primo-explore-google-analytics';
import 'primo-explore-report-problem';
import 'primo-explore-oadoi-link';
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
										'googleAnalytics',
										'reportProblem',
										'oadoi'
                                      ]);

app
  .constant(googleAnalyticsConfig.name, googleAnalyticsConfig.config)
  .constant('oadoiOptions', {
  	"imagePath": "custom/33UDR2_VU1/img/icon_newspaper_article.png",
  	"email": "julien.sicot@univ-rennes2.fr"
  });


                                      
app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
  var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
  urlWhitelist.push('https://catalogue.bu.univ-rennes2**');
  urlWhitelist.push('https://**.bu.univ-rennes2**');
  urlWhitelist.push('https://cataloguepreprod.bu.univ-rennes2**');
  urlWhitelist.push('http://sfx-univ-rennes2.hosted.exlibrisgroup**');
  $sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
}]);


//adds a "report a problem" banner to the detail view of an item in primo-explore. 
app.component('prmSearchResultAvailabilityLineAfter', {template: '<oca-report-problem report-url="http://www.bu.univ-rennes2.fr/reportproblem.php?" message-text="Signaler un problème ?" button-text="Soumettre" />'});




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