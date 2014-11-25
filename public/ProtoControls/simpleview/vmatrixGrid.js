if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var VMatrixGrid = Class.extend({

            /**
             * Рендер
             */
            render: function() {
                var that = this;
                require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/matrixGrid.html'], function(template, tpl){
                    if (!that._templates)
                        that._templates = template.parseTemplate(tpl);

                    var table = $('#' + that.getLid());
                    if (table.length == 0) {
                        table = $(that._templates['matrixGrid']).attr('id', that.getLid());
                        var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                        $(parent).append(table);
                    } else {
                        table.empty();
                    }
                    var x = that.horCells();
                    var y = that.verCells();
                    for (var i = 0; i < y; i++) {
                        var row = $(that._templates['row']);
                        for (var j = 0; j < x; j++) {
                            var cell = $(that._templates['cell']);
                            row.append(cell);
                        }
                        table.append(row);
                    }
                    table.css({top: that.top() + 'px', left: that.left() + 'px'});
                });
            }
        });
        return VMatrixGrid;
    }
);