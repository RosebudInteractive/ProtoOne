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
             * @param params
             */
            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
            },

            /**
             * Рендер кнопки
             */
            render: function() {
                var that = this;
                // обработка шаблонов
                if (!this._templates) {
                    require(['/public/uccello/uses/template.js', 'text!./templates/button.html'], function(template, tpl){
                        that._templates = template.parseTemplate(tpl);
                        //that.render();
						that.render.apply(that);
                    });
                } else {
                    var item = $('#' + this.getLid());
                    if (item.length == 0) {
                        item = $(this._templates['button']).attr('id', this.getLid());
                        var parent = '#' + (this.getParent()? this.getParent().getLid():this.params.rootContainer);
                        $(parent).append(item);
                    }
                    item.css({top: this.top() + 'px', left: this.left() + 'px'}).val(this.caption());
                }
            },

			// Properties
			
            caption: function(value) {
                return this._genericSetter("Caption", value);
            }


        });
        return Button;
    }
);