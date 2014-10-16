if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['jquery', '../uccello/baseControls/aControl'],
    function($, AControl) {
        var MatrixGrid = AControl.extend({

            /**
             * Инициализация объекта
             * @param db ссылка на БД
             * @param guid гуид объекта
             * @param options {parent:parentId}
             */
            init: function(db, guid, options) {
                this.guid = guid;
                this.db = db;
                this.options = options;
            },

            getObj: function() {
                return this.db.getObj(this.guid);
            },

            /**
             * Рендер
             */
            render: function() {

            }

        });
        return MatrixGrid;
    }
);