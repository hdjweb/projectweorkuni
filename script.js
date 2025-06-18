angular.module('starRatingApp', [])
.controller('MainCtrl', function($timeout, $scope) {
    var vm = this;
    vm.rating = 0;
    vm.feedbackText = "";
    vm.email = "";
    vm.feedbackSent = false;
    vm.emailError = false;
    vm.canSend = false;
    vm.privacyAccepted = false;
    vm.privacyError = false;

    function validateEmail(email) {
    var re = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    return re.test(email);
}

    $scope.$watchGroup([
        function() { return vm.feedbackText; },
        function() { return vm.email; }
    ], function() {
        vm.emailError = false;
        if(vm.feedbackText && vm.email){
            if(validateEmail(vm.email)) {
                vm.canSend = true;
            } else {
                vm.canSend = false;
                vm.emailError = true;
            }
        } else {
            vm.canSend = false;
        }
    });

    vm.sendFeedback = function(form) {
        vm.privacyError = false;
        if(!vm.privacyAccepted) {
            vm.privacyError = true;
            return;
        }
        if(form.$valid && vm.canSend && vm.privacyAccepted) {
            var subject = encodeURIComponent("feedback lasciato da " + vm.email);
            var body = encodeURIComponent(vm.feedbackText);
            var mailto = "mailto:hdjweb@gmail.com?subject=" + subject + "&body=" + body;
            window.location.href = mailto;

            // Reset form UI
            vm.feedbackText = "";
            vm.email = "";
            vm.privacyAccepted = false;
            form.$setPristine();
            form.$setUntouched();
            vm.canSend = false;
            vm.feedbackSent = true;
            $timeout(function() {
                vm.feedbackSent = false;
            }, 3000);
        }
    };
})
.directive('starRating', function() {
    return {
        restrict: 'E',
        scope: { rating: '=', max: '=' },
        template: `<div class="star-rating" aria-label="Valutazione stelle">
    <span ng-repeat="n in getStars() track by $index"
          class="star"
          ng-class="getClass($index)"
          ng-mousemove="hover($event,$index)"
          ng-mouseleave="unhover()"
          ng-click="set($event,$index)"
          tabindex="0"
          role="button"
          aria-label="Stella {{$index+1}}"
          aria-pressed="{{$parent.rating >= $index+1}}">
        <svg viewBox="0 0 24 24">
            <path class="svg-star" d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
    </span>
</div>`,

        link: function(scope) {
            scope.hoverRating = 0;
            scope.getStars = function() {
                return new Array(scope.max);
            };
            scope.getClass = function(idx) {
                var val = scope.hoverRating || scope.rating || 0;
                if (val >= idx + 1) return 'full';
                if (val >= idx + 0.5) return 'half';
                return '';
            };
            scope.set = function($event, idx) {
                var rect = $event.currentTarget.getBoundingClientRect();
                var x = $event.clientX - rect.left;
                var val = (x < rect.width / 2) ? idx + 0.5 : idx + 1;
                scope.rating = val;
            };
            scope.hover = function($event, idx) {
                var rect = $event.currentTarget.getBoundingClientRect();
                var x = $event.clientX - rect.left;
                var val = (x < rect.width / 2) ? idx + 0.5 : idx + 1;
                scope.hoverRating = val;
            };
            scope.unhover = function() {
                scope.hoverRating = 0;
            };
        }
    };
});

// Cookie tecnico di sessione
(function() {
    function generateSessionId() {
        return 'sess-' + Math.random().toString(36).slice(2, 18);
    }
    function getCookie(name) {
        let value = "; " + document.cookie;
        let parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }
    if (!getCookie('session_id')) {
        var sessionId = generateSessionId();
        document.cookie = 'session_id=' + sessionId + '; path=/; SameSite=Strict';
    }
})();
