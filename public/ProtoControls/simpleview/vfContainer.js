define(
    ['/public/uccello/uses/template.js', 'text!./templates/fContainer.html'],
    function(template, tpl) {
        var vFContainer = {};
        vFContainer._templates = template.parseTemplate(tpl);
        vFContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vFContainer._templates['container']).attr('id', this.getLid());
                var isRoot = this.hasGrid();
                this._isRoot = isRoot;
                if (isRoot) {
                    this._rows = [];
                    this._childrenGenerators = [];
                    var parGen = vFContainer.getParentFlex.call(this);
                    if (parGen != this)
                        parGen._childrenGenerators.push({context: this, func: vFContainer.resizeHandler});
                } else {
                    this._rows = null;
                }


                var row = vFContainer.getRow.call(this, item);

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var curStr = child.layoutProp();

                    // если конец строки, то добавляем новый row
                    var curStrParts = curStr.trim().split(",");

                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var ch = vFContainer.getObj.call(this, curStr, row, div)
                    ch.width = child.width();

                    if (curStrParts[curStrParts.length - 1].length >= 2 &&
                        curStrParts[curStrParts.length - 1].toUpperCase().trim().substr(0,2) == "BR") {
                        var brSign = curStrParts[curStrParts.length - 1];
                        row.grow = brSign.toUpperCase().indexOf("(TRUE)") >= 0
                        row = vFContainer.getRow.call(this, item);
                        row.grow = false;
                    }

                }

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                var that = this;
                if (vFContainer.isRootFlex.call(this)) {
                    $(window).off("resize").resize(function () {
                        vFContainer.resizeHandler.call(that);
                        //that.drawGridHandler();
                    });
                }

            }

            // убираем удаленные объекты
			var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        };

        vFContainer.getObj = function(curStr, rowObj, el) {
            var elObj = null;
            if (curStr != "EMPTY") {
                var srcStr = curStr.trim();
                //var tCurStr = srcStr.toUpperCase();
                var parts = srcStr.split(",");

                var stretch = parts[0];
                elObj = {
                    element: el,
                    width: 0,
                    //minColumns: minCols,
                    doNotBreak: (parts[parts.length - 1].toUpperCase().trim() == "NBR"),
                    grow: (stretch === "true" ? true : (stretch == "" ? null : false)),
                    isEmpty: false,
                    isMultyLine: false
                };
                rowObj.element.append(el);
            } else {
                var el = $(vFContainer._templates[curStr]);
                //rowObj.element.append(el);
                el.insertAfter(rowObj.children[pos].element);
                elObj = {
                    element: el,
                    width: 0,
                    doNotBreak: false,
                    grow: true,
                    isEmpty: true,
                    isMultyLine: false
                };
            }
            rowObj.children.push(elObj);
            return elObj;
        };

        vFContainer.isRootFlex = function() {
            var result = true;
            var parent = this.getParentComp();
            while (parent && result) {
                if (parent.className != "FContainer") {
                    result = true;
                    break;
                }
                else if (parent.hasGrid()) result = false;
                parent = parent.getParentComp();
            }

            return result;
        };

        vFContainer.getParentFlex = function() {
            var result = this;
            var parent = this.getParentComp();
            while (parent) {
                if (parent.className != "FContainer") {
                    break;
                }
                else if (parent.hasGrid()) {
                    result = parent;
                    break;
                }
                parent = parent.getParentComp();
            }

            return result;
        };

        vFContainer.getContainerWithGrid = function() {
            var result = null;
            if (this.hasGrid()) result = this;
            else {
                var parent = this.getParentComp();
                while (parent && !result) {
                    if (parent.className != "FContainer") break;
                    else if (parent.hasGrid()) result = parent;
                    else parent = parent.getParentComp();
                }
            }

            return result;
        }

        vFContainer.getGridParameters = function() {
            var windowWidth = $("body").width();
            //if (!this._isRoot)
            windowWidth = vFContainer.getRootRow.call(this).element.parent().width();

            // подсчитаем текущее ко-во колонок
            var curColCount = Math.floor(windowWidth/this.minColWidth());
            curColCount = (curColCount > this.columnsCount() ? this.columnsCount() : curColCount);

            if (curColCount == 0) {
                curColCount = 1;
                curColWidth = this.minColWidth();
            } else {
                var curColWidth = Math.floor(windowWidth / curColCount);
                if (curColWidth > this.maxColWidth()) {
                    curColWidth = this.maxColWidth();
                    curColCount = Math.floor(windowWidth / curColWidth);
                    //if (windowWidth % this.maxColWidth != 0)
                    //    curColCount++;
                    //curColWidth = Math.floor(windowWidth / curColCount);
                } else if (curColWidth < this.minColWidth()) {
                    curColWidth = this.minColWidth();
                    curColCount = Math.floor(windowWidth / curColWidth);
                }
            }
            return {
                windowWidth: windowWidth,
                curColCount: curColCount,
                curColWidth: curColWidth
            }
        }

        vFContainer.getRow = function(parent) {
            var row = $(vFContainer._templates["row"]);
            parent.append(row);

            var rowObj = {
                element: row,
                children: [],
                grow: false,
                container: {}
            };
            var fCont = vFContainer.getContainerWithGrid.call(this);
            fCont._rows.push(rowObj);
            return rowObj;
        };

        vFContainer.resizeHandler = function() {
            var dBegin = new Date();
            var params = vFContainer.getGridParameters.call(this);
            var windowWidth = params.windowWidth;
            var curColCount = params.curColCount;
            var curColWidth = params.curColWidth;

            console.log("windowWidth: " + windowWidth + ", curColCount: " + curColCount + ", curColWidth: " + curColWidth);

            for (var i = 0; i < this._rows.length; i++) {
                var rowObj = this._rows[i];
                var rowEl = rowObj.element;
                //if (rowObj.container) curColCount = rowObj.container.realColCount;
                var rowWidth = curColCount * curColWidth;
                rowEl.css("width", rowWidth + "px")
                //rowEl.width(rowWidth);
                var children = rowObj.children;

                rowEl.find(".control-wrapper.empty").remove();
                // общее ко-во колонок в строке, заодно удалим пустые элементы
                var rowColCount = 0;
                var j = 0;
                while (j < children.length) {
                    var childObj = children[j];
                    if (!childObj.isEmpty) {
                        rowColCount += childObj.width;
                        j++;
                    } else {
                        childObj.element.remove();
                        children.splice(j, 1);
                    }
                    childObj.isLineEnd = false;
                }

                if (children.length == 0) continue;
                var length = children.length;
                var tookColCount = 0;
                if (rowColCount <= curColCount) {
                    var j = 0;
                    while (j < length) {
                        var childObj = children[j];
                        childObj.realColCount = childObj.width;
                        childObj.isExtendedToEnd = false;
                        tookColCount += childObj.realColCount;

                        j++;
                    }
                    vFContainer.extendLineControls.call(this, rowObj, length - 1, curColCount);
                } else {
                    tookColCount = 0;
                    var j = 0;
                    var breakOnNextLine = true;
                    while (j < length) {
                        var childObj = children[j];
                        // если не помещается
                        if (tookColCount + childObj.width > curColCount) {
                            if (j > 0)
                                vFContainer.extendLineControls.call(this, rowObj, j - 1, curColCount);
                            if (childObj.width >= curColCount) {
                                childObj.realColCount = curColCount;
                                childObj.isExtendedToEnd = true;
                                childObj.isLineEnd = true;
                                tookColCount = 0;
                            } else {
                                childObj.realColCount = childObj.width;
                                childObj.isExtendedToEnd = false;
                                tookColCount = childObj.realColCount;
                            }
                        } else {
                            childObj.realColCount = childObj.width;
                            childObj.isExtendedToEnd = false;
                            tookColCount += childObj.realColCount;
                        }


                        // если это последний элемент, то расширим его
                        if (j > 0 && j + 1 == length) {
                            vFContainer.extendLineControls.call(this, rowObj, j, curColCount);
                        } else if (j + 1 != length && childObj.doNotBreak && breakOnNextLine) {
                            // проверим поместится ли след контрол, если нет, то перенесем все на след. строку
                            var nextChild = children[j+1];
                            // Если не помещается, то расширим предыдущий элемент и к обработке след. контрола не переходим.
                            // Повторяем вычисления для этого же контрола
                            if (curColCount - tookColCount < nextChild.width) {
                                if (j > 0 && !(children[j - 1].isLineEnd)) {
                                    vFContainer.extendLineControls.call(this, rowObj, j-1, curColCount);
                                }
                                tookColCount = 0;
                                breakOnNextLine = false;
                                continue;
                            }
                        }
                        j++;
                        breakOnNextLine = true;
                    }
                }

                // выставим ширину и вычислим максимальную высоту
                for (var k = 0; k < children.length; k++) {
                    var childObj = children[k];
                    childObj.element.css({height: "auto"});
                    childObj.element.css("width", (childObj.realColCount * curColWidth) + "px")
                    //childObj.element.width(childObj.realColCount * curColWidth);
                }
            }

            // пересчитаем дочерние хендлеры
            for (var  i= 0; i < this._childrenGenerators.length; i++) {
                var genObj = this._childrenGenerators[i];
                genObj.func.call(genObj.context);
                //this._childrenGenerators[i].drawGridHandler();
            }

            for (var i = this._rows.length - 1; i >= 0 ; i--) {
                var children = this._rows[i].children;
                var maxHeight = 0;
                for (var m = 0; m < children.length; m++) {
                    var childObj = children[m];
                    maxHeight = Math.max(maxHeight, childObj.element.height());
                }

                // теперь выставим у всех высоту
                for (var m = 0; m < children.length; m++) {
                    var childObj = children[m];
                    if (childObj.isLineEnd)
                        childObj.element.height(maxHeight);
                }
            }

            for (var i = 0; i < this._rows.length; i++) {
                var children = this._rows[i].children;

                var maxHeight = 0;
                for (var m = 0; m < children.length; m++) {
                    var childObj = children[m];
                    maxHeight = Math.max(maxHeight, childObj.element.height());
                }

                // теперь выставим у всех высоту
                for (var m = 0; m < children.length; m++) {
                    var childObj = children[m];
                    childObj.element.height(maxHeight);
                }
            }

            var dEnd = new Date();
            console.log("Длительность пересчета: " + (dEnd - dBegin) + " мСек.")
        };

        vFContainer.extendLineControls = function(rowObj, lastElIdx, curColCount) {
            var tookColCount = 0;
            var children = rowObj.children;
            var k = lastElIdx;
            var found = false;
            while (k >= 0) {
                var extChild = rowObj.children[k];
                if (k == lastElIdx || !(extChild.isLineEnd)) {
                    tookColCount += extChild.realColCount;
                    k--;
                }
                else if (k != lastElIdx && extChild.isLineEnd) k = -1;
                else k--;
            }

            k = lastElIdx;
            extChild = rowObj.children[k];
            while (k >= 0 && !extChild.isLineEnd && tookColCount < curColCount) {
                if (extChild.grow || (extChild.grow == null && rowObj.grow)) {
                    extChild.realColCount++;
                    extChild.isExtendedToEnd = true;
                    tookColCount++;
                    found = true;
                }
                k--;
                if ((k < 0 || children[k].isLineEnd) && found && tookColCount < curColCount)
                    k = lastElIdx;
                else if (!found && k >= 0 && children[k].isLineEnd)
                    break;
                extChild = rowObj.children[k];
            }

            // Если не найдено, то займем пустое место невидимым элементом
            if (!found && tookColCount < curColCount) {
                var emptyChild = vFContainer.getObj.call(this, "EMPTY", rowObj, null, lastElIdx);
                emptyChild.realColCount = curColCount - tookColCount;
                emptyChild.isLineEnd = true;
            }
            //if (found)
            children[lastElIdx].isLineEnd = true;
        };

        vFContainer.getRootRow = function() {
            return (this._rows.length > 0 ? this._rows[0] : null);
        };

        return vFContainer;
    }
);