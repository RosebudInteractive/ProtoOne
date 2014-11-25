define(
    [],
    function() {
        var vContainer = {}
        vContainer.render = function() {
            var that = this;
            require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/container.html'], function(template, tpl){
                if (!that._templates)
                    that._templates = template.parseTemplate(tpl);
                var item = $('#' + that.getLid());
                var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                if (item.length == 0) {
                    item = $(that._templates['container']).attr('id', that.getLid());
                    $(parent).append(item);
                }
                item.css({top: that.top() + 'px', left: that.left() + 'px', width: that.width() + 'px', height: that.height() + 'px'});

                // убираем удаленные объекты
                var del = that.getObj().getLogCol('Children').del;
                for (var guid in del)
                    $('#' + del[guid].getLid()).remove();
            });
        }
        return vContainer;
    }
);