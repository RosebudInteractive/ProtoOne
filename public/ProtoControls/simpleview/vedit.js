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
                item.click(function(){
                    that.setFocused();
                });
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }
            item.val(this.value());
        }
        return vEdit;
    }
);