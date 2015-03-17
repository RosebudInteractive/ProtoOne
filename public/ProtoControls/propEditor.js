if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/aControl'],
    function(AControl) {
        var PropEditor = AControl.extend({

            className: "PropEditor",
            classGuid: UCCELLO_CONFIG.classGuids.PropEditor,
            metaFields: [
                {fname: "Control", ftype: "string"}
            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param params
             */
            init: function (cm, params) {
                this._super(cm, params);
                this.params = params;
            },

            control: function (value) {
                return this._genericSetter("Control", value);
            }

        });
        return PropEditor;
});