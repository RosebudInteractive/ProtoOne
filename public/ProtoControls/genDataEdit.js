/**
 * User: kiknadze
 * Date: 19.03.2015
 * Time: 14:58
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/dataEdit'],
    function(DataEdit) {
        var GenDataEdit = DataEdit.extend({

            className: "GenDataEdit",
            classGuid: "567cadd5-7f9d-4cd8-a24d-7993f065f5f9",
            metaFields: [
                {fname:"Title", ftype:"string"}
            ],

            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;
            },

            title: function(value) {
                return this._genericSetter("Title", value);
            }
        });
        return GenDataEdit;
    }
);