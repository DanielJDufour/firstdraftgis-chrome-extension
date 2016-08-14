var app = angular.module("app", ["ui.grid", "ui.grid.pagination", "ui.grid.selection"]);

app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        console.log("returning");
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
