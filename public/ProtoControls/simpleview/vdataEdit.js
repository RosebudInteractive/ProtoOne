define(
    ['/public/uccello/uses/template.js', 'text!./templates/dataEdit.html',
        '../../uccello/metaData/metaDefs'],
    function(template, tpl, Meta) {
        var vDataEdit = {};
        vDataEdit._templates = template.parseTemplate(tpl);
        vDataEdit.render = function(options) {
            console.log("render " + this.name());
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
                    var dsState = !dataset ? Meta.State.Unknown : dataset.getState();
                    if (dataset && that.dataField() &&
                        dataset.getField(that.dataField()) != item.val() &&
                        (dsState == Meta.State.Edit || dsState == Meta.State.Insert)) {
                        that.getControlMgr().userEventHandler(that, function () {
                            dataset.setField(that.dataField(), item.val());
                        });
                    }
                });


                item.on("input",function(e){
                    if($(this).data("lastval")!= $(this).val()){
                        var dataset = that.dataset();
                        if (dataset && that.dataField()) {
                            var dsState = !dataset ? Meta.State.Unknown : dataset.getState();
                            var dsAutoEdit = dataset.autoEdit() === undefined ? false : dataset.autoEdit();
                            if (dsState == Meta.State.Browse && dsAutoEdit) {
                                item.attr('disabled', true);
                                var ed = $(this);
                                dataset.edit(function(data) {
                                    if (data.result == "ERROR")
                                        ed.val(ed.data("lastval"));
                                    else {
                                        ed.data("lastval",ed.val());
                                    }
                                    item.attr('disabled', false);
                                });
                            }
                        }
                    };
                });
            }

            // устанавливаем значение
            var dataset = that.dataset();
            if (dataset && this.dataField()) {
                item.val(dataset? dataset.getField(this.dataField()): '');
            }

            var dsState = !dataset ? Meta.State.Unknown : dataset.getState();
            var dsAutoEdit = dataset.autoEdit() === undefined ? false : dataset.autoEdit();
            var disabled = this.enabled()===false || !dataset || !this.dataField() ||
                dsState == Meta.State.Unknown || dsState == Meta.State.Pending ||
                (!dsAutoEdit && dsState != Meta.State.Insert && dsState != Meta.State.Edit) ||
                ( !dsAutoEdit && dsState == Meta.State.Browse);
            item.attr('disabled', disabled);

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).find('input').focus();
        }
        return vDataEdit;
    }
);