var someplugin = (function($) {
    return {
        test: function() {
            console.log('someplugin.test');
        },
        add: function(a, b) {
            // uncomment this to see the test break.
            //console.log(parseInt(a, 10) + parseInt(b, 10));
            console.log(a + b);
        }
    };
})(jQuery);
