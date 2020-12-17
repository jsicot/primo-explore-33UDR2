import { viewName } from '.././viewName';

angular
    .module('kohaLists', [])
    .component('kohaLists', {
        templateUrl: 'custom/' + viewName + '/html/courses_home.html',
        controller: ['$scope', '$http', 'coursesService', 'courseLists', function($scope, $http, coursesService, courseLists) {
            $scope.vid = viewName
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
            );
            //flex-xl-25 flex-xl-20 flex-md-0 flex-lg-10 flex-0 flex-lgPlus-20
            //flex-xl-10 flex-md-0 flex-lg-10 flex-0 flex-lgPlus-15
            angular.element(document.querySelector('body > primo-explore > div > prm-explore-main > ui-view > prm-search > md-content > div.flex-xl-25.flex-xl-20.flex-md-0.flex-lg-10.flex-0')).removeClass("flex-xl-25 flex-xl-20 flex-md-0 flex-lg-10 flex-0 flex-lgPlus-20").addClass("flex-xl-10 flex-md-0 flex-lg-10 flex-0 flex-lgPlus-15");
            angular.element(document.querySelector('body > primo-explore > div > prm-explore-main > ui-view > prm-search > md-content > div.flex-xl-25.flex-md-10.flex-lg-25.flex-0')).removeClass("flex-lgPlus-25 flex-xl-25 flex-md-10 flex-lg-25 flex-0").addClass("flex-xl-10 flex-md-0 flex-lg-10 flex-0 flex-lgPlus-15");



        }]
    });