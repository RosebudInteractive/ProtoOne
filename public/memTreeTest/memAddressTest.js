if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath + 'system/uobject'],
    function (UObject) {
        var MemAddressTest = UObject.extend({

            className: "MemAddressTest",
            classGuid: UCCELLO_CONFIG.classGuids.MemAddressTest,
            metaCols: [],
            metaFields: [
                { fname: "country", ftype: { "type": "string", "length": 255 } },
                { fname: "city", ftype: { "type": "string", "length": 255 } },
                { fname: "address", ftype: { "type": "string", "length": 255 } }
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return MemAddressTest;
    }
);