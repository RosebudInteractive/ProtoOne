define(
    ['/public/uccello/uses/template.js', 'text!./templates/cContainer.html'],
    function(template, tpl) {
        var vCContainer = {};
        vCContainer._templates = template.parseTemplate(tpl);
        vCContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vCContainer._templates['ccontainer']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getRenderArea(this).attr('id'): options.rootContainer);
                $(parent).append(item);
            }

            // убираем удаленные объекты
            //var del = this.getObj().getLogCol('Children').del;
			var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }
        return vCContainer;
    }
);