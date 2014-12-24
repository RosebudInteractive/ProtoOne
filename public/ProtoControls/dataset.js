if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/controls/aComponent'],
    function(AComponent) {
        var Dataset = AComponent.extend({

            className: "Dataset",
            classGuid: "3f3341c7-2f06-8d9d-4099-1075c158aeee",
            metaFields: [ {fname: "Root", ftype: "string"} ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm,params);
                this.params = params;
            },

            root: function (value) {
                return this._genericSetter("Root", value);
            }

        });
        return Dataset;
    }
);