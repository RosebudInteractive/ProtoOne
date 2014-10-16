if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var Container = AControl.extend({

            className: "Container",
            classGuid: "1d95ab61-df00-aec8-eff5-0f90187891cf",
            metaCols: [ {"cname": "Children", "ctype": "control"} ],

            init: function(db) {
                this._super(db);
            },

            render: function() {
            }

        });
        return Container;
    }
);