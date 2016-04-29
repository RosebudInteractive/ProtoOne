/**
 * Created by kiknadze on 27.04.2016.
 */


define(
    ['/public/uccello/uses/template.js', 'text!./templates/formContainer.html'],
    function(template, tpl) {
        var vFormContainer = {};
        vFormContainer._templates = template.parseTemplate(tpl);
        vFormContainer.render = function(options) {
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vFormContainer._templates['container']).attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            if (this.resource()) {
                var child = this.resource().getForm();
                var divId = 'ch_' + child.getLid();
                var div = $("#" + divId);
                if (div.length == 0) {
                    item.empty();
                    var div = $('<div class="control-wrapper"></div>').attr('id', divId);
                    div.css("height", "100%");
                    item.append(div);
                }
            } else {
                item.empty();
            }

            // создаем врапперы для чайлдов
            /*var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                if ($('#ch_'+child.getLid()).length == 0) {
                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_' + child.getLid());
                    var height = child.height();
                    div.css({
                        flex: height + ' 0 auto',
                        '-webkit-flex': height + ' 0 auto',
                        '-ms-flex': height + ' 0 auto'
                    });
                    item.append(div);
                }
            }


            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();
*/


        }

        vFormContainer.getFormDivId = function() {
            var divId = null;
            if (this.resource()) {
                var child = this.resource().getForm();
                divId = '#ch_' + child.getLid();
            }

            return divId;
        }

        return vFormContainer;
    }
);