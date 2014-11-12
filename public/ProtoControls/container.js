if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var Container = AControl.extend({

            className: "Container",
            classGuid: "1d95ab61-df00-aec8-eff5-0f90187891cf",
            metaCols: [ {"cname": "Children", "ctype": "control"} ],
            metaFields: [],

            init: function(cm, params, options) {
                this._super(cm, params);
                this.options = options;
            },

            render: function() {
                var that = this;
                // обработка шаблонов
                if (!this._templates) {
                    require(['/public/uccello/uses/template.js', 'text!./templates/container.html'], function(template, tpl){
                        that._templates = template.parseTemplate(tpl);
                        that.render();
                    });
                } else {
                    var item = $('#' + this.getGuid());
                    if (item.length == 0) {
                        item = $(this._templates['container']).attr('id', this.getGuid());
                        $(this.options.parent).append(item);
                    }
                    item.css({top: this.top() + 'px', left: this.left() + 'px'});
                }
            }

        });
        return Container;
    }
);