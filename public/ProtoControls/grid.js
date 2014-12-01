if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/controls/aControl'],
    function(AControl) {
        var Grid = AControl.extend({

            className: "Grid",
            classGuid: "ff7830e2-7add-e65e-7ddf-caba8992d6d8",
            metaFields: [ {fname: "RootElem", ftype: "string"} ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm,params);
                this.params = params;
            },

            rootElem: function (value) {
                return this._genericSetter("RootElem", value);
            }

        });
        return Grid;
    }
);