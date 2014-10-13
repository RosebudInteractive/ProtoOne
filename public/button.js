if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['jquery'],
    function($) {
        var Button = Class.extend({

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
             * Рендер кнопки
             */
            render: function() {
                var obj = this.getObj();
                var item = null;
                if (obj) {
                    var top = obj.get('Top')+'px';
                    var left = obj.get('Left')+'px';
                    var caption = obj.get('Caption');
                    item = $('#'+this.guid);
                    if (item.length == 0) {
                        item = $('<input type="button" />').attr('id', this.guid);
                        $(this.options.parent).append(item);
                    }
                    item.css({top:top, left:left}).val(caption);
                }
                return item;
            }

        });
        return Button;
    }
);