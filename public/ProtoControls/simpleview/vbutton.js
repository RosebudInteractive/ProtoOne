define(
    ['/public/uccello/uses/template.js', 'text!./templates/button.html'],
    function(template, tpl) {
        var vButton = {};
        vButton._templates = template.parseTemplate(tpl);
        vButton.render = function(options) {
            var item = $('#' + this.getLid());
            var that = this;

            if (item.length == 0) {
                item = $(vButton._templates['button']).attr('id', this.getLid());
                
                if ("onClick" in this) {
                    item.click(function(e){
                        that.getControlMgr().userEventHandler(that, function(){
                            if (that.buttonKind() == 'Radio' && !that.pressed())
                                that.pressed(true);
                            if (that.buttonKind() == 'Toggle')
                                that.pressed(!that.pressed());
                            that.onClick.apply(that);
                        });
                    });
                }

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }



            item.val(this.caption());
            item.attr('disabled', this.enabled()===false? true: false);

            // выставляем фокус
            if (this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }
        return vButton;
    }
);