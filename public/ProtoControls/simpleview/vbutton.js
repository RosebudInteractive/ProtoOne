if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var VButton = Class.extend({

            /**
             * Рендер кнопки
             */
            render: function() {
                var that = this;
                require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/button.html'], function(template, tpl){
                    if (!that._templates)
                        that._templates = template.parseTemplate(tpl);

                    var item = $('#' + that.getLid());
                    if (item.length == 0) {
                        item = $(that._templates['button']).attr('id', that.getLid());
                        var parent = '#' + (that.getParent()? that.getParent().getLid():that.params.rootContainer);
                        $(parent).append(item);
                    }
                    item.css({top: that.top() + 'px', left: that.left() + 'px'}).val(that.caption());
                });
            }
        });
        return VButton;
    }
);