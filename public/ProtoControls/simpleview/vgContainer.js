define(
    ['/public/uccello/uses/template.js', 'text!./templates/cContainer.html'],
    function(template, tpl) {
        var vGContainer = {};
        vGContainer._templates = template.parseTemplate(tpl);
        vGContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vGContainer._templates['container']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getRenderArea(this).attr('id'): options.rootContainer);
                $(parent).append(item);
            }

            // убираем удаленные объекты
			var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }
        return vGContainer;
    }
);