define(
    [],
    function() {
        var vEdit = {};
        vEdit.render = function() {
            var that = this;
            require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/edit.html'], function(template, tpl){
                if (!that._templates)
                    that._templates = template.parseTemplate(tpl);

                var item = $('#' + that.getLid());
                if (item.length == 0) {
                    item = $(that._templates['edit']).attr('id', that.getLid());
                    var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                    $(parent).append(item);
                }
                item.css({top: that.top() + 'px', left: that.left() + 'px'}).val(that.value());
            });
        }
        return vEdit;
    }
);