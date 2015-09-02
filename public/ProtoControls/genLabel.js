if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/label'],
    function(Label) {
        var GenLabel = Label.extend({

            className: "GenLabel",
            classGuid: "151c0d05-4236-4732-b0bd-ddcf69a35e25",
            metaFields: [
                {fname:"FontSize",ftype:"string"},
                {fname:"Color",ftype:"string"},
                {fname:"FontFamily",ftype:"string"},
                {fname:"FontWeight",ftype:"string"},
                {fname:"AlignLeft",ftype:"boolean"}

            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;
            },

            // Properties
            label: function(value) {
                return this._genericSetter("Label", value);
            },
            fontSize: function(value) {
                return this._genericSetter("FontSize", value);
            },
            color: function(value) {
                return this._genericSetter("Color", value);
            },
            fontFamily: function(value) {
                return this._genericSetter("FontFamily", value);
            },
            fontWeight: function(value) {
                return this._genericSetter("FontWeight", value);
            }
        });
        return GenLabel;
    }
);