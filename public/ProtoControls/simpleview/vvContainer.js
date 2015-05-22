define(
    ['/public/uccello/uses/template.js', 'text!./templates/vContainer.html'],
    function(template, tpl) {
        var vVContainer = {};
        vVContainer._templates = template.parseTemplate(tpl);
        vVContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vVContainer._templates['container']).attr('id', this.getLid());

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var height=child.height();
                    div.css({flex: height+' 0 auto',  '-webkit-flex': height+' 0 auto', '-ms-flex': height+' 0 auto'});
                    item.append(div);
                }


                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }

        return vVContainer;
    }
);