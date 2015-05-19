if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
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
                {fname:"state",ftype:"string"},
                {fname:"client",ftype:"string"},
                {fname:"companyId",ftype:"int"},
                {fname:"contact",ftype:"string"},
                {fname:"phone",ftype:"string"},
                {fname:"email",ftype:"string"},
                {fname:"contactId",ftype:"int"},
                {fname:"proba",ftype:"int"},
                {fname:"amount",ftype:"int"},
                {fname:"user",ftype:"int"}
            ],

            init: function(cm,params){
                this._super(cm,params);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },
            state: function(value) {
                return this._genericSetter("state", value);
            },
            client: function(value) {
                return this._genericSetter("client", value);
            },
            companyId: function(value) {
                return this._genericSetter("companyId", value);
            },
            contact: function(value) {
                return this._genericSetter("contact", value);
            },
            phone: function(value) {
                return this._genericSetter("phone", value);
            },
            email: function(value) {
                return this._genericSetter("email", value);
            },
            contactId: function(value) {
                return this._genericSetter("contactId", value);
            },
            proba: function(value) {
                return this._genericSetter("proba", value);
            },
            amount: function(value) {
                return this._genericSetter("amount", value);
            },
            user: function(value) {
                return this._genericSetter("user", value);
            }
        });
        return DataLead;
    }
);