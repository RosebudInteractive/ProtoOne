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

            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
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
                    var item = $('#' + this.getLid());
                    var parent = (this.getParent()? '#' + this.getParent().getLid(): this.params.rootContainer);
                    if (item.length == 0) {
                        item = $(this._templates['container']).attr('id', this.getLid());
                        $(parent).append(item);
                    }
                    item.css({top: this.top() + 'px', left: this.left() + 'px'});

                    // убираем удаленные объекты
                    var del = this.getObj().getLogCol('Children').del;
                    for (var guid in del)
                        $('#' + del[guid].getLid()).remove();
                }
            }

        });
        return Container;
    }
);