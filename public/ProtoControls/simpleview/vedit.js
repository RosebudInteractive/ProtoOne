define(
    ['/public/uccello/uses/template.js', 'text!./templates/edit.html'],
    function(template, tpl) {
        var vEdit = {};
        vEdit._templates = template.parseTemplate(tpl);
        vEdit.render = function(options) {
            console.log('render '+this.name());
            var item = $('#' + this.getLid()), that=this;
            if (item.length == 0) {
                item = $(vEdit._templates['edit']).attr('id', this.getLid());
                item.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                    }
                });
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }
            item.val(this.value());

            // выставляем фокус
            if (this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).find('input').focus();
        }
        return vEdit;
    }
);