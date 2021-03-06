define(
    ['/public/uccello/uses/template.js', 'text!./templates/tabContainer.html'],
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
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            // создаем врапперы для чайлдов
            var childs = this.getCol('Children');
            var contentItem = item.find('.content');
            var btnsItem = item.find('.buttons');
            var iAdded = 0;
            var activeTab = this.activeTab()? this.activeTab(): 0;
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                if ($('#ch_'+child.getLid()).length == 0) {
                    var div = $('<div class="control-wrapper '+(iAdded==activeTab?'':'hidden')+'"></div>').attr('id', 'ch_'+child.getLid());
                    div.css({top:0, left:0, width:'100%', height:'100%'});
                    contentItem.append(div);

                    var btn = $('<input type="button"  class="tabSelector '+(iAdded==activeTab?'active"':'')+'" />').val(child.name());
                    btn.on('click', function(){
                        btnsItem.find('.active').removeClass('active');
                        $(this).addClass('active');
                        contentItem.children().addClass('hidden');
                        var selTab = $(this).index();
                        that.getControlMgr().userEventHandler(that, function(){
                            that.activeTab(selTab);
                        });
                        $(contentItem.children()[selTab]).removeClass('hidden');
                    });
                    btnsItem.append(btn);
                } else {
                    if (iAdded == activeTab) {
                        btnsItem.find('.active').removeClass('active');
                        btnsItem.find('.tabSelector:eq('+activeTab+')').addClass('active');
                        contentItem.children().addClass('hidden');
                        $(contentItem.children()[activeTab]).removeClass('hidden');
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