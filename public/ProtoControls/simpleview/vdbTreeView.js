define(
    ['/public/uccello/uses/template.js', 'text!./templates/dbTreeView.html', '/public/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vDbTreeView = {};
        vDbTreeView._templates = template.parseTemplate(tpl);
        vDbTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');
            if (item.length == 0) {
                item = $(vDbTreeView._templates['dbTreeView']).attr('id', this.getLid());
                item.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                    }
                });

                tree = item.find('.tree').jstree({
                    'core' : {
                        'data' : function (node, cb) {
                            if(node.id === "#") {
                                cb(vDbTreeView.getItems.apply(that, [null]));
                            }
                            else {
                                cb(vDbTreeView.getItems.apply(that, [node.data]));
                            }
                        }
                    }
                });

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }
            tree.jstree("refresh");

            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }

        vDbTreeView.getItems = function(parent) {
            var items = this.getCol('Datasets'), itemsTree=[];
            for (var i = 0, len = items.count(); i < len; i++) {
                var item = items.get(i);
                if (parent == item.parent())
                    itemsTree.push({"text" : item.name(), "id" : item.id(), "children" : vDbTreeView.getItems.apply(this, [item.dataset()]).length!=0, data:item.dataset()});
            }
            return itemsTree;
        }

        return vDbTreeView;
    }
);