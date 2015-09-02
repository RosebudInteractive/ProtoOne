if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/button'],
    function(Button) {
        var GenButton = Button.extend({

			className: "GenButton",
			classGuid: UCCELLO_CONFIG.classGuids.GenButton,
            metaFields: [
                {fname:"Background",ftype:"string"},
                {fname:"Color",ftype:"string"},
                {fname:"BorderColor",ftype:"string"},
                {fname:"ExtendedClass",ftype:"string"},
                {fname:"ContentAlign",ftype:"string"}
            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param params
             */
            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;
            },

			// Properties
            caption: function(value) {
                return this._genericSetter("Caption", value);
            },

            background: function(value) {
                return this._genericSetter("Background", value);
            },

            color: function(value) {
                return this._genericSetter("Color", value);
            },

            borderColor: function(value) {
                return this._genericSetter("BorderColor", value);
            },
            extendedClass: function(value) {
                return this._genericSetter("ExtendedClass", value);
            }
        });
        return GenButton;
    }
);