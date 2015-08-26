define(
    ['/public/uccello/uses/template.js', 'text!./templates/layersContainer.html'],
    function(template, tpl) {
        var vTabContainer = {};
        vTabContainer._templates = template.parseTemplate(tpl);
        vTabContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                item = $(vTabContainer._templates['container']).attr('id', this.getLid());

                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            // создаем врапперы для чайлдов
            var childs = this.getCol('Children');
            var contentItem = item.find('.content');
            //var btnsItem = item.find('.buttons');
            var iAdded = 0;
            var tabNumber = this.tabNumber()!==undefined? this.tabNumber(): -1;
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                if ($('#ch_'+child.getLid()).length == 0) {
                    var div = $('<div class="control-wrapper '+(iAdded==tabNumber?'':'hidden')+'"></div>').attr('id', 'ch_'+child.getLid());
                    div.css({top:0, left:0, width:'100%', height:'100%'});
                    contentItem.append(div);

                    /*var btn = $('<input type="button"  class="tabSelector '+(iAdded==tabNumber?'active"':'')+'" />').val(child.name());
                    btn.on('click', function(){
                        btnsItem.find('.active').removeClass('active');
                        $(this).addClass('active');
                        contentItem.children().addClass('hidden');
                        var selTab = $(this).index();
                        that.getControlMgr().userEventHandler(that, function(){
                            that.tabNumber(selTab);
                        });
                        $(contentItem.children()[selTab]).removeClass('hidden');
                    });
                    btnsItem.append(btn);*/
                } else {
                    if (iAdded == tabNumber) {
                        /*btnsItem.find('.active').removeClass('active');
                        btnsItem.find('.tabSelector:eq('+tabNumber+')').addClass('active');*/
                        contentItem.children().addClass('hidden');
                        $(contentItem.children()[tabNumber]).removeClass('hidden');
                    }
                }
                iAdded++;
            }


            // убираем удаленные объекты
			var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();



        }

        return vTabContainer;
    }
);