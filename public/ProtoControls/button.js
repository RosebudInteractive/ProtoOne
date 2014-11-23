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
                var that = this;
				console.log("ext render button "+this.getGuid());
                // обработка шаблонов
                if (!this._templates) {
                    require(['/public/uccello/uses/template.js', 'text!./templates/button.html'], function(template, tpl){
                        that._templates = template.parseTemplate(tpl);
                        //that.render();
						that.render.apply(that);
                    });
                } else {
					console.log("render button "+this.getGuid());
                    var item = $('#' + this.getGuid());
                    if (item.length == 0) {
                        item = $(this._templates['button']).attr('id', this.getGuid());
                        $(this.options.parent).append(item);
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