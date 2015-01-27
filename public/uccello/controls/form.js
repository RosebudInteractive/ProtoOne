if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../../ProtoControls/container'],
    function(Container) {
        var Form = Container.extend({

            className: "Form",
            classGuid: "7f93991a-4da9-4892-79c2-35fe44e69083",
            metaFields: [],
            metaCols: [ {"cname": "Params", "ctype": "control"},{"cname": "Children", "ctype": "control"} ],

            init: function(cm,params){
                this._super(cm,params);
            }
        });
        return Form;
    }
);