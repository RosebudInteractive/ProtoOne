if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/aControl'],
    function(AControl) {
        var MatrixGrid = AControl.extend({

            className: "MatrixGrid",
            classGuid: UCCELLO_CONFIG.classGuids.MatrixGrid,
            metaFields: [ {fname:"HorCells", ftype:"int"}, {fname:"VerCells", ftype:"int"} ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
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