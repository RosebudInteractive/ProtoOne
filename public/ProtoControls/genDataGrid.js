if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

/**
 * A module representing a GenDataGrid.
 * @module ProtoControls/genDataGrid
 */
define(
    [UCCELLO_CONFIG.uccelloPath+'controls/dataGrid'],
    function(DataGrid) {
        /**
         * @constructor
         * @alias module:ProtoControls/genDataGrid
         */
        var GenDataGrid = DataGrid.extend({

            className: "GenDataGrid",
            classGuid: "55d59ec4-77ac-4296-85e1-def78aa93d55",
            metaFields: [
                {fname:"Alternate", ftype:"boolean"},
                {fname:"HorizontalLines", ftype:"boolean"},
                {fname:"VerticalLines", ftype:"boolean"},
                {fname:"BigSize", ftype:"boolean"},
                {fname:"WhiteHeader", ftype:"boolean"},
                {fname:"HasFooter", ftype:"boolean"},
                {fname:"Scroll", ftype:"boolean"},
                {fname:"BodyBackground", ftype:"string"}
            ],
            metaCols: [ ],

            /**
             * Инициализация объекта
             * @param cm {ControlMgr} на контрол менеджер
             * @param params{*} параметры инициализации
             */
            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;

                this.initRender();

                this._source = {
                    datatype: "json",
                    datafields: [],
                    localdata: '{}',
                    id:'Id'
                };
            },

            /**
             * Свойсва
             */
            alternate: function(value) {
                return this._genericSetter("Alternate", value);
            },
            horizontalLines: function(value) {
                return this._genericSetter("HorizontalLines", value);
            },
            verticalLines: function(value) {
                return this._genericSetter("VerticalLines", value);
            },
            bigSize: function(value) {
                return this._genericSetter("BigSize", value);
            },
            whiteHeader: function(value) {
                return this._genericSetter("WhiteHeader", value);
            },
            hasFooter: function(value) {
                return this._genericSetter("HasFooter", value);
            },
            scroll: function(value) {
                return this._genericSetter("Scroll", value);
            },

            /**
             * Рендер контрола
             * @param viewset
             * @param options
             */
            irender: function(viewset, options) {

                // проверяем ширины столбцов
                //var columns = this.getObj().getCol('Columns');
                var columns = this.getCol('Columns');
                if (columns) {
                    var modified = false;
                    for (var i = 0, len = columns.count(); i < len; i++) {
                        var column = columns.get(i);
                        if (column.isFldModified("Width")) {
                            modified = true;
                            viewset.renderWidth.apply(this, [i, column.width()]);
                            if (modified)
                                return;
                        }
                    }
                }

                // если надо лишь передвинуть курсор
                if (this.isOnlyCursor()) {
                    viewset.renderCursor.apply(this, [this.dataset().cursor()]);
                    return;
                }

                // рендерим DOM
                viewset.render.apply(this, [options]);
            },

            /**
             * Нужно перерендерить только курсор
             * @returns {boolean}
             */
            isOnlyCursor: function() {
                if (this.dataset()) {
                    var ds = this.dataset();
                    if  ((!ds.isDataSourceModified()) && (ds.isFldModified("Cursor")) && (!this.isDataModified()))
                        return true;
                    else
                        return false;
                }
                else return false;
            },

            initRender: function() {
                this.pvt.renderDataVer = undefined;
            }


        });
        return GenDataGrid;
    }
);