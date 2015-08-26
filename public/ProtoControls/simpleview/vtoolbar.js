define(
    ['/public/uccello/uses/template.js', 'text!./templates/toolbar.html'],
    function(template, tpl) {
        var vToolbar = {};
        var that = this;
        vToolbar._templates = template.parseTemplate(tpl);
        vToolbar.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vToolbar._templates['container']).attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                item.on("toolbar:clickButton", function(event, data) {
                    vToolbar.clickButton.apply(that, [event, data]);
                });
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

        vToolbar.clickButton = function(event, data) {
            var button = data.control;
            var buttonKind = button.buttonKind();
            var buttonGuid = button.getGuid();
            var toolbar = button.getParent();
            if (buttonKind == 'Radio') {
                var childs = toolbar.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var childGuid = childs.get(i).getGuid();
                    var child = toolbar.getControlMgr().get(childGuid);
                    if (child.buttonKind() == 'Radio') {
                        if (buttonGuid == childGuid) {
                            $('#'+child.getLid()).addClass('active');
                        } else {
                            $('#'+child.getLid()).removeClass('active');
                        }
                    }
                }
            }
        }

        return vToolbar;
    }
);