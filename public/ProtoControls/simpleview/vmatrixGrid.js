define(
    ['/public/uccello/uses/template.js', 'text!./templates/matrixGrid.html'],
    function(template, tpl) {
        var vMatrixGrid = {};
        vMatrixGrid._templates = template.parseTemplate(tpl);
        vMatrixGrid.render = function(options) {
            var table = $('#' + this.getLid());
            if (table.length == 0) {
                table = $(vMatrixGrid._templates['matrixGrid']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(table);
            } else {
                table.empty();
            }
            var x = this.horCells();
            var y = this.verCells();
            for (var i = 0; i < y; i++) {
                var row = $(vMatrixGrid._templates['row']);
                for (var j = 0; j < x; j++) {
                    var cell = $(vMatrixGrid._templates['cell']);
                    row.append(cell);
                }
                table.append(row);
            }
        }
        return vMatrixGrid;
    }
);