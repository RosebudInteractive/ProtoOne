if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootLeadLog = DataRoot.extend({

            className: "RootLeadLog",
            classGuid: "bedf1851-cd51-657e-48a0-10ac45e31e20",
            metaFields: [],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return RootLeadLog;
    }
);