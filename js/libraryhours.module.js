import { viewName } from './viewName';

angular.module('libraryhours', []).component('prmSearchBookmarkFilterAfter', {
    bindings: { parentCtrl: '<' },
    controller: ['$scope', '$mdDialog', function controller($scope, $mdDialog) {
        this.$onInit = function() {
            var alert;
            $scope.showDialog = showDialog;
            $scope.items = [1, 2, 3];

            function showDialog($event) {
                var parentEl = angular.element(document.getElementsByTagName("primo-explore")[0]);
                $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    templateUrl: 'custom/' + viewName + '/html/libraryHoursDialog.html',
                    locals: {
                        items: $scope.items
                    },
                    controller: ['$scope', '$http', '$mdDialog', function controller($scope, $http, $mdDialog) {
                        $scope.libhoursloading = true;
                        $scope.serhoursloading = true;
                        $http.post("https://www.bu.univ-rennes2.fr/views/ajax", "view_name=libraries_views&view_display_id=hours_sidebar_libraries_tab&view_args=", {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded ; charset=UTF-8'
                            }
                        }).then(function mySuccess(response) {
                            if (response.data != undefined) {
                                var librarieshours = response.data[1].data.replace(/<a.+>/g, '').replace(/<\/a>/g, '');
				$scope.libhoursloading = false;
				$scope.librarieshours = librarieshours;
				getHours(librarieshours, 'libs');
                            }
                        }, function myError(response) {
                            $scope.libhoursloading = false;
                            $scope.libhourserror = response;
                        });
                        $http.post("https://www.bu.univ-rennes2.fr/views/ajax", "view_name=services_views&view_display_id=hours_sidebar_services_tab&view_args=", {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded ; charset=UTF-8'
                            }
                        }).then(function mySuccess(response) {
                            if (response.data != undefined) {
                                var serviceshours = response.data[1].data.replace(/<a.+>/g, '').replace(/<\/a>/g, '');
				$scope.serhoursloading = false;
                                $scope.serviceshours = serviceshours;
				getHours(serviceshours, 'serv');
                            }
                        }, function myError(response) {
                            $scope.serhoursloading = false;
                            $scope.serhourserror = response;
                        });
                        $scope.closeDialog = function() {
                            $mdDialog.hide();
                        }
                    }]
                });
            }

	    function getHours(elts, type) {
                var d = new Date();
                var today = new Date().toJSON().slice(0,10);
                var now = d.getHours() * 100 + d.getMinutes();
		var ids = jQuery(elts).find('.'+(type == 'libs' ? 'kohacode' : 'servnid')).map(function() { return this.innerText; }).get().join();
		jQuery.ajax({
                    url: 'https://www.bu.univ-rennes2.fr/'+(type == 'libs' ? 'library_hours' : 'opening_hours')+'/instances',
                    data: { 
                        from_date: today,
                        to_date: today,
                        nid: ids
                    },
                    cache: true,
                    method: 'GET',
                    crossDomain: true,
                    success: function(data) {
                        var hours = {};
                        jQuery.each(data, function(i, line) {
                            var id = type == 'libs' ? line.kohacode : line.nid;
                            if (hours[id] == undefined) {
                                hours[id] = [];
                            }
                            hours[id].push(line);
                            hours[id].sort(function(a,b) { return a.start_date < b.start_date });
                        });
                        jQuery.each(hours, function(i,e) {
                            var status = 'closed';
                            var id = type == 'libs' ? e[0].kohacode : 'ser'+e[0].nid;
                            if (e[0].start_time == undefined && e[0].end_time == undefined) {
                                jQuery('.'+id+' .hour-container').text('Fermé'+(type == 'libs' ? 'e' : ''));
                            } else {
                                var content = '';
                                for (var i = 0 ; i < e.length ; i++) {
                                    if (now > parseInt(e[i].start_time.replace(/\D+/g, '')) && now < parseInt(e[i].end_time.replace(/\D+/g, ''))) {
                                        status = 'open';
                                    }
                                    if (i > 0) { content += ' / '; }
                                    content += '<time datetime="'+e[i].start_time+'" class="starttime">'+e[i].start_time.replace(/^0/, '')+'</time> - <time datetime="'+e[i].end_time+'" class="endtime">'+e[i].end_time.replace(/^0/, '')+'</time>';
                                }
                                jQuery('.'+id+' .hour-container').html(content);
                            }
                            jQuery('.'+id).removeClass('text-services text-libraries').addClass(status);
                            if (jQuery('.'+id).parents("li").size() > 0) {
                                jQuery('.'+id).parents("li").find(".menu-icon").addClass(status);
                            }
                        });
                    },
		    error: function() {
                    }
		});
	    }
        }
    }],
    templateUrl: 'custom/' + viewName + '/html/prmSearchBookmarkFilterAfter.html'
});
