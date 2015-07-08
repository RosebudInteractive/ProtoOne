if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataTstContact = DataObject.extend({

            className: "DataTstContact",
            classGuid: "27ce7537-7295-1a45-472c-a422e63035c7",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"parent",ftype:"integer"},
                {fname:"firstname",ftype:"string"},
                {fname:"lastname",ftype:"string"},
                {fname:"birthdate",ftype:"date"},
                {fname:"country",ftype:"string"},
                {fname:"city",ftype:"string"},
                {fname:"address",ftype:"string"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },

            parent: function(value) {
                return this._genericSetter("parent", value);
            },

            firstname: function(value) {
                return this._genericSetter("firstname", value);
            },
            lastname: function(value) {
                return this._genericSetter("lastname", value);
            },
            birthdate: function(value) {
                return this._genericSetter("birthdate", value);
            },
            country: function(value) {
                return this._genericSetter("country", value);
            },
            city: function(value) {
                return this._genericSetter("city", value);
            },
            address: function(value) {
                return this._genericSetter("address", value);
            }
        });
        return DataTstContact;
    }
);