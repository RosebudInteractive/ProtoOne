if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootLead = DataRoot.extend({

            className: "RootLead",
            classGuid: "31c99003-c0fc-fbe6-55eb-72479c255556",
            metaCols: [{ "cname": "DataElements", "ctype": "DataLead" }],
            metaFields: [],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return RootLead;
    }
);