if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootLead = DataRoot.extend({

            className: "RootLead",
            classGuid: "31c99003-c0fc-fbe6-55eb-72479c255556",
            metaCols: [{"cname": "DataElements", "ctype": "data"}],
            metaFields: [],

            init: function(cm,params){
                this._super(cm,params);
            }
        });
        return RootLead;
    }
);