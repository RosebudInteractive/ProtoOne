/**
 * User: kiknadze
 * Date: 18.06.2015
 * Time: 13:17
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/form'],
    function(Form) {
        var GenForm = Form.extend({

            className: "GenForm",
            classGuid: "29bc7a01-2065-4664-b1ad-7cc86f92c177",
            metaFields: [
                {fname:"IsCentered", ftype:"boolean"}
            ],

            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;
            },

            isCentered: function(value) {
                return this._genericSetter("IsCentered", value);
            }
        });
        return GenForm;
    }
);
