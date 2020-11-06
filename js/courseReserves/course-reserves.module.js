import {
    viewName
} from '.././viewName';
import { stringify } from 'querystring';

angular.module('courseReserves', ['ui.router']).config(['$stateProvider',
        function($stateProvider) {
            $stateProvider
                .state('courses', {
                    url: '/courses?vid',
                    templateUrl: 'custom/' + viewName + '/html/courses.html',
                    controller: ['$scope', '$stateParams', 'coursesService', 'courseLists', function controller($scope, $stateParams, coursesService, courseLists) {
                        $scope.vid = viewName
                        $scope.group = $stateParams.group
                        $scope.title = "Sélections"
                        $scope.body = "Retrouvez les bibliographies de vos questions de cours ou de concours : ces listes vous permettent d'aller à l'essentiel et facilitent vos recherches dans les bibliothèques.\n\nDécouvrez aussi les sélections thématiques des bibliothécaires."
                            //$scope.policyInfo = policyInfo.filter(info => info.group === $stateParams.group)
                        $scope.courseLists = courseLists.filter(list => list.group === 'burennes2')
                        $scope.courseLists.map(
                            list => coursesService.getCourses(list.filter).then(
                                courses => {
                                    list.courses = courses
                                    console.log(list.courses)
                                    list.departments = coursesService.getDepartments(courses)
                                    list.sortType = list.sortType || 'department'
                                    list.courses.map(
                                        course => {
                                            course.department = coursesService.getCourseDepartment(course)
                                            course.instructors = coursesService.makeArray(course.instructors.instructor)
                                        }
                                    )
                                }
                            )
                        )
                    }]
                })
                .state('reserves', {
                    url: '/reserves/:cid?group&vid',
                    templateUrl: 'custom/' + viewName + '/html/reserves.html',
                    controller: ['$scope', '$stateParams', 'reservesService', function controller($scope, $stateParams, reservesService) {
                        $scope.vid = viewName
                            // $scope.policyInfo = policyInfo.filter(info => info.group === $stateParams.group)
                        reservesService.getCourse($stateParams.cid).then(
                            course => {
                                $scope.course = course
                                    // $scope.course.sortTypes = ['title', 'biblioitem.publicationyear : reverse']
                                $scope.reserves = reservesService.makeArray(course.biblios)
                                $scope.reserves.map(
                                    item => {
                                        item.titre = item.title
                                        item.link = reservesService.getLink(item.biblionumber, $scope.vid)
                                            //item.availability = reservesService.getAvailability(bib, item.type)
                                        reservesService.getCover(item.biblionumber).then(function(data) {
                                            // no need to call user.data, service handles this
                                            if (data) {
                                                item.cover = data[0].cover;
                                                if (item.cover && item.cover.includes("no_img")) {
                                                    item.cover = 'img/icon_book.png';
                                                }
                                            }
                                        }).catch(function(err) {
                                            // handle errors here if needed
                                        });
                                        reservesService.getBib(item.biblionumber, $stateParams.vid).then(
                                            results => {
                                                console.log(results.docs);
                                                item.pitem = results.docs[0]
                                            }
                                        )
                                        reservesService.getAvailability(item.biblionumber).then(function(data) {
                                            // no need to call user.data, service handles this
                                            if (data) {
                                                item.availability = data;
                                            }
                                        }).catch(function(err) {
                                            // handle errors here if needed
                                        });
                                        console.log(item);

                                    }
                                )
                            }
                        )
                    }]
                })
        }
    ])
    // .component('prmResourceRecommenderAfter', {
    //     bindings: {
    //         parentCtrl: '<'
    //     },
    //     templateUrl: 'custom/' + viewName + '/html/courses_recommander.html',
    //     controller: ['$scope', '$rootScope', '$location', '$http', '$element', 'coursesService', function controller($scope, $rootScope, $location, $http, $element, coursesService, ) {
    //         this.$onInit = function() {
    //             var query = $location.search().query
    //             var queries = Object.prototype.toString.call(query) === '[object Array]' ? query : query ? [query] : false
    //             console.log(queries);
    //             var q = queries.map(part => {
    //                 let terms = part.split(',')
    //                 let string = terms[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s]+/g, "%25") || ''
    //                 return '%25' + string + '%25'
    //             }).join('')
    //             console.log(q);
    //             coursesService.getCourses(q).then(function(data) {
    //                 // no need to call user.data, service handles this
    //                 if (data) {
    //                     $scope.courses = data[0];
    //                     $scope.vid = viewName;
    //                     console.log($scope.courses);
    //                     $element.parent().removeClass("ng-hide");

//                 }
//             }).catch(function(err) {
//                 // handle errors here if needed
//             });
//         };
//     }]
// })
.factory('coursesService', ['$http', 'URLs',
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
                getCourses: function(filter) {
                    return $http({
                        method: 'GET',
                        url: URLs.courses + "?keywords=" + filter,
                        cache: true
                    }).then(response => response.data)
                },
                /**
                 * Extracts the set of unique academic departments from an array of courses.
                 * Used to generate the group_by menu.
                 * @param  {array} courses  array of course objects, e.g. from getCourses()
                 * @return {array}          array of department codes, e.g. ['BIO', 'CHEM' ...
                 */
                getDepartments: function(courses) {
                    let departments = new Set().add('Tout')
                    courses.map(course => departments.add(this.getCourseDepartment(course)))
                    return Array.from(departments)
                },
                /**
                 * Gets the department code of a course.
                 * Uses a regex to delete non-word characters from the course code.
                 * @param  {object} course course object
                 * @return {string}        department code, e.g. 'BIO'
                 */
                getCourseDepartment: function(course) {
                    return course.department
                }
            }
        }
    ])
    .factory('reservesService', ['$http', 'URLs', 'EXL',
        function($http, URLs, EXL) {
            return {
                /**
                 * Queries the Koha API to retrieve a course object using its course id.
                 * @param  {string} cid course ID
                 * @return {promise}     course object
                 */
                getCourse: function(cid) {
                    return $http({
                        method: 'GET',
                        url: URLs.course + cid,
                        cache: true
                    }).then(response => response.data)
                },
                /**
                 * Converts a parameter to array if not already an array.
                 * Returns false if input was falsy (e.g. undefined)
                 * @param  {any}  property    param to convert
                 * @return {array}            converted param
                 */
                makeArray: function(property) {
                    return Array.isArray(property) ? property : property ? [property] : false
                },
                /**
                 * Get the availability of an item using Koha api.
                 * @param  {object} biblionumber  biblionumber
                 * @return {promise}     availability object
                 */
                getAvailability: function(biblionumber) {
                    return $http({
                        method: 'JSONP',
                        url: URLs.avail,
                        params: { 'biblionumber': biblionumber },
                        cache: true
                    }).then(function(response) {
                        // this will ensure that we get clear data in our service response
                        return response.data;
                    });
                },
                /**
                 * Queries the Alma API to retrieve a bib using an item's MMSID.
                 * Requires a server-side wrapper function defined in URLs.bibs.
                 * @param  {string} mmsid item MMSID
                 * @return {promise}       bib object
                 */
                getBib: function(biblionumber, vid) {
                    return $http({
                        method: 'GET',
                        url: URLs.bibs,
                        params: {
                            'vid': `${vid}`,
                            'scope': 'default_scope',
                            'q': `rid,exact,33UDR2_KOHA${biblionumber}`,
                            'lang': 'fr_FR',
                            'offset': '0',
                            'limit': '1',
                            'sort': 'rank',
                            'apikey': EXL.apikey
                        },
                        cache: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-From-ExL-API-Gateway': undefined
                        }
                    }).then(response => response.data)
                },
                /**
                 * Get a link to view an item.
                 * @param  {object} bib       bib 
                 * @param  {string} vid       view name, e.g. LCC
                 * @return {string}           URL to the item
                 */
                getLink: function(bib, vid) {
                    return `/primo-explore/fulldisplay?docid=33UDR2_KOHA${bib}&context=L&vid=${vid}&lang=fr_FR&tab=print_tab&offset=0`
                },
                /**
                 * Get a cover image URL for an item using its biblionumber.
                 * @param  {object} biblionumber biblionumber
                 * @return {string} image URL
                 */
                getCover: function(biblionumber) {
                    return $http({
                        method: 'JSONP',
                        url: URLs.covers + biblionumber,
                        cache: true
                    }).then(function(response) {
                        // this will ensure that we get clear data in our service response
                        return response.data;
                    });
                }
            }
        }
    ]);