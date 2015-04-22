define(
    ['/public/uccello/uses/template.js', 'text!./templates/edit.html'],
    function(template, tpl) {
        var vEdit = {};
        vEdit._templates = template.parseTemplate(tpl);
        vEdit.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vEdit._templates['edit']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }
            item.val(this.value());
        }
        return vEdit;
    }
);