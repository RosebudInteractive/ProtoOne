define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataEdit.html'],
    function(template, tpl) {
        var vDataEdit = {};
        vDataEdit._templates = template.parseTemplate(tpl);
        vDataEdit.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vDataEdit._templates['edit']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                // сохранять при потере фокуса
                item.blur(function () {
                    if (that.dataset() && that.dataField()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            //var dataset = that.getControlMgr().get(that.dataset());
                            var dataset = that.dataset();
                            dataset.setField(that.dataField(), item.val());
                        });
                    }
                });
            }

            // устанавливаем значение
            if (this.dataset() && this.dataField()) {
                //var dataset = that.getControlMgr().get(that.dataset());
                var dataset = that.dataset();
                item.attr('disabled', false);
                item.val(dataset? dataset.getField(this.dataField()): '');
            }
            item.attr('disabled', this.enabled()===false? false: true);
        }
        return vDataEdit;
    }
);