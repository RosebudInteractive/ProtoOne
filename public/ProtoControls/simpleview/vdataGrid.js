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
            //if (DEBUG) console.time('renderGrid '+this.name());
            console.log('render '+this.name());
            var that = this;
            var grid = $('#' + this.getLid());
            var table = grid.find('.table');
            var dataset = null;

            // если не создан грид
            if (grid.length == 0) {
                grid = $(vDataGrid._templates['grid']).attr('id', this.getLid());
                table = grid.find('.table');
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(grid);

                grid.find('.refresh').click(function () {
                    vDataGrid.render.apply(that);
                });

                // установить фокус
                grid.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                    }
                });

                // клик на таблицу
                grid.click(function(e){
                    console.log('TEST click '+that.name());
                    var rowTr = $(e.target).hasClass('data')? $(e.target): $(e.target).parent();
                    if (rowTr.hasClass('data')){
                        //e.stopPropagation();
                        vDataGrid.renderCursor.apply(that, [rowTr.attr('data-id')]);
                        that.getControlMgr().userEventHandler(that, function(){
                           // vDataGrid.saveRow.apply(that);
                            that.dataset().cursor(rowTr.attr('data-id'));
                            that.setFocused();
                        });
                    }/* else
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });*/
                });

                // обработка нажатий стрелочек
                grid.keydown(function(e) {
                    var keyCode = e.keyCode || e.which, control;
                    switch (keyCode) {
                        case 38:     // up
                            e.preventDefault();
                            that.getControlMgr().userEventHandler(that, function() {
                                that.dataset().prev();
                            });
                            break;
                        case 40:     // down
                            e.preventDefault();
                            that.getControlMgr().userEventHandler(that, function() {
                                that.dataset().next();
                            });

                            break;
                    }
                });

            } else {
                table.empty();
            }

            var cm = this.getControlMgr();
            var rootElem = null;


            if (this.dataset()) {
                dataset = this.dataset();
                if (dataset) {
                    rootElem = dataset.root();
                }
            }

            if (rootElem)
            {
                var col = rootElem.getCol('DataElements');
                var columns = this.getCol('Columns');
                var fields = dataset.getCol('Fields');
                var idIndex = null, cursor = dataset.cursor(), rows = '', cursorIndex = -1;
                var fieldsArr = {};
                for (var i = 0, len = fields.count(); i < len; i++) {
                    var field = fields.get(i);
                    fieldsArr[field.getGuid()] = field.name();
                    if (field.name() == 'Id')
                        idIndex = field.getGuid();
                }

                if (columns.count() != 0) {
                    // header
                    var row = $(vDataGrid._templates['row']), columnsArr=[];
                    for (var i = 0, len = columns.count(); i < len; i++) {
                        var column = columns.get(i);
                        var header = $(vDataGrid._templates['header']).html(column.label());
                        header.css('width', column.width()+'%');
                        row.append(header);
                        columnsArr.push({ field: column.field().getGuid(), width: column.width() });
                    }
                    table.append(row);

                    // rows
                    var columnsArrLen=columnsArr.length;
                    for (var i = 0, len = col.count(); i < len; i++) {
                        var obj = col.get(i);
                        var id = null, cells = '';

                        // добавляем ячейку
                        for (var j = 0, len2 = columnsArrLen; j < len2; j++) {
                            var text = obj[fieldsArr[columnsArr[j].field].charAt(0).toLowerCase() + fieldsArr[columnsArr[j].field].slice(1)]();
                            var width = columnsArr[j].width;
                            cells += '<div class="cell" style="width:'+(width?width:'10%')+'%;">' + (text ? text : '&nbsp;') + '</div>';
                            //if (idIndex == columnsArr[j].field)
                              //  id = text;
                        }
                        id = obj.id();
                        rows += '<div class="row data" data-id="' + id + '">' + cells + '</div>';

                        // запоминаем текущий курсор
                        if (cursor == id)
                            cursorIndex = i;
                    }
                }
                else {

                    // header
                    var row = $(vDataGrid._templates['row']);
                    for (var i = 0, len = fields.count(); i < len; i++) {
                        var cell = $(vDataGrid._templates['header']).html(fields.get(i).name()).addClass('w60');
                        row.append(cell);
                    }
                    table.append(row);

                    // rows
                    for (var i = 0, len = col.count(); i < len; i++) {
                        var obj = col.get(i);
                        var id = null, cells = '';

                        // добавляем ячейку
                        for (var j in fieldsArr) {
                            var text = obj[fieldsArr[j].charAt(0).toLowerCase() + fieldsArr[j].slice(1)]();
                            cells += '<div class="cell w60">' + (text ? text : '&nbsp;') + '</div>';
                            if (idIndex == j)
                                id = text;
                        }
                        rows += '<div class="row data" data-id="' + id + '">' + cells + '</div>';

                        // запоминаем текущий курсор
                        if (cursor == id)
                            cursorIndex = i;
                    }
                }

                table.append(rows);

                // устанавливаем курсор
                if (cursorIndex != -1) {
                    table.find('.row.data:eq(' + cursorIndex + ')').addClass('active');
                    // если надо отобразить редактирование
                    if (this.editable())
                        vDataGrid.renderEditMode.apply(this, [cursorIndex]);
                }
            }

            // выставляем фокус
            if (this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $(grid).focus();

            //if (DEBUG) console.timeEnd('renderGrid '+this.name());
        }

        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            var table = $('#' + this.getLid()).find('.table');
            var rowTr = table.find('.row.data[data-id='+id+']');
            var that = this;
            table.find('.row.active').removeClass('active');
            rowTr.addClass('active');
        }

        /**
         * Рендер ячейки грида
         * @param id
         * @param datafield
         * @param value
         */
        vDataGrid.renderCell = function(id, datafield, value) {
            //var index=null, columns = this.getObj().getCol('Columns');
			var index=null, columns = this.getCol('Columns');
            if (columns) {
                for (var i = 0, len = columns.count(); i < len; i++) {
                    if (columns.get(i).field() == datafield) {
                        index = i;
                        break;
                    }
                }
                if (index) {
                    var table = $('#' + this.getLid()).find('.table');
                    var rowTr = table.find('.row.data[data-id='+id+']');
                    $(rowTr.children()[index]).html(value);
                }
            }
        }

        /**
         * Рендер ширины столбца
         * @param index
         * @param width
         */
        vDataGrid.renderWidth = function(index, width) {
            var table = $('#' + this.getLid()).find('.table');
            var header = table.find('.header');
            $(header.children()[index]).css('width', width+'%');
            var rowsTr = table.find('.row');
            for(var i = 0, len = rowsTr.length; i<len; i++)
                $($(rowsTr[i]).children()[index]).css('width', width+'%');
        }

        /**
         * Рендер столбца
         * @param index
         * @param full true-полный рендер с данными, false-только аттрибуты и заголовок
         */
        vDataGrid.renderColumn = function(index, full) {
			var column = this.getCol('Columns').get(index);
            var width = column.width();
            var table = $('#' + this.getLid()).find('.table');
            var header = table.find('.header');
            $(header.children()[index]).css('width', width+'%');
            var rowsTr = table.find('.row');
            for(var i = 0, len = rowsTr.length; i<len; i++)
                $($(rowsTr[i]).children()[index]).css('width', width+'%');
        }

        vDataGrid.renderEditMode = function(cursorIndex) {
            this.pvt.cursorIndex = cursorIndex;
            var cm = this.getControlMgr();
            var rootElem = null, dataset = null;
            if (this.dataset()) {
                dataset = this.dataset();
                if (dataset)
                    rootElem = dataset.root();
            }

            if (rootElem) {
                var col = rootElem.getCol('DataElements'), columns = this.getCol('Columns'), fields = this.getCol('Fields');
                var cursor = col.get(cursorIndex);
                var table = $('#' + this.getLid()).find('.table');
                if (cursor) {
                    var row = table.find('.row.data:eq(' + cursorIndex + ')');
                    var tFields = columns.count()>0 ? columns : fields;
                    for (var i = 0, len = columns.count(); i < len; i++) {
                        var child =  $(row.children()[i]),
                            field = tFields.get(i),
                            name = columns.count()>0 ? field.field().name() : field.name(),
                            val = cursor[name.charAt(0).toLowerCase() + name.slice(1)]();

                        if (columns.count()>0 && field.values()) {
                            var input = $('<select class="editField"/>')
                                .width(child.width()-4)
                                .attr('name', name);

                                var values = field.values().split('|');
                                for(var v = 0; v < values.length; v++) {
                                    var option = $('<option/>').attr('value', values[v]).html(values[v]);
                                    input.append(option);
                                }
                                input.val(val);
                        } else {
                            var input = $('<input class="editField"/>')
                                .width(child.width()-4)
                                .attr('name', name)
                                .val(val);
                        }

                        child.empty();
                        child.append(input);
                    }
                }
            }
        }

        vDataGrid.saveRow = function() {
            if (this.editable()) {
                var cm = this.getControlMgr();
                var rootElem = null, dataset = null;
                if (this.dataset()) {
                    dataset = this.dataset();
                    if (dataset)
                        rootElem = dataset.root();
                }

                if (rootElem) {
                    var col = rootElem.getCol('DataElements'), columns = this.getCol('Columns'), fields = this.getCol('Fields');
                    var cursor = col.get(this.pvt.cursorIndex);
                    if (cursor) {
                        var table = $('#' + this.getLid()).find('.table');
                        var edits = table.find('.editField');
                        for(var i=0, len=edits.length; i<len; i++) {
                            var name = $(edits[i]).attr('name');
                            var val = $(edits[i]).val();
                            cursor[name.charAt(0).toLowerCase() + name.slice(1)](val);
                        }
                    }
                }
            }
        }

        vDataGrid.setFocus = function() {
            var grid = $('#' + this.getLid());
            $(grid).focus();
        }

        return vDataGrid;
    }
);