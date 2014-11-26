if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/controls/aControl'],
    function(AControl) {
        var PropEditor = AControl.extend({

            className: "PropEditor",
            classGuid: "a0e02c45-1600-6258-b17a-30a56301d7f1",
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