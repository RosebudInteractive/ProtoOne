define(
    ['/public/uccello/uses/template.js', 'text!./templates/toolbarButton.html'],
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
                       // console.log(that.getParent().clickButton(that));
                        that.getControlMgr().userEventHandler(that, function(){
                            if (that.buttonKind() == 'Radio' && !that.pressed())
                                that.pressed(true);
                            if (that.buttonKind() == 'Toggle')
                                that.pressed(!that.pressed());
                            that.onClick.apply(that);
                            vButton._genEventsForParent.call(that);
                        });
                    });
                }

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                // подсвечиваем выбранные слой
                if (this.buttonKind() == 'Radio' ) {
                    var lc = this.getParent().layersContainer();
                    if (lc && lc.tabNumber() == this.tabNumber())
                        item.addClass('active');
                }
            }



            item.val(this.caption());
            item.attr('disabled', this.enabled()===false? true: false);

            if (this.pressed())
                item.addClass('active');
            else
                item.removeClass('active');

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).find('input').focus();
        }

        /**
         * Оповещение парента об клике
         * @private
         */
        vButton._genEventsForParent = function() {
            $('#ch_' + this.getLid()).trigger("toolbar:clickButton", {
                control: this
            });
        }

        return vButton;
    }
);