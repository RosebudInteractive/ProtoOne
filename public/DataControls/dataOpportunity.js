if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataOpportunity = DataObject.extend({

            className: "DataOpportunity",
            classGuid: "5b64caea-45b0-4973-1496-f0a9a44742b7",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"State",ftype:"string"},
                {fname:"CompanyId",ftype:"int"},
                {fname:"LeadId",ftype:"int"},
                {fname:"OwnerId",ftype:"int"},
                {fname:"Description",ftype:"string"},
                {fname:"Probability",ftype:"int"},
                {fname:"Amount",ftype:"money"},
                {fname:"CloseDate",ftype:"datetime"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },
            state: function(value) {
                return this._genericSetter("State", value);
            },
            companyId: function(value) {
                return this._genericSetter("CompanyId", value);
            },
            leadId: function(value) {
                return this._genericSetter("LeadId", value);
            },
            ownerId: function(value) {
                return this._genericSetter("OwnerId", value);
            },
            description: function(value) {
                return this._genericSetter("Description", value);
            },
            probability: function(value) {
                return this._genericSetter("Probability", value);
            },
            amount: function(value) {
                return this._genericSetter("Amount", value);
            },
            closeDate: function(value) {
                return this._genericSetter("CloseDate", value);
            }
        });
        return DataOpportunity;
    }
);