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
                {fname:"CompanyId",ftype:"int"},
                {fname:"Company",ftype:"string"},
                {fname:"Industry",ftype:"string"},
                {fname:"NbEmpl",ftype:"int"},
                {fname:"City",ftype:"string"},
                {fname:"Address",ftype:"string"},
                {fname:"PostalCode",ftype:"string"}
            ],

            init: function(cm,params){
				UccelloClass.super.apply(this, [cm, params]);
				//this.uobjectInit(cm,params);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
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
                return this._genericSetter("NbEmpl",value);
            },
            city: function(value) {
                return this._genericSetter("City",value);
            },
            address: function(value) {
                return this._genericSetter("Address",value);
            },
            postalCode: function(value) {
                return this._genericSetter("PostalCode",value);
            }
        });
        return DataCompany;
    }
);