if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootIncomeplan = DataRoot.extend({

            className: "RootIncomeplan",
            classGuid: "194fbf71-2f84-b763-eb9c-177bf9ac565d",
            metaFields: [],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return RootIncomeplan;
    }
);