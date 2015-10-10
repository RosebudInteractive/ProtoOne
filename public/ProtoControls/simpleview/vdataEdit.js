define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataEdit.html'],
    function(template, tpl) {
        var vDataEdit = {};
        vDataEdit._templates = template.parseTemplate(tpl);
        vDataEdit.render = function(options) {
            if (this.isChanged) return;
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vDataEdit._templates['edit']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);


                // установить фокус по клику
                item.focus(function(){
                    console.log('TEST focus '+that.name());
                    that.getControlMgr().userEventHandler(that, function(){
                        that.setFocused();
                    });
                });

                // сохранять при потере фокуса
                item.blur(function () {
                    if (that.dataset() && that.dataField()) {
                        console.log('TEST blur '+that.name());
                        that.getControlMgr().userEventHandler(that, function () {
                            //var dataset = that.getControlMgr().get(that.dataset());
                            var dataset = that.dataset();
                            dataset.setField(that.dataField(), item.val());
                            that.isChanged = false;
                            //that.getRoot().currentControl(null);
                        });
                    }
                });

                // при изменении значения
                item.keydown(function () {
                    that.isChanged = true;
                });

            }

            // устанавливаем значение
            if (this.dataset() && this.dataField()) {
                //var dataset = that.getControlMgr().get(that.dataset());
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