if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath + 'system/uobject', './memTestData'],
    function (UObject, MemTestData) {
        var MemCompanyTest = UObject.extend({

            className: "MemCompanyTest",
            classGuid: UCCELLO_CONFIG.classGuids.MemCompanyTest,
            metaFields: [
                { fname: "Name", ftype: { "type": "string", "length": 255 } },
                { fname: "country", ftype: { "type": "string", "length": 255 } },
                { fname: "city", ftype: { "type": "string", "length": 255 } },
                { fname: "address", ftype: { "type": "string", "length": 255 } }
            ],

            metaCols: [
				{ "cname": "Contacts", "ctype": "MemContactTest" },
				{ "cname": "Contracts", "ctype": "MemContractTest" }
            ],

            name: function (value) {
                return this._genericSetter("Name", value);
            },
            
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
        MemCompanyTest.testData = MemTestData;
        return MemCompanyTest;
    }
);