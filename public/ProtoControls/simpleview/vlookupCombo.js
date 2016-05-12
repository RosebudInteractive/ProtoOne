/**
 * Created by kiknadze on 10.05.2016.
 */

define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataCombo.html',
        '../../uccello/metaData/metaDefs'],
    function(template, tpl, Meta) {
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
                        if (that.lookupDataset() && that.displayField()) {
                            that.lookupDataset().cursor(item.val());
                        }

                        if (that.dataset() && that.dataField() && that.lookupDataset()) {
                            that.dataset().setField(that.dataField(), that.lookupDataset().getField(that.valueField()));
                            that._isRendered(false);
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
            if (that.dataset() && that.dataField())
                item.val(this.lookupDataset().cursor());

            if (this.enabled() === false)
                item.attr('disabled', true);
            else if (that.dataset() && dataField) {
                var ds = that.dataset();
                var dsCanEdit = !ds.canEdit || (ds && ds.canEdit());
                var dsState = ds ? ds.getState() :  Meta.State.Unknown;
                var isMaster = ds && ds.master() ? false : true;
                var dsMasterState = ds && ds.master() ? ds.master().getState() : Meta.State.Unknown;
                var enabled = dsCanEdit && dsState !=  Meta.State.Unknown && ((isMaster && dsState !== Meta.State.Browse) ||
                    (!isMaster && dsMasterState <= Meta.State.Edit)) &&
                    ds.cursor();
                item.attr('disabled', !enabled);
            } else
                item.attr('disabled', false);

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getForm().isFldModified("CurrentControl") && this.getForm().currentControl() == this)
                $('#ch_'+this.getLid()).find('select').focus();
        }
        return vDataCombo;
    }
);