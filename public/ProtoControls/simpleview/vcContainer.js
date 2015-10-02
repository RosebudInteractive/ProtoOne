define(
    ['/public/uccello/uses/template.js', 'text!./templates/cContainer.html'],
    function(template, tpl) {
        var vCContainer = {};
        vCContainer._templates = template.parseTemplate(tpl);
        vCContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vCContainer._templates['container']).attr('id', this.getLid());

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
                    var div = $('<div class="control-wrapper" tabindex="1"></div>').attr('id', 'ch_'+child.getLid());
                    var left=child.left(), top=child.top(), width=child.width(), height=child.height();
                    if ($.isNumeric(left)) left += 'px';
                    if ($.isNumeric(top)) top += 'px';
                    if ($.isNumeric(width)) width += 'px';
                    if ($.isNumeric(height)) height += 'px';
                    div.css({top:top, left:left, width:width, height:height});
                    (function(child){div.click(function(){
                        setFocus(child);
                    });})(child);
                    item.append(div);
                }
            }



            // убираем удаленные объекты
			var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        }



        return vCContainer;
    }
);