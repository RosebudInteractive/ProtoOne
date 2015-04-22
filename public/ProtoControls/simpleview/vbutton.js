define(
    ['/public/uccello/uses/template.js', 'text!./templates/button.html'],
    function(template, tpl) {
        var vButton = {};
        vButton._templates = template.parseTemplate(tpl);
        vButton.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vButton._templates['button']).attr('id', this.getLid());
                var parent = '#' + (this.getParent()? this.getParent().getRenderArea(this).attr('id'):options.rootContainer);
                $(parent).append(item);
            }
            item.val(this.caption());
        }
        return vButton;
    }
);