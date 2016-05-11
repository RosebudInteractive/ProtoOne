/**
 * Created by kiknadze on 10.05.2016.
 */

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
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);


                if (this.lookupDataset() && this.displayField()) {
                    dataset = this.lookupDataset();
                    var col = dataset.getDataCollection();
                    for (var i = 0, len = col.count(); i < len; i++) {
                        var obj = col.get(i);
                        var funcName = "";
                        if (this.displayField()) {
                            funcName = this.displayField();
                            funcName = funcName[0].toLowerCase() + funcName.slice(1);
                        }
                        var text = (typeof obj[funcName] == "function") ? obj[funcName]() : "Field not found";
                        var option = $('<option/>').attr('value', obj.getGuid()).html(text);
                        item.append(option);
                    }
                }

                // сохранять при изменении
                item.change(function () {
                    that.getControlMgr().userEventHandler(that, function () {
                        if (that.dataset() && that.dataField()) {
                            that.dataset().setField(that.dataField(), item.val());
                        }

                        if (that.lookupDataset() && that.displayField()) {
                            that.lookupDataset().cursor(item.val());
                        }
                    });
                });

                item.focus(function(){
                    if (that.getForm().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
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

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                $('#ch_'+this.getLid()).find('select').focus();
        }
        return vDataCombo;
    }
);