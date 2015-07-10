if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataobject'],
    function(DataObject) {
        var DataContact = DataObject.extend({

            className: "DataContact",
            classGuid: "73596fd8-6901-2f90-12d7-d1ba12bae8f4",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"CompanyId",ftype:"int"},
                {fname:"FirstName",ftype:"string"},
                {fname:"LastName",ftype:"string"},
                {fname:"Title",ftype:"date"},
                {fname:"MobilePhone",ftype:"string"},
                {fname:"WorkPhone",ftype:"string"},
                {fname:"Email",ftype:"string"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },
            companyId: function(value) {
                return this._genericSetter("Id",value);
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
                return this._genericSetter("mobilePhone", value);
            },
            workPhone: function(value) {
                return this._genericSetter("WorkPhone", value);
            },
            email: function(value) {
                return this._genericSetter("Email", value);
            }
        });
        return DataContact;
    }
);