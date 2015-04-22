define(
    ['/public/uccello/uses/template.js', 'text!./templates/label.html'],
    function(template, tpl) {
        var vLabel = {};
        vLabel._templates = template.parseTemplate(tpl);
        vLabel.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vLabel._templates['label']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getRenderArea(this).attr('id'): options.rootContainer);
                $(parent).append(item);
            }
            item.html(this.label());
        }
        return vLabel;
    }
);