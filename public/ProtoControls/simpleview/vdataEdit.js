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

                // установить фокус
                item.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                    }
                });

                // сохранять при потере фокуса
                item.blur(function () {
                    var dataset = that.dataset();
                    if (dataset && that.dataField() && dataset.getField(that.dataField()) != item.val()) {
                        that.getControlMgr().userEventHandler(that, function () {
                            dataset.setField(that.dataField(), item.val());
                        });
                    }
                });
            }

            // устанавливаем значение
            if (this.dataset() && this.dataField()) {
                var dataset = that.dataset();
                item.attr('disabled', false);
                item.val(dataset? dataset.getField(this.dataField()): '');
            }
            item.attr('disabled', this.enabled()===false? true: false);

            // выставляем фокус
            if (this.getRoot().isFldModified("CurrentControl") && (this.getRoot().currentControl() == this))
                $('#ch_'+this.getLid()).find('input').focus();
        }
        return vDataEdit;
    }
);