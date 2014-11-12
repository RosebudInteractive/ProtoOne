if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var Edit = AControl.extend({

            className: "Edit",
            classGuid: "f79d78eb-4315-5fac-06e0-d58d07572482",
            metaFields: [ {fname:"Value",ftype:"string"} ],

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

            render: function() {
                var that = this;
                // обработка шаблонов
                if (!this._templates) {
                    require(['/public/uccello/uses/template.js', 'text!./templates/edit.html'], function(template, tpl){
                        that._templates = template.parseTemplate(tpl);
                        that.render();
                    });
                } else {
                    var item = $('#' + this.getGuid());
                    if (item.length == 0) {
                        item = $(this._templates['edit']).attr('id', this.getGuid());
                        $(this.options.parent).append(item);
                    }
                    item.css({top: this.top() + 'px', left: this.left() + 'px'}).val(this.value());
                }
            },

            // Properties

            value: function(value) {
                return this._genericSetter("Value", value);
            }


        });
        return Edit;
    }
);