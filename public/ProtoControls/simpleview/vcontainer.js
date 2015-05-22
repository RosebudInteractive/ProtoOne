define(
    ['/public/uccello/uses/template.js', 'text!./templates/container.html'],
    function(template, tpl) {
        var vContainer = {};
        vContainer._templates = template.parseTemplate(tpl);
        vContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                item = $(vContainer._templates['container']).attr('id', this.getLid());
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            // убираем удаленные объекты
            //var del = this.getObj().getLogCol('Children').del;
			var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }
        return vContainer;
    }
);