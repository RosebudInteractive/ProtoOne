if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataLeadLog = DataObject.extend({

            className: "DataLeadLog",
            classGuid: "c4fa07b5-03f7-4041-6305-fbd301e7408a",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"LeadId",ftype:"int"},
                {fname:"Date",ftype:"date"},
                {fname:"Content",ftype:"string"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },
            leadId: function(value) {
                return this._genericSetter("LeadId", value);
            },
            date: function(value) {
                return this._genericSetter("Date", value);
            },
            content: function(value) {
                return this._genericSetter("Content", value);
            }
        });
        return DataLeadLog;
    }
);