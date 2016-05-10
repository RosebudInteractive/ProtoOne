define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataGrid.html',
        '../../uccello/metaData/metaDefs'],
    function(template, tpl, Meta) {
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
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(grid);

                vDataGrid._setButtonsClicks.call(this);

                grid.focus(function(e) {
                    // установить фокус
                    if (that.getForm().currentControl() != that) {
                        grid.find('[tabIndex=1]').focus();
                        that.getControlMgr().userEventHandler(that, function () {
                            that.setFocused();
                        });
                    }
                });

                // клик на таблицу
                grid.click(function(e){
                    var rowTr = $(e.target).hasClass('data')? $(e.target): $(e.target).parent();
                    if (rowTr.hasClass('data')) {
                        var cursor = rowTr.attr('data-id');
                        var ds = that.dataset();
                        var dsState = !ds ? Meta.State.Unknown : ds.getState();
                        if (ds.cursor() != cursor && that.canMoveCursor()) {
                            vDataGrid.renderCursor.apply(that, [cursor]);
                            that.getControlMgr().userEventHandler(that, function(){
                                that.dataset().cursor(cursor);
                            });
                        }
                    }
                });

                // обработка нажатий стрелочек
                grid.keydown(function(e) {
                    var ds = that.dataset();
                    if (ds.canMoveCursor()) {
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
                    }
                });

            } else {
                table.empty();
            }

            var cm = this.getControlMgr();
            var dataCollection = null;


            if (this.dataset()) {
                dataset = this.dataset();
                if (dataset) {
                    dataCollection = dataset.getDataCollection();
                }
            }

            // header
            var row = $(vDataGrid._templates['row']);
            var columns = this.getCol('Columns');
            var fields = dataset.getCol('Fields');
            if (columns.count() != 0) {

                var columnsArr = [];
                for (var i = 0, len = columns.count(); i < len; i++) {
                    var column = columns.get(i);
                    var header = $(vDataGrid._templates['header']).html(column.label());
                    header.css('width', column.width() + '%');
                    row.append(header);
                    columnsArr.push({field: column.field().getGuid(), width: column.width()});
                }
                table.append(row);
            } else {
                for (var i = 0, len = fields.count(); i < len; i++) {
                    var cell = $(vDataGrid._templates['header']).html(fields.get(i).name()).addClass('w60');
                    row.append(cell);
                }
                table.append(row);
            }

            if (dataCollection)
            {
                var col = dataCollection;
                var idIndex = null, cursor = dataset.cursor(), rows = '', cursorIndex = -1;
                var fieldsArr = {};
                for (var i = 0, len = fields.count(); i < len; i++) {
                    var field = fields.get(i);
                    fieldsArr[field.getGuid()] = field.name();
                    if (field.name() == 'Id')
                        idIndex = field.getGuid();
                }

                if (columns.count() != 0) {
                    // rows
                    var columnsArrLen=columnsArr.length;
                    for (var i = 0, len = col.count(); i < len; i++) {
                        var obj = col.get(i);
                        var id = null, cells = '';

                        // добавляем ячейку
                        for (var j = 0, len2 = columnsArrLen; j < len2; j++) {
                            var text = "Field not found";
                            if (typeof obj[fieldsArr[columnsArr[j].field].charAt(0).toLowerCase() + fieldsArr[columnsArr[j].field].slice(1)] == "function")
                                text = obj[fieldsArr[columnsArr[j].field].charAt(0).toLowerCase() + fieldsArr[columnsArr[j].field].slice(1)]();
                            var width = columnsArr[j].width;
                            cells += '<div class="cell" style="width:'+(width?width:'10%')+'%;">' + (text ? text : '&nbsp;') + '</div>';
                            //if (idIndex == columnsArr[j].field)
                              //  id = text;
                        }
                        
                        id = obj.getGuid();
                        if (dataset.getTypeGuid() === UCCELLO_CONFIG.classGuids.DatasetOld)
                            id = obj.id(); // "Старый" вариант dataset-а
                        
                        rows += '<div class="row data" data-id="' + id + '">' + cells + '</div>';

                        // запоминаем текущий курсор
                        if (cursor == id)
                            cursorIndex = i;
                    }
                }
                else {
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
                    var activeTr = table.find('.row.data:eq(' + cursorIndex + ')'), wrapper = table.parent();
                    if (activeTr.length > 0) {
                        activeTr.addClass('active').attr('tabindex', 1);
                        vDataGrid.scrollTo(activeTr, wrapper);
                    }
                    // если надо отобразить редактирование
                    var dsState = !dataset ? Meta.State.Unknown : dataset.getState();
                    if (this.editable() && (dsState == Meta.State.Insert || dsState == Meta.State.Edit))
                        vDataGrid.renderEditMode.apply(this, [cursorIndex]);
                }
            }

            vDataGrid._setButtonsState.call(this);

            // выставляем фокус
            if (this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                $(grid).find('[tabIndex=1]').focus();
        }

        vDataGrid._setButtonsClicks = function() {
            var that = this;
            var grid = $("#" + this.getLid());
            //grid.find('.refresh').click(function () {
            //    vDataGrid.render.apply(that);
            //});

            grid.find('.refresh').click(function () {
                if (that.dataset())
                    that.getControlMgr().userEventHandler(that, function () {
                        that.dataset().refreshData();
                    });
            });
            
            grid.find('.insert').click(function () {
                if (that.dataset())
                    that.getControlMgr().userEventHandler(that, function () {
                        that.dataset().addObject({}, function(result) {
                            if (result && result.result != "OK") {
                                alert("Error occured: \"" + result.message + "\"");
                            }
                        })
                    });
            });

            grid.find('.update').click(function () {
                if (that.dataset())
                    that.getControlMgr().userEventHandler(that, function () {
                        that.dataset().edit(function(result) {
                            if (result && result.result != "OK") {
                                alert("Error occured: \"" + result.message + "\"");
                            }
                        })
                    });
            });

            grid.find('.delete').click(function () {
                if (that.dataset())
                    that.getControlMgr().userEventHandler(that, function () {
                        that.dataset().deleteObject({}, function(result) {
                            if (result && result.result != "OK") {
                                alert("Error occured: \"" + result.message + "\"");
                            }
                        })
                    });
            });

            grid.find('.save').click(function () {
                if (that.dataset())
                    that.getControlMgr().userEventHandler(that, function () {
                        that.dataset().save({}, function(result) {
                            if (result && result.result != "OK") {
                                alert("Error occured: \"" + result.message + "\"");
                            }
                        })
                    });
            });

            grid.find('.cancel').click(function () {
                if (that.dataset())
                    that.getControlMgr().userEventHandler(that, function () {
                        that.dataset().cancel(function(result) {
                            if (result && result.result != "OK") {
                                alert("Error occured: \"" + result.message + "\"");
                            }
                        })
                    });
            });

        }

        vDataGrid._setButtonsState = function() {
            var ds = this.dataset();
            var dsCanEdit = !ds.canEdit || (ds && ds.canEdit());
            var isMaster = ds && ds.master() ? false : true;
            var dsState = ds ? ds.getState() :  Meta.State.Unknown;
            var dsMasterState = ds && ds.master() ? ds.master().getState() : Meta.State.Unknown;
            var grid = $("#" + this.getLid());

            // insert
            var enabled = dsCanEdit && dsState !=  Meta.State.Unknown &&
                ((isMaster && dsState == Meta.State.Browse) || (!isMaster && dsMasterState <= Meta.State.Edit));
            grid.find('.insert').prop('disabled', !enabled);
            // update
            enabled = dsCanEdit && dsState !=  Meta.State.Unknown && ((isMaster && dsState == Meta.State.Browse) ||
                (!isMaster && dsMasterState <= Meta.State.Edit)) &&
                ds.cursor();
            grid.find('.update').prop('disabled', !enabled);

            // delete
            enabled = dsCanEdit && dsState !=  Meta.State.Unknown && ((isMaster && dsState == Meta.State.Browse) ||
                (!isMaster && dsMasterState <= Meta.State.Edit)) &&
                ds.cursor();
            grid.find('.delete').prop('disabled', !enabled);

            //save & cancel
            enabled = dsCanEdit && dsState !=  Meta.State.Unknown &&
                (
                    (isMaster && (dsState == Meta.State.Edit || dsState == Meta.State.Insert)) ||
                    (!isMaster && dsMasterState == Meta.State.Browse && (dsState == Meta.State.Edit || dsState == Meta.State.Insert))
                ) &&
                ds.cursor();
            grid.find('.save').prop('disabled', !enabled);
            grid.find('.cancel').prop('disabled', !enabled);
        }

        vDataGrid.scrollTo = function(elem, div) {
            if (elem.length > 0  && div.length>0) {
                if (!vDataGrid.isScrolledIntoView(elem, div)) {
                    var currScroll = div.scrollTop(), newScroll = elem.offset().top - div.offset().top + currScroll;
                    if (newScroll > currScroll)
                        div.scrollTop(newScroll - div.height() + elem.height() + 20);
                    else
                        div.scrollTop(newScroll - 20);
                }
            }
            return null;
        }

        vDataGrid.isScrolledIntoView = function(elem, div) {
            var $elem = $(elem);
            var $window = $(div);

            if ($elem.length > 0  && $window.length>0) {
                var docViewTop = $window.scrollTop();
                var docViewBottom = docViewTop + $window.height() - 20;

                var elemTop = $elem.position().top + docViewTop;
                var elemBottom = elemTop + $elem.height();

                return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
            }
            return null;
        }

        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            var table = $('#' + this.getLid()).find('.table'), wrapper = table.parent();
            var rowTr = table.find('.row.data[data-id="'+id+'"]');
            var that = this;
            var dataset = this.dataset();
            var dsState = !dataset ? Meta.State.Unknown : dataset.getState();

            var oldTr = table.find('.row.active');
            oldTr.removeClass('active').attr('tabindex', null);
            var cursorIndex = oldTr.index();
            if (this.editable() && (dsState == Meta.State.Insert || dsState == Meta.State.Edit))
                vDataGrid.renderEditMode.apply(this, [cursorIndex - 1, false]);

            rowTr.addClass('active').attr('tabindex', 1);

            vDataGrid.scrollTo(rowTr, wrapper);

            // выставляем фокус
            if (this.getForm().currentControl() == this)
                rowTr.focus();

            var cursorIndex = rowTr.index();
            if (this.editable() && (dsState == Meta.State.Insert || dsState == Meta.State.Edit))
                vDataGrid.renderEditMode.apply(this, [cursorIndex - 1]);
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

        vDataGrid.renderEditMode = function(cursorIndex, add) {
            var that = this;
            add = add === undefined || add;
            this.pvt.cursorIndex = cursorIndex;
            var cm = this.getControlMgr();
            var dataCollection = null, dataset = null;
            if (this.dataset()) {
                dataset = this.dataset();
                if (dataset)
                    dataCollection = dataset.getDataCollection();
            }

            if (dataCollection) {
                var col = dataCollection, columns = this.getCol('Columns'), fields = this.getCol('Fields');
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
                        if (add) {
                            if (columns.count() > 0 && field.values()) {
                                var input = $('<select class="editField"/>')
                                    .width(child.width() - 4)
                                    .attr('name', name);

                                var values = field.values().split('|');
                                for (var v = 0; v < values.length; v++) {
                                    var option = $('<option/>').attr('value', values[v]).html(values[v]);
                                    input.append(option);
                                }
                                input.val(val);
                            } else {
                                var input = $('<input class="editField"/>')
                                    .width(child.width() - 4)
                                    .attr('name', name)
                                    .val(val);
                            }

                            child.empty();
                            child.append(input);

                            input.blur(function () {
                                var ds = that.dataset();
                                var dsState = !ds ? Meta.State.Unknown : ds.getState();
                                var fieldName = $(this).attr("name");
                                if (ds && fieldName &&
                                    ds.getField(fieldName) != $(this).val() &&
                                    (dsState == Meta.State.Edit || dsState == Meta.State.Insert)) {
                                    var inpt = $(this);
                                    that.getControlMgr().userEventHandler(that, function () {
                                        try {
                                            ds.setField(fieldName, inpt.val());
                                        } catch (ex) {
                                            alert(ex);
                                        }
                                    });
                                }
                            });

                        } else {
                            child.empty();
                            if (val) child.text(val)
                            else child.html("&nbsp;");
                        }
                    }
                }
            }
        }

        vDataGrid.saveRow = function() {
            if (this.editable()) {
                var cm = this.getControlMgr();
                var dataCollection = null, dataset = null;
                if (this.dataset()) {
                    dataset = this.dataset();
                    if (dataset)
                        dataCollection = dataset.getDataCollection();
                }

                if (dataCollection) {
                    var col = dataCollection, columns = this.getCol('Columns'), fields = this.getCol('Fields');
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
            $(grid).find('tr[tabIndex=1]').focus();
        }

        return vDataGrid;
    }
);