define(
    ['/public/uccello/uses/template.js', 'text!./templates/cContainer.html'],
    function(template, tpl) {
        var vCContainer = {};
        vCContainer._templates = template.parseTemplate(tpl);
        vCContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // создаем враппер для контейнера
                var itemWr = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+this.getLid());
                item = $(vCContainer._templates['container']).attr('id', this.getLid());
                itemWr.append(item);
                var left=this.left(), top=this.top(), width=this.width(), height=this.height();
                if ($.isNumeric(left)) left += 'px';
                if ($.isNumeric(top)) top += 'px';
                if ($.isNumeric(width)) width += 'px';
                if ($.isNumeric(height)) height += 'px';
                itemWr.css({top:top, left:left, width:width, height:height});

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var left=child.left(), top=child.top(), width=child.width(), height=child.height();
                    if ($.isNumeric(left)) left += 'px';
                    if ($.isNumeric(top)) top += 'px';
                    if ($.isNumeric(width)) width += 'px';
                    if ($.isNumeric(height)) height += 'px';
                    div.css({top:top, left:left, width:width, height:height});
                    item.append(div);
                }

                // добавляем в парент
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(itemWr);
            }

            // убираем удаленные объекты
			var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#' + del[guid].getLid()).remove();

        }

        return vCContainer;
    }
);