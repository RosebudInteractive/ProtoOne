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

            country: function (value) {
                return this._genericSetter("country", value);
            },
            
            city: function (value) {
                return this._genericSetter("city", value);
            },
            
            address: function (value) {
                return this._genericSetter("address", value);
            },
            
            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return MemAddressTest;
    }
);