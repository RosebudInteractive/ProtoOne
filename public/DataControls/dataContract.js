if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataContract = DataObject.extend({

            className: "DataContract",
            classGuid: "08a0fad1-d788-3604-9a16-3544a6f97721",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"parent",ftype:"integer"},
                {fname:"number",ftype:"string"},
                {fname:"total",ftype:"integer"}
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

            total: function(value) {
                return this._genericSetter("total", value);
            },
            number: function(value) {
                return this._genericSetter("number", value);
            }
        });
        return DataContract;
    }
);