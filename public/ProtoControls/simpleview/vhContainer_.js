define(
    ['/public/uccello/uses/template.js', 'text!./templates/hContainer.html'],
    function(template, tpl) {
        var vHContainer = {};
        vHContainer._templates = template.parseTemplate(tpl);
        vHContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vHContainer._templates['container']).attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            // создаем врапперы для чайлдов
            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                if ($('#ch_'+child.getLid()).length == 0) {
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_' + child.getLid());
                    var width = child.width();
                    if ($.isNumeric(width)) width += 'px';
                    div.css({width: width});
                    item.append(div);
                }
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }

        return vHContainer;
    }
);