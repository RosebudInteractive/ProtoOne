define(
    ['/public/uccello/uses/template.js', 'text!./templates/grid.html'],
    function(template, tpl) {
        var vGrid = {};
        vGrid._templates = template.parseTemplate(tpl);
        vGrid.render = function(options) {
            var table = $('#' + this.getLid());
            if (table.length == 0) {
                table = $(vGrid._templates['grid']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(table);
            } else {
                table.empty();
            }
            return;

            if (this.rootElem()) {
                var rootElem = this.getControlMgr().getDB().getObj(this.rootElem());
                var col = rootElem.getCol('DataElements');

                // header
                var row = $(vGrid._templates['row']);
                var obj = col.get(0);
                for (var i = 0, len = obj.count(); i < len; i++) {
                    var cell = $(vGrid._templates['header']).html(obj.getFieldName(i));
                    row.append(cell);
                }
                table.append(row);

                // rows
                var row = $(vGrid._templates['row']);
                for (var i = 0, len = col.count(); i < len; i++) {
                    var obj = col.get(i);
                    var row = $(vGrid._templates['row']);
                    for (var i = 0, len = obj.count(); i < len; i++) {
                        var cell = $(vGrid._templates['header']).html(obj.get(i));
                        row.append(cell);
                    }
                    table.append(row);
                }
            }

            table.css({top: this.top() + 'px', left: this.left() + 'px', width: this.width() + 'px', height: this.height() + 'px'});
        }
        return vGrid;
    }
);