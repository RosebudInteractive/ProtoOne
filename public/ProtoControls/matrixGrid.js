if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/aControl'],
    function(AControl) {
        var MatrixGrid = AControl.extend({

            className: "MatrixGrid",
            classGuid: "827a5cb3-e934-e28c-ec11-689be18dae97",
            metaFields: [ {fname:"HorCells", ftype:"int"}, {fname:"VerCells", ftype:"int"} ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm,params);
                this.params = params;
            },

            horCells: function(value) {
                return this._genericSetter("HorCells", value);
            },

            verCells: function(value) {
                return this._genericSetter("VerCells", value);
            }

        });
        return MatrixGrid;
    }
);