define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataGrid.html'],
    function(template, tpl) {
        var vDataGrid = {};
        vDataGrid._templates = template.parseTemplate(tpl);

        /**
         * Рендер DOM грида
         * @param options
         */
        vDataGrid.render = function(options) {
            console.time('renderGrid '+this.name());

            var that = this;
            var grid = $('#' + this.getLid());
            var table = grid.find('.table');
            var dataset = null;

            // если не создан грид
            if (grid.length == 0) {
                grid = $(vDataGrid._templates['grid']).attr('id', this.getLid());
                table = grid.find('.table');
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(grid);

                grid.find('.refresh').click(function () {
                    vDataGrid.render.apply(that);
                });

                // клик на таблицу
                table.click(function(e){
                    var rowTr = $(e.target).parent();
                    if (rowTr.hasClass('data')){
                        e.stopPropagation();
                        that.getControlMgr().userEventHandler(that, function(){
                            vDataGrid.renderCursor.apply(that, [rowTr.attr('data-id')]);
                            that.getControlMgr().getByGuid(that.dataset()).cursor(rowTr.attr('data-id'));
                        });
                    }
                });

            } else {
                table.empty();
            }

            var cm = this.getControlMgr();
            var db = cm.getDB();
            var rootElem = null;

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
                if (obj) {
                    for (var i = 0, len = obj.count(); i < len; i++) {
                        var name = obj.getFieldName(i);
                        if (name == 'Id')
                            idIndex = i;
                        var cell = $(vDataGrid._templates['header']).html(obj.getFieldName(i));
                        row.append(cell);
                    }
                    table.append(row);
                }

                // rows
                var cursor = dataset.cursor(), rows = '', cursorIndex=-1;
                for (var i = 0, len = col.count(); i < len; i++) {
                    var obj = col.get(i);
                    var id = null, cells = '';

                    // добавляем ячейка
                    for (var j = 0, len2 = obj.count(); j < len2; j++) {
                        var text = obj.get(j);
                        cells += '<div class="cell">'+(text? text: '&nbsp;')+'</div>';
                        if (idIndex == j)
                            id = text;
                    }
                    rows += '<div class="row data" data-id="'+id+'">'+cells+'</div>';

                    // запоминаем текущий курсор
                    if (cursor == id)
                        cursorIndex = i;
                }
                table.append(rows);

                // устанавливаем курсор
                if (cursorIndex != -1)
                    table.find('.row.data:eq('+cursorIndex+')').addClass('active');
            }

            grid.css({top: this.top() + 'px', left: this.left() + 'px', width: this.width() + 'px', height: this.height() + 'px'});
            console.timeEnd('renderGrid '+this.name());
        }

        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            var table = $('#' + this.getLid()).find('.table');
            var rowTr = table.find('.row.data[data-id='+id+']');
            table.find('.row.active').removeClass('active');
            rowTr.addClass('active');
        }

        /**
         * Рендер ячейки грида
         * @param id
         * @param index
         * @param value
         */
        vDataGrid.renderCell = function(id, index, value) {
            var table = $('#' + this.getLid()).find('.table');
            var rowTr = table.find('.row.data[data-id='+id+']');
            $(rowTr.children()[index]).html(value);
        }
        return vDataGrid;
    }
);