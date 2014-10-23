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
             * @param cm ссылка на контрол менеджер
             * @param guid гуид объекта
             * @param options {parent:parentId}
             */
            init: function(cm, params, options) {
                this._super(cm, params);

                this.options = options;
            },

            /**
             * Рендер кнопки
             */
            render: function() {
                var item = null;
                var top = this.top()+'px';
                var left = this.left()+'px';
                var caption = this.caption();
                item = $('#'+this.getGuid());
                if (item.length == 0) {
                    item = $('<input type="button" />').attr('id', this.getGuid());
                    $(this.options.parent).append(item);
                }
                item.css({top:top, left:left}).val(caption);
                return item;
            },

            caption: function(value) {
                return this._genericSetter("Caption", value);
            }


        });
        return Button;
    }
);