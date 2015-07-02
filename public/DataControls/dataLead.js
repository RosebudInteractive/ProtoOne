if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataLead = DataObject.extend({

            className: "DataLead",
            classGuid: "86c611ee-ed58-10be-66f0-dfbb60ab8907",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"Source",ftype:"string"},
                {fname:"State",ftype:"string"},
                {fname:"Content",ftype:"string"},
                {fname:"Creation",ftype:"date"},
                {fname:"Closed",ftype:"date"},
                {fname:"OpportunityId",ftype:"int"},
                {fname:"ContactId",ftype:"int"},
                {fname:"FirstName",ftype:"string"},
                {fname:"LastName",ftype:"string"},
                {fname:"Title",ftype:"string"},
                {fname:"MobilePhone",ftype:"string"},
                {fname:"WorkPhone",ftype:"string"},
                {fname:"Email",ftype:"string"},
                {fname:"CompanyId",ftype:"string"},
                {fname:"Company",ftype:"string"},
                {fname:"Industry",ftype:"string"},
                {fname:"NbEmpl",ftype:"int"},
                {fname:"City",ftype:"string"},
                {fname:"Address",ftype:"string"},
                {fname:"PostalCode",ftype:"string"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },
            source: function(value) {
                return this._genericSetter("Source", value);
            },
            state: function(value) {
                return this._genericSetter("State", value);
            },
            content: function(value) {
                return this._genericSetter("Content", value);
            },
            creation: function(value) {
                return this._genericSetter("Creation", value);
            },
            closed: function(value) {
                return this._genericSetter("Closed", value);
            },
            opportunityId: function(value) {
                return this._genericSetter("OpportunityId", value);
            },
            contactId: function(value) {
                return this._genericSetter("ContactId", value);
            },
            firstName: function(value) {
                return this._genericSetter("FirstName", value);
            },
            lastName: function(value) {
                return this._genericSetter("LastName", value);
            },
            title: function(value) {
                return this._genericSetter("Title", value);
            },
            mobilePhone: function(value) {
                return this._genericSetter("MobilePhone", value);
            },
            workPhone: function(value) {
                return this._genericSetter("WorkPhone", value);
            },
            email: function(value) {
                return this._genericSetter("Email", value);
            },
            companyId: function(value) {
                return this._genericSetter("CompanyId", value);
            },
            company: function(value) {
                return this._genericSetter("Company", value);
            },
            industry: function(value) {
                return this._genericSetter("Industry", value);
            },
            nbEmpl: function(value) {
                return this._genericSetter("NbEmpl", value);
            },
            city: function(value) {
                return this._genericSetter("City", value);
            },
            address: function(value) {
                return this._genericSetter("Address", value);
            },
            postalCode: function(value) {
                return this._genericSetter("PostalCode", value);
            }
        });
        return DataLead;
    }
);