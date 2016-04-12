if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath + 'system/uobject'],
    function (UObject) {
        var MemContractTest = UObject.extend({
            
            className: "MemContractTest",
            classGuid: UCCELLO_CONFIG.classGuids.MemContractTest,
            metaCols: [],
            metaFields: [
                { fname: "number", ftype: { "type": "string", "length": 255 } },
                { fname: "total", ftype: { "type": "decimal", "precision": 12, "scale": 4 } }
            ],
            
            number: function (value) {
                return this._genericSetter("number", value);
            },
            
            total: function (value) {
                return this._genericSetter("total", value);
            },
            
            init: function (cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return MemContractTest;
    }
);