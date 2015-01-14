define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataGrid.html'],
    function(template, tpl) {
        var vDataGrid = {};
        vDataGrid._templates = template.parseTemplate(tpl);
        vDataGrid.render = function(options) {
            var that = this;
            var grid = $('#' + this.getLid());
            var table = grid.find('.table');
            if (grid.length == 0) {
                grid = $(vDataGrid._templates['grid']).attr('id', this.getLid());
                table = grid.find('.table');
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(grid);

                grid.find('.refresh').click(function () {
                    vDataGrid.render.apply(that);
                });

            } else {
                table.empty();
            }

            var cm = this.getControlMgr();
            var db = cm.getDB();
            var rootElem = null;
            var dataset = null;
            if (this.dataset()) {
                dataset = cm.getByGuid(this.dataset());
                if (dataset) {
                    rootElem = dataset.root();
                    rootElem = rootElem? db.getObj(rootElem): null;
                }
            }

            if (rootElem)
            {
                var col = rootElem.getCol('DataElements');

                // header
                var row = $(vDataGrid._templates['row']);
                var obj = col.get(0);
                var idIndex = null;
                for (var i = 0, len = obj.count(); i < len; i++) {
                    var name = obj.getFieldName(i);
                    if (name == 'Id')
                        idIndex = i;
                    var cell = $(vDataGrid._templates['header']).html(obj.getFieldName(i));
                    row.append(cell);
                }
                table.append(row);

                // rows
                var cursor = dataset.cursor();
                for (var i = 0, len = col.count(); i < len; i++) {
                    var obj = col.get(i);
                    var id = null;
                    var row = $(vDataGrid._templates['row']);

                    // добавляем ячейка
                    for (var j = 0, len2 = obj.count(); j < len2; j++) {
                        var text = obj.get(j);
                        var cell = $(vDataGrid._templates['cell']).html(text? text: '&nbsp;');
                        row.append(cell);
                        if (idIndex == j)
                            id = text;
                    }

                    // клик на строку
                    (function(row, id) {
                        row.click(function(){
                            var rowTr = $(this);
                            that.getControlMgr().userEventHandler(that, function(){
                                rowTr.parent().find('.row.active').removeClass('active');
                                rowTr.addClass('active');
                                that.getControlMgr().userEventHandler(that, function(){
                                    dataset.cursor(id);
                                });
                            });
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
        return vDataGrid;
    }
);