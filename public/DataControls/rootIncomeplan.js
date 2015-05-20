if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootIncomeplan = DataRoot.extend({

            className: "RootIncomeplan",
            classGuid: "194fbf71-2f84-b763-eb9c-177bf9ac565d",
            metaCols: [{"cname": "DataElements", "ctype": "data"}],
            metaFields: [],

            init: function(cm,params){
                this._super(cm,params);
            }
        });
        return RootIncomeplan;
    }
);