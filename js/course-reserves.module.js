import {
    viewName
} from './viewName';
import { stringify } from 'querystring';

angular.module('courseReserves', ['ui.router']).config(['$stateProvider',
        function($stateProvider) {
            $stateProvider
                .state('courses', {
                    url: '/courses?vid',
                    templateUrl: 'custom/' + viewName + '/html/courses.html',
                    controller: ['$scope', '$stateParams', 'coursesService', 'courseLists', function controller($scope, $stateParams, coursesService, courseLists) {
                        $scope.vid = $stateParams.vid
                        $scope.group = $stateParams.group
                        $scope.title = "Réserves de cours"
                        $scope.body = "Lorem ipsum...."
                            //$scope.policyInfo = policyInfo.filter(info => info.group === $stateParams.group)
                        $scope.courseLists = courseLists.filter(list => list.group === 'burennes2')
                        $scope.courseLists.map(
                            list => coursesService.getCourses().then(
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
                        $scope.vid = $stateParams.vid
                            // $scope.policyInfo = policyInfo.filter(info => info.group === $stateParams.group)
                        reservesService.getCourse($stateParams.cid).then(
                            course => {
                                $scope.course = course
                                $scope.course.sortTypes = ['title', 'author']
                                $scope.reserves = reservesService.makeArray(course.biblios)
                                $scope.reserves.map(
                                    item => {
                                        console.log(item)
                                        item.link = reservesService.getLink(item.biblionumber, $scope.vid)
                                            //item.availability = reservesService.getAvailability(bib, item.type)
                                        reservesService.getCover(item.biblionumber).then(function(data) {
                                            // no need to call user.data, service handles this
                                            if (data) {
                                                item.cover = data[0].cover;
                                                if (item.cover && item.cover.includes("no_img")) {
                                                    item.cover = '';
                                                }
                                            }
                                        }).catch(function(err) {
                                            // handle errors here if needed
                                        });
                                    }
                                )
                            }
                        )
                    }]
                })
        }
    ])
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
                 * Queries the Alma API to retrieve a list of courses based on a search filter.
                 * Requires a server-side wrapper function defined in URLs.courses.
                 * @param  {string} filter the search filter, e.g. 'searchableid~res'
                 * @return {promise}         list of matching courses
                 */
                getCourses: function() {
                    return $http({
                        method: 'GET',
                        url: URLs.courses,
                        // params: { 'filter': filter },
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
                    let departments = new Set().add('all')
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
    .factory('reservesService', ['$http', 'URLs',
        function($http, URLs) {
            return {
                /**
                 * Queries the Alma API to retrieve a course object using its cid.
                 * Requires a server-side wrapper function defined in URLs.reserves.
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
                 * Gets the value of a MARC field in a bib.
                 * Returns an array or false if field was not found.
                 * Common fields:
                 * ISBN (020)
                 * Notes (500)
                 * @param  {object} bib       bib object returned from getBib()
                 * @param  {string} fieldName name or number of the MARC field to find
                 * @return {array}            values(s) of the field
                 */
                getMarcField: function(bib, fieldName) {
                    let field = bib.record.datafield.find(field => field['@attributes'].tag === fieldName)
                    return field ? this.makeArray(field.subfield) : false
                },
                /**
                 * Get the availability of an item using a bib's AVA or AVE field.
                 * E-resources use AVE, while physical resources use AVA.
                 * Links to external resources will have type 'E_CR'.
                 * @param  {object} bib       bib object returned from getBib()
                 * @param  {string} type      type of the item, e.g. 'BK' for books
                 * @return {string}           'unavailable' or 'available'
                 */
                getAvailability: function(bib, type) {
                    if (type === 'E_CR') return 'link'
                    let physicalHoldings = this.getMarcField(bib, 'AVA')
                    let electronicHoldings = this.getMarcField(bib, 'AVE')
                    if (physicalHoldings) return physicalHoldings.filter(field => /(una|a)vailable/i.test(field))[0].toLowerCase()
                    else if (electronicHoldings) return electronicHoldings.filter(field => /(una|a)vailable/i.test(field))[0].toLowerCase()
                },
                /**
                 * Generate CSS to match an item's availability status.
                 * @param  {object} bib       bib object returned from getBib()
                 * @param  {string} type      type of the item, e.g. 'BK' for books
                 * @return {object}           CSS to apply using ng-style
                 */
                getAvailabilityStyle: function(bib, type) {
                    let availability = this.getAvailability(bib, type)
                    switch (availability) {
                        case 'available':
                            return { color: 'green' }
                        case 'link':
                            return { color: 'dodgerblue' }
                        default:
                            return { color: 'orange' }
                    }
                },
                /**
                 * Get the loan type of an item by matching a bib's AVA field to a list.
                 * External resources (e.g. e-books) won't have this value.
                 * Requires a lookup table of codes defined in loanCodes.
                 * @param  {object} bib       bib object returned from getBib()
                 * @return {string}           a description of the loan, e.g. '3-hour loan'
                 */
                getLoanType: function(bib) {
                    let holdings = this.getMarcField(bib, 'AVA')
                    if (holdings) {
                        for (let field of holdings) {
                            if (loanCodes.hasOwnProperty(field)) return loanCodes[field]
                        }
                    }
                    return 'external resource'
                },
                /**
                 * Get a link to view an item.
                 * External resources will use the MARC 500 (notes) field as a URL.
                 * E-books and physical books will link to a search for the item in Primo.
                 * @param  {object} bib       bib object returned from getBib()
                 * @param  {string} type      type of the item, e.g. 'BK' for books
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
                    }).then(function(data) {
                        // this will ensure that we get clear data in our service response
                        return data.data;
                    });
                }
            }
        }
    ]);