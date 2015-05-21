if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataCompany = DataObject.extend({

            className: "DataCompany",
            classGuid: "59583572-20fa-1f58-8d3f-5114af0f2c51",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"Name",ftype:"string"},
                {fname:"country",ftype:"string"},
                {fname:"city",ftype:"string"},
                {fname:"address",ftype:"string"}
            ],

            init: function(cm,params){
				//UccelloClass.super.apply(this, [cm, params]);
				this.uobjectInit(cm,params);
            },

            country: function(value) {
                return this._genericSetter("country", value);
            },
            city: function(value) {
                return this._genericSetter("city", value);
            },
            address: function(value) {
                return this._genericSetter("address", value);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            }
        });
        return DataCompany;
    }
);