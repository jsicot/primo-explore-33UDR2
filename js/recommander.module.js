import {
    viewName
} from './viewName';
import { stringify } from 'querystring';

angular.module('recommander', []).component('prmResourceRecommenderAfter', {
        bindings: {
            parentCtrl: '<'
        },
        templateUrl: 'custom/' + viewName + '/html/recommander.html',
        controller: ['$scope', '$rootScope', '$location', '$http', '$element', 'URLs', 'coursesService', 'recoService', function controller($scope, $rootScope, $location, $http, $element, URLs, coursesService, recoService) {
            this.$onInit = function() {
                var query = $location.search().query
                var queries = Object.prototype.toString.call(query) === '[object Array]' ? query : query ? [query] : false
                console.log(queries);
                var q = queries.map(part => {
                    let terms = part.split(',')
                    let string = terms[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s]+/g, "%25") || ''
                    return '%25' + string + '%25'
                }).join('')

                coursesService.getCourses(q).then(function(data) {
                    // no need to call user.data, service handles this
                    if (data) {
                        $scope.courses = data[0];
                        $scope.vid = viewName;
                        console.log($scope.courses);
                        $element.parent().removeClass("ng-hide");

                    }
                }).catch(function(err) {
                    // handle errors here if needed
                });
                var query = queries.map(part => {
                    let terms = part.split(',')
                    let string = terms[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s]+/g, " ") || ''
                    return string
                }).join(' ')
                console.log(query);
                recoService.searchWwwbu(query).then(function(response) {
                    // no need to call user.data, service handles this
                    if (response.response.docs) {
                        $element.parent().removeClass("ng-hide");
                        $scope.recommandations = recoService.makeArray(response.response.docs)

                        $scope.recommandations.map(
                            resource => {
                                resource.url = resource.ss_search_api_url
                                if (resource.tm_field_link$url) {
                                    resource.link = resource.tm_field_link$url[0];
                                }
                                if (resource.bs_field_ezproxy === true) {
                                    resource.link = URLs.ezproxy + resource.tm_field_link$url[0];
                                }
                                resource.image_url = resource.ss_field_image$file$url
                                resource.name = resource.ss_title
                                resource.description = resource.content
                            }
                        );

                        console.log($scope.recommandations);

                    }
                }).catch(function(err) {
                    // handle errors here if needed
                });
            };
        }]
    })
    .factory('recoService', ['$http', 'URLs',
        function($http, URLs) {
            return {
                /**
                 * Converts a parameter to array if not already an array.
                 * Returns false if input was falsy (e.g. undefined).
                 * @param  {any}  property    param to convert
                 * @return {array}            converted param
                 */
                makeArray: function(property) {
                    return Array.isArray(property) ? property : property ? [property] : false
                },
                /**
                 * Queries the koha API to retrieve a list of courses 
                 * @return {promise}         list of matching courses
                 */
                searchWwwbu: function(query) {
                    return $http({
                        method: 'GET',
                        url: URLs.wwwbu,
                        params: {
                            'q': `((index_id:databases or index_id:services or index_id:tools) and hash:ifv97h) and (${query})`,
                            'limit': '3',
                            'fl': 'ss_field_image$file$url,ss_title,ss_search_api_url,content,ss_field_resource_types,ss_field_access,sm_field_subjects$name,ss_type,bs_field_ezproxy,tm_field_link$url,ss_field_icon'
                        },
                        cache: true
                    }).then(response => response.data)
                }
            }
        }
    ]);