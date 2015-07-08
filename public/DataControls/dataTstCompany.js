if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataTstCompany = DataObject.extend({

            className: "DataTstCompany",
            classGuid: "34c6f03d-f6ba-2203-b32b-c7d54cd0185a",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"Name",ftype:"string"},
                {fname:"country",ftype:"string"},
                {fname:"city",ftype:"string"},
                {fname:"address",ftype:"string"}
            ],

            init: function(cm,params){
				UccelloClass.super.apply(this, [cm, params]);
				//this.uobjectInit(cm,params);
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
        return DataTstCompany;
    }
);