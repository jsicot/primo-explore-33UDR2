import { viewName } from './viewName';

angular.module('mainmenu', []).component('prmSearchBarAfter', {
	bindings: { parentCtrl: '<' },
	controller: ['$scope', '$http', '$element', function controller($scope, $http, $element) {
	
		this.$onInit = function () {
		};
	}],
	templateUrl: 'custom/'+viewName+'/html/prmSearchBarAfter.html'
});