define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataCheckbox.html'],
    function(template, tpl) {
        var vDataEdit = {};
        vDataEdit._templates = template.parseTemplate(tpl);
        vDataEdit.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vDataEdit._templates['checkbox']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                // сохранять при потере фокуса
                item.click(function () {
                    var checkbox = $(this);
                    if (that.dataset() && that.dataField()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var dataset = that.dataset();
                            dataset.setField(that.dataField(), checkbox.prop('checked')?that.checkValue():that.uncheckValue());
                        });
                    }
                });
            }

            // устанавливаем значение
            if (this.dataset() && this.dataField()) {
                var dataset = that.dataset();
                item.val(dataset? dataset.getField(this.dataField()): '');
                item.attr('checked', that.checkValue()==item.val());
            }
            item.attr('disabled', this.enabled()===false? true: false);
        }
        return vDataEdit;
    }
);