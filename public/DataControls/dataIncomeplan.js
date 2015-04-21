if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject) {
        var DataIncomeplan = UObject.extend({

            className: "DataIncomeplan",
            classGuid: "56cc264c-5489-d367-1783-2673fde2edaf",
            metaCols: [],
            metaFields: [
                {fname:"Id",ftype:"int"},
                {fname:"leadId",ftype:"int"},
                {fname:"date",ftype:"datetime"},
                {fname:"amount",ftype:"int"},
                {fname:"comment",ftype:"string"}
            ],

            init: function(cm,params){
                this._super(cm,params);
            },

            id: function(value) {
                return this._genericSetter("Id",value);
            },

            leadId: function(value) {
                return this._genericSetter("leadId", value);
            },
            date: function(value) {
                return this._genericSetter("date", value);
            },
            amount: function(value) {
                return this._genericSetter("amount", value);
            },
            comment: function(value) {
                return this._genericSetter("comment", value);
            }
        });
        return DataIncomeplan;
    }
);