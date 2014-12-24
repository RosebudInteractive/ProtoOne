define(
    ['/public/uccello/uses/template.js', 'text!./templates/grid.html'],
    function(template, tpl) {
        var vGrid = {};
        vGrid._templates = template.parseTemplate(tpl);
        vGrid.render = function(options) {
            var that = this;
            var grid = $('#' + this.getLid());
            var table = grid.find('.table');
            if (grid.length == 0) {
                grid = $(vGrid._templates['grid']).attr('id', this.getLid());
                table = grid.find('.table');
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(grid);

                grid.find('.refresh').click(function () {
                    vGrid.render.apply(that);
                });

            } else {
                table.empty();
            }

            var rootElem = null;
            var cm = this.getControlMgr();
            var db = cm.getDB();
            if (this.dataset()) {
                rootElem = cm.getByGuid(this.dataset()).root();
                rootElem = rootElem? db.getObj(rootElem): null;
            }

            if (rootElem)
            {
                var col = rootElem.getCol('DataElements');

                // header
                var row = $(vGrid._templates['row']);
                var obj = col.get(0);
                var idIndex = null;
                for (var i = 0, len = obj.count(); i < len; i++) {
                    var name = obj.getFieldName(i);
                    if (name == 'Id')
                        idIndex = i;
                    var cell = $(vGrid._templates['header']).html(obj.getFieldName(i));
                    row.append(cell);
                }
                table.append(row);

                // rows
                var cursor = that.cursor();
                for (var i = 0, len = col.count(); i < len; i++) {
                    var obj = col.get(i);
                    var id = null;
                    var row = $(vGrid._templates['row']);

                    // добавляем ячейка
                    for (var j = 0, len2 = obj.count(); j < len2; j++) {
                        var text = obj.get(j);
                        var cell = $(vGrid._templates['cell']).html(text? text: '&nbsp;');
                        row.append(cell);
                        if (idIndex == j)
                            id = text;
                    }

                    // клик на строку
                    (function(row, id) {
                        row.click(function(){
                            $(this).parent().find('.row.active').removeClass('active');
                            $(this).addClass('active');
                            that.cursor(id);
                            db.getController().genDeltas(db.getGuid());
                        });
                    })(row, id);

                    // выделяем текущий курсор
                    if (cursor == id)
                        $(row).addClass('active');

                    table.append(row);
                }
            }

            grid.css({top: this.top() + 'px', left: this.left() + 'px', width: this.width() + 'px', height: this.height() + 'px'});
        }
        return vGrid;
    }
);