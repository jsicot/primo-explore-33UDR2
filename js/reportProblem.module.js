angular.module('reportProblem', []).controller('prmSaveToFavoritesButtonAfterController', ['$scope', '$mdDialog', '$http', function ($scope, $mdDialog, $http) {
	    var vm = this;
	    let self = this;
	vm.getIconLink = getIconLink;
	function getIconLink() {
		return vm.parentCtrl.iconLink;
		}
	$scope.showReportAProblemForm = function($event){
	            $mdDialog.show( {
	                parent: angular.element(document.body),
	                clickOutsideToClose: true,
	                fullscreen: false,
	                targetEvent: $event,
	                templateUrl: 'custom/33UDR2_VU1/html/reportProblem.html', controller: function ($scope, $mdDialog, $http) {
	                    let recordData = self.parentCtrl.item;
	                    $scope.report = {
	                    	replyTo: '',
	                        message: '',
	                        subject: 'report a problem'
	                    }
	                    $scope.cancelReport = function () {
	                        $mdDialog.cancel();
	                    }
	                    $scope.sendReport = function (answer) {
	                        let data = {
	                            recordId: recordData.pnx.control.recordid[0],
	                            index: 0,
	                            page: 0,
	                            scope: '',
	                            query: '',
	                            searchType: '',
	                            //sessionId: user.id,
	                            sessionId: '',
	                            tab: '',
	                            title: recordData.pnx.display.title[0],
	                            type: 'resource_problem',
	                            subject: $scope.report.subject,
	                            //view: self.view.code,
	                            view: '',
	                            // inst: self.view.institution.code,
	                            inst: self.parentCtrl.institutionCode,
	                            
	                            // loggedIn: self.user.isLoggedIn(),
	                            loggedIn: '',
	                            //onCampus: self.user.isOnCampus(),
	                            onCampus: '',
	                            //user: self.user.name,
	                            user: '',
	                            fe: '',
	                            //ip: self.view.ip.address,
	                            ip: "",
	                            message: $scope.report.message,
	                            //replyTo: $scope.report.replyTo || self.user.email,
	                            replyTo: $scope.report.replyTo,
	                            userAgent: navigator.userAgent
	                        };	                        	
	                        var bodyContent = "From: " + $scope.report.replyTo + "<br />RecordId: " + data.recordId + "<br />Title: " + data.title + "<br />Browser: " + data.userAgent + "<br /><br />Message:<br />" + data.message.replace("\n", "<br />");
	                        
	                       //retrieve of user id when is logged
	                       if(self.parentCtrl.primolyticsService.userSessionManagerService){
		                       var uid = self.parentCtrl.primolyticsService.userSessionManagerService['areaName'];
	                       }
	                        if ($scope.report.replyTo.length > 0 && $scope.report.message.length > 0) {
	                            //$mdDialog.hide();
								var url = "https://cataloguepreprod.bu.univ-rennes2.fr/r2microws/createPrimoTicket.php";
								 $http({
	                                method: 'JSONP',
	                                url: url,
	                                headers: {
	                                    'Content-Type': 'application/json',
	                                    'X-From-ExL-API-Gateway': undefined
	                                },
	                                params: {
		                            	in063: 'sicot_j',
		                            	in165: '12',
		                            	in267: '251',
		                            	in369: 'OTHER',
		                            	in471: '[PRIMO] Nouvel incident',
		                            	in573: 'rechercher.bu.univ-rennes2.fr',
		                            	in675: '3',
										in777: bodyContent,
										in879: 'DEFAULT',
										method: '60'
	                        		},
	                                cache: false,
	                            }).then(function(response){
						                $scope.returnMessage = 'Merci pour votre message. Vous recevrez une réponse très prochainement. Vous pouvez dorénavant fermer cette fenêtre.';
										console.log(response);
										$scope.hideForm = false;
						            }, function(response){
		                                $scope.returnMessage = 'Oups. Impossible d\'envoyer le message.';
										console.log($scope.returnMessage);
		                                $scope.hideForm = false;
						            });
	                        }
	                    }
	                }
	            });
	        };
	    
		$scope.sendFeedback = function (answer) {
        var data = {
          subject: $scope.feedback.subject,
          view: self.view.code,
          inst: self.view.institution.code,
          loggedIn: self.user.isLoggedIn(),
          onCampus: self.user.isOnCampus(),
          user: self.user.name,
          ip: self.view.ip.address,
          type: 'survey',
          feedback: $scope.feedback.answers,
          email: $scope.feedback.replyTo || self.user.email,
          userId: self.user.id || '',
          userAgent: navigator.userAgent
        };

	}

}]);


	
	

