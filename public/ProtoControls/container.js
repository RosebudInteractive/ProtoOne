if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var Container = AControl.extend({

            className: "Container",
            classGuid: "c576cb6e-cdbc-50f4-91d1-4dc3b48b0b61",
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