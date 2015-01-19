define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataEdit.html'],
    function(template, tpl) {
        var vDataEdit = {};
        vDataEdit._templates = template.parseTemplate(tpl);
        vDataEdit.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vDataEdit._templates['edit']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(item);
            }
            item.css({top: this.top() + 'px', left: this.left() + 'px'});

            // получаем значение
            if (this.dataset()) {
                var cm = this.getControlMgr();
                var dataset = cm.getByGuid(this.dataset());
                if (dataset) {
                    var rootElem = dataset.root()? cm.getDB().getObj(dataset.root()): null;
                    if (rootElem) {
                        var col = rootElem.getCol('DataElements');
                        var datafield = col.get(this.dataField());
                        var cursor = dataset.cursor();
                        // TODO добавить вывод значения 
                    }
                }
            }
        }
        return vDataEdit;
    }
);