if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataAddress = DataObject.extend({

            className: "DataAddress",
            classGuid: "16ec0891-1144-4577-f437-f98699464948",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"parent",ftype:"integer"},
                {fname:"country",ftype:"string"},
                {fname:"city",ftype:"string"},
                {fname:"address",ftype:"string"}
            ],

            init: function(cm,params){
                this._super(cm,params);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },

            parent: function(value) {
                return this._genericSetter("parent", value);
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
        return DataAddress;
    }
);