define(
    ['/public/uccello/uses/template.js', 'text!./templates/gContainer.html'],
    function(template, tpl) {
        var vGContainer = {};
        vGContainer._templates = template.parseTemplate(tpl);
        vGContainer.render = function(options) {
            var lid = this.getLid();
            var item = $('#' + lid);
            if (item.length == 0) {
                var cm = this.getControlMgr();

                // объект контейнера
                item = $(vGContainer._templates['container']).attr('id', lid);


                var columns = this.getCol('Columns');
                var rows = this.getCol('Rows');
                var cells = this.getCol('Cells');

                // получаем инфоданные из столбцов и строк
                var rowsComps = [], columnComps = [];
                for(var i=0; i<rows.count();i++) {
                    var row = cm.get(rows.get(i).getGuid());
                    var height = row.height();
                    if ($.isNumeric(height)) height+='px';
                    rowsComps.push({height: height});
                }
                for(var i=0; i<columns.count();i++) {
                    var column = cm.get(columns.get(i).getGuid());
                    var width = column.width();
                    if ($.isNumeric(width)) width+='px';
                    columnComps.push({width: width});
                }

                // создаем объект грида
                var tableEl = $('<table></table>');
                for(var i=0; i<rowsComps.length;i++) {
                    var columnEl = $('<tr valign="top"></tr>');
                    for(var j=0; j<columnComps.length;j++) {
                        var rowEl = $('<td></td>').attr('id', 'td_'+lid+'_'+j+'_'+i).css({height: rowsComps[i].height, width: columnComps[j].width});
                        columnEl.append(rowEl);
                    }
                    tableEl.append(columnEl);
                }

                // объеденяем ячейки
                for(var i=0; i<cells.count();i++) {
                    var column = cm.get(cells.get(i).getGuid());
                    var left = column.left(), top = column.top(), width = column.width(), height = column.height();
                    if (width || height) {
                        var cell = tableEl.find('#td_'+lid+'_'+left+'_'+top);
                        if (width) {
                            cell.attr('colspan', width);
                            for(var cellRight=left+1; cellRight<left+width; cellRight++)
                                tableEl.find('#td_'+lid+'_'+cellRight+'_'+top).addClass('splittcell');
                        }
                        if (height){
                            cell.attr('rowspan', height);
                            for(var rowBottom=top+1; rowBottom<top+height; rowBottom++)
                                tableEl.find('#td_'+lid+'_'+left+'_'+rowBottom).addClass('splittcell');
                        }
                    }
                }
                tableEl.find('.splittcell').remove();

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = cm.get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var cell = tableEl.find('#td_'+lid+'_'+child.left()+'_'+child.top());
                    cell.append(div);
                }

                // добавляем табличку
                item.append(tableEl);

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + lid: options.rootContainer;
                $(parent).append(item);
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }

        return vGContainer;
    }
);