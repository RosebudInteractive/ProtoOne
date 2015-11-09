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
                                cb(vDbTreeView.getItemsRoot.apply(that, [null]));
                            }
                            else {
                                cb(vDbTreeView.getItems.apply(that, [node.data]));
                            }
                        }
                    }
                });

                tree.on('changed.jstree', function (e, data) {
                    var node = data.selected && data.selected.length>0 ? data.instance.get_node(data.selected[0]) : null;
                    if (node) {
                        that.getControlMgr().userEventHandler(that, function(){
                            node.data.ds.cursor(node.data.obj.id());
                        });
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

        vDbTreeView.getItemsRoot = function(parent) {
            var items = this.getCol('Datasets'), itemsTree=[];
            for (var i = 0, len = items.count(); i < len; i++) {
                var item = items.get(i), ds = item.dataset(), col = ds.root().getCol('DataElements'),
                    isChildren = vDbTreeView.isChildren.apply(this, [ds]);
                if (item.parent() == null) {
                    for (var j = 0, len2 = col.count(); j < len2; j++) {
                        var obj = col.get(j);
                        itemsTree.push({
                            text : obj.name(),
                            id :  obj.getGuid(),
                            children : isChildren,
                            data:{ds:ds, obj:obj}
                        });
                    }
               }
            }
            return itemsTree;
        }

        vDbTreeView.getItems = function(parent) {
            var childs = vDbTreeView.getChildren.apply(this, [parent.ds]), itemsTree=[],
                names = {'DatasetContact':'firstname', 'DatasetContract':'number', 'DatasetCompany':'name', 'DatasetAddress':'country'};
            for (var i = 0, len = childs.length; i < len; i++) {
                var item = childs[i], ds = item.dataset(), col = ds.root().getCol('DataElements'),
                    isChildren = vDbTreeView.isChildren.apply(this, [ds]);
                for (var j = 0, len2 = col.count(); j < len2; j++) {
                    var obj = col.get(j);
                    itemsTree.push({
                        text : obj[names[ds.name()]](),
                        id :  obj.getGuid(),
                        children : isChildren,
                        data:{ds:ds, obj:obj}
                    });
                }
            }
            return itemsTree;
        }

        vDbTreeView.isChildren = function(ds) {
            var items = this.getCol('Datasets');
            for (var i = 0, len = items.count(); i < len; i++)
                if (ds == items.get(i).parent())
                    return true;
            return false;
        }

        vDbTreeView.getChildren = function(ds) {
            var items = this.getCol('Datasets'), childs = [];
            for (var i = 0, len = items.count(); i < len; i++){
                var item = items.get(i);
                if (ds == item.parent())
                    childs.push(item);
            }
            return childs;
        }

        return vDbTreeView;
    }
);