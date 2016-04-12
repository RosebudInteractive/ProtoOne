if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath + 'system/uobject'],
    function (UObject) {
        var MemContactTest = UObject.extend({

            className: "MemContactTest",
            classGuid: UCCELLO_CONFIG.classGuids.MemContactTest,
            metaFields: [
                { fname: "firstname", ftype: { "type": "string", "length": 255 } },
                { fname: "lastname", ftype: { "type": "string", "length": 255 } },
                { fname: "birthdate", ftype: { "type": "datetime" } },
                { fname: "country", ftype: { "type": "string", "length": 255 } },
                { fname: "city", ftype: { "type": "string", "length": 255 } },
                { fname: "address", ftype: { "type": "string", "length": 255 } }
            ],

            metaCols: [
				{ "cname": "Addresses", "ctype": "MemAddressTest" },
            ],

            firstname: function (value) {
                return this._genericSetter("firstname", value);
            },
            
            lastname: function (value) {
                return this._genericSetter("lastname", value);
            },
            
            birthdate: function (value) {
                return this._genericSetter("birthdate", value);
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
            
            init: function (cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
            }
        });
        return MemContactTest;
    }
);