define(
    ['/public/uccello/uses/template.js', 'text!./templates/form.html'],
    function(template, tpl) {
        var vForm = {};
        vForm._templates = template.parseTemplate(tpl);
        vForm.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vForm._templates['form']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getRenderArea(this).attr('id'): options.rootContainer);
                $(parent).append(item);
            }

            // убираем удаленные объекты
            //var del = this.getObj().getLogCol('Children').del;
			var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }
        return vForm;
    }
);