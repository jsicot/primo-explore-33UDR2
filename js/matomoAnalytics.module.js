  /** Matomo **/
  angular.module('matomoAnalytics', [])
      .run(['$rootScope', '$interval', 'matomoOptions', function($rootScope, $interval, matomoOptions) {
          if (matomoOptions.hasOwnProperty("enabled") && matomoOptions.enabled) {
              if (matomoOptions.hasOwnProperty("siteId") && matomoOptions.siteId !== '' && matomoOptions.hasOwnProperty("siteUrl") && matomoOptions.siteUrl !== '') {
                  if (typeof _paq === 'undefined') {
                      window['_paq'] = [];
                      _paq.push(["setDomains", ["rechercher.bu.univ-rennes2.fr/"]]);
                      _paq.push(["setDoNotTrack", true]);
                      (function() {
                          _paq.push(['setTrackerUrl', matomoOptions.siteUrl + 'matomo.php']);
                          _paq.push(['setSiteId', matomoOptions.siteId]);
                          var d = document,
                              g = d.createElement('script'),
                              s = d.getElementsByTagName('script')[0];
                          g.type = 'text/javascript';
                          g.async = true;
                          g.defer = true;
                          g.src = matomoOptions.siteUrl + 'matomo.js';
                          s.parentNode.insertBefore(g, s);
                      })();
                  }
              }
              $rootScope.$on('$locationChangeSuccess', function(event, toState, fromState) {
                  if (matomoOptions.hasOwnProperty("defaultTitle")) {
                      var documentTitle = matomoOptions.defaultTitle;
                      var timerStart = Date.now();
                      var interval = $interval(function() {
                          if (document.title !== '') documentTitle = document.title;
                          if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1)
                              if (angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).length === 0) return;
                              else documentTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).text();

                          if (typeof _paq !== 'undefined') {
                              if (fromState != toState) _paq.push(['setReferrerUrl', fromState]);
                              _paq.push(['setCustomUrl', toState]);
                              _paq.push(['setDocumentTitle', documentTitle]);
                              _paq.push(['setGenerationTimeMs', Date.now() - timerStart]);
                              _paq.push(['enableLinkTracking']);
                              _paq.push(['enableHeartBeatTimer']);
                              _paq.push(['trackPageView']);
                          }
                          $interval.cancel(interval);
                      }, 0);
                  }
              });
          }
      }]);
  angular.module('matomoAnalytics').value('matomoOptions', {
      enabled: true,
      siteId: '41',
      siteUrl: 'https://webstat.univ-rennes2.fr/',
      defaultTitle: 'BU Rennes 2 - Recherche'
  });