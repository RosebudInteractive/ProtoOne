if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var Button = AControl.extend({

			className: "Button",
			classGuid: "af419748-7b25-1633-b0a9-d539cada8e0d",
            metaFields: [ {fname:"Caption",ftype:"string"} ],

            /**
             * Инициализация объекта
             * @param db ссылка на БД
             * @param guid гуид объекта
             * @param options {parent:parentId}
             */
            init: function(db, guid, options) {
                this._super(db);

                this.guid = guid;
                this.db = db;
                this.options = options;
            },

            getGuid: function(){
                return this.guid;
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