define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataCombo.html'],
    function(template, tpl) {
        var vDataCombo = {};
        vDataCombo._templates = template.parseTemplate(tpl);
        vDataCombo.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            var dataset = that.dataset();
            var dataField = that.dataField();

            if (item.length == 0) {
                item = $(vDataCombo._templates['combo']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                var values = this.values().split('|');
                for(var v = 0; v < values.length; v++) {
                    var option = $('<option/>').attr('value', values[v]).html(values[v]);
                    item.append(option);
                }
                
                // сохранять при изменении
                item.change(function () {
                    if (that.dataset() && that.dataField()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            dataset.setField(that.dataField(), item.val());
                        });
                    }
                });
            }

            // устанавливаем значение
            if (dataset && dataField) {
                item.attr('disabled', false);
                item.val(dataset? dataset.getField(this.dataField()): '');
            }
            item.attr('disabled', this.enabled()===false? true: false);
        }
        return vDataCombo;
    }
);