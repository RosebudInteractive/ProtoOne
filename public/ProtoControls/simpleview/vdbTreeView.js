define(
    ['/public/uccello/uses/template.js', 'text!./templates/dbTreeView.html', '/public/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vDbTreeView = {};
        vDbTreeView._templates = template.parseTemplate(tpl);
        vDbTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');


            if (item.length == 0) {
                this.elemId = 0;
                this.itemsIndex = {};
                item = $(vDbTreeView._templates['dbTreeView']).attr('id', this.getLid());
                item.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                    }
                });

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);

                tree = item.find('.tree').jstree({
                    'core' : {
                        'data' : function (node, cb) {
                            if(node.id === "#") {
                                that.getControlMgr().userEventHandler(that, function(){
                                    cb(vDbTreeView.getDatasets.apply(that, [node]));
                                });
                            } else {
                                that.getControlMgr().userEventHandler(that, function(){
                                    if (node.data.type == 'dataset') {
                                        if (vDbTreeView._isNodeDataLoaded.call(that, node))
                                            cb(vDbTreeView.getItems.apply(that, [node]));
                                        else
                                            vDbTreeView._setDatasetCursor.call(that, node, function() {
                                                cb(vDbTreeView.getItems.apply(that, [node]));
                                            });
                                    } else
                                        cb(vDbTreeView.getDatasets.apply(that, [node]));
                                });
                            }
                        }
                    }
                });

                tree.on('changed.jstree', function (e, data) {
                    var val = data.selected && data.selected.length>0 ? data.selected[0] : null;
                    var node = val ? data.instance.get_node(val) : null;
                    if (data.action == 'select_node') {
                            that.getControlMgr().userEventHandler(that, function(){
                                if (node.data.type == 'item') {
                                    vDbTreeView._setDatasetCursor.call(that, node);
                                }
                                that.cursor(val);
                            });
                    }
                }).on("before_open.jstree", function(e, data) {
                    var node = data.node;
                    if (!(node.data.treeItem.isOpen()))
                        that.getControlMgr().userEventHandler(that, function(){
                            node.data.treeItem.isOpen(true);
                        });
                }).on("close_node.jstree ", function(e, data) {
                    var node = data.node;
                    if (node.data.treeItem.isOpen())
                        that.getControlMgr().userEventHandler(that, function(){
                            node.data.treeItem.isOpen(false);
                        });
                });

            }

            var itemsCol = this.getCol("Items");
            for (var i = 0, len = itemsCol.count(); i < len; i++) {
                var item = itemsCol.get(i);
                if (item.isOpen()) {
                    if (!tree.jstree("is_open", item.getGuid()))
                        tree.jstree("open_node", item.getGuid());
                } else {
                    if (tree.jstree("is_open", item.getGuid()))
                        tree.jstree("close_node", item.getGuid());
                }
            }

            if (this.cursor()) {
                var n = tree.jstree("get_node",  this.cursor());
                var selectedNodes = tree.jstree("get_selected", false);
                if (n.id != selectedNodes[0])
                    tree.jstree("deselect_all", false);
                if(n) tree.jstree("select_node", n.id);
            }
            //tree.jstree("refresh", false);


            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }

        vDbTreeView._isNodeDataLoaded = function(node) {
            var parentItem = node.data.treeItem;
            var items = this.getCol("Items");
            for (var i = 0; i < items.count(); i++) {
                var item = items.get(i);
                if (item.parent() == parentItem)
                    return true;
            }

            return false;
        }

        vDbTreeView._setDatasetCursor = function(node, cb) {
            var item = $('#' + this.getLid()),
                that=this,
                tree = item.find('.tree');
            if (node.data.objId && node.data.objId == node.data.ds.cursor()) {
                if (cb) cb();
                return;
            }
            var pars = [];
            if (node.parents.length > 0) {
                for (var i = node.parents.length - 1; i >= 0; i--) {
                    var parentNode = tree.jstree("get_node", node.parents[i]);
                    if (parentNode.data && parentNode.data.type == "item" && parentNode.data.ds.cursor() != parentNode.data.objId) {
                        pars.push({
                            ds: parentNode.data.ds,
                            id: parentNode.data.objId
                        });
                    }
                }
            }
            pars.push({
                ds: node.data.ds,
                id: node.data.objId ? node.data.objId : null
            });

            function bind(func, context, data) {
                return function () {
                    return func.call(context, data);
                };
            }

            if (pars.length > 1) {
                for (var i = 1; i < pars.length; i++) {
                    var p = pars[i];
                    var callback = bind(function(data){
                        var dt = data;
                        if (dt.id)
                            dt.ds.cursor(dt.id);
                        else
                            dt.ds.first();
                        dt.ds.event.off(dt.handler);
                        if (node.data.ds == dt.ds && cb) cb();
                    }, this, p);

                    var handler = {
                        type: 'moveCursor',
                        subscriber: this,
                        callback: callback
                    };
                    p.handler = handler;
                    p.ds.event.on(handler);
                }
            }

            //node.data.ds.cursor(node.data.obj.id());
            if (pars[0].id)
                pars[0].ds.cursor(pars[0].id);
            else
                pars[0].ds.first();
            if (pars[0].ds == node.data.ds && cb) cb();
        }

        vDbTreeView.getDatasets = function(node) {
            var parent = (!(node.data) ? null : node.data.ds);
            var parentItem = ((node.data && node.data.treeItem) ? node.data.treeItem : null);
            var items = this.getCol('Datasets'), childs = [];
            var itemsCol = this.getCol("Items");
            for (var i = 0, len = items.count(); i < len; i++){
                var item = items.get(i), ds = item.dataset();
                if (parent == item.parent()) {
                    var idx = undefined;
                    var newTreeViewItem;
                    for (var j = 0; j < itemsCol.count(); j++) {
                        var curItem = itemsCol.get(j);
                        if (parentItem == curItem.parent() && curItem.dataset() == ds) {
                            newTreeViewItem = itemsCol.get(j);
                            idx = itemsCol.indexOf(newTreeViewItem);
                            break;
                        }
                    }
                    if (idx === undefined) {
                        newTreeViewItem = vDbTreeView.addItem.call(this, node.id);
                        newTreeViewItem.name(ds.name());
                        newTreeViewItem.parent(parentItem);
                        newTreeViewItem.dataset(ds);
                    } else
                        newTreeViewItem = itemsCol.get(idx);
                    var newNode = {
                        text: ds.name(),
                        id: newTreeViewItem.getGuid(),
                        children: true,
                        data: {type: 'dataset', ds: ds, treeItem: newTreeViewItem, parentNodeId: node.id}
                    };
                    childs.push(newNode);
                }
            }
            return childs;
        }

        vDbTreeView.getItems = function(node) {
            var that = this;
            var dataset = node.data.ds;
            var parentItem = ((node.data && node.data.treeItem) ? node.data.treeItem : null);
            var itemsTree=[],
                names = {'DatasetContact':'firstname',
                    'DatasetContract':'number',
                    'DatasetCompany':'name',
                    'DatasetAddress':'country'};
            var col = dataset.root().getCol('DataElements'),
                isChildren = vDbTreeView.isChildren.apply(this, [dataset]);
            var itemsCol = this.getCol("Items");
            if (vDbTreeView._isNodeDataLoaded.call(that, node)) {
                for (var i = 0, len2 = itemsCol.count(); i < len2; i++) {
                    var newTreeViewItem = itemsCol.get(i);
                    if (newTreeViewItem.parent() == parentItem) {
                        var newNode = {
                            text : newTreeViewItem.name(),
                            id : newTreeViewItem.getGuid(),
                            children : isChildren,
                            data:{type: 'item', ds:dataset, objId: newTreeViewItem.objectId(), treeItem: newTreeViewItem, parentNodeId: node.id},
                            guid: newTreeViewItem.objectGuid()
                        };
                        itemsTree.push(newNode);
                    }
                }
            } else {
                for (var i = 0, len2 = col.count(); i < len2; i++) {
                    var obj = col.get(i);
                    var idx = itemsCol.indexOfGuid(obj.getGuid());
                    var newTreeViewItem;
                    if (idx === undefined) {
                        newTreeViewItem = vDbTreeView.addItem.call(this, node.id);
                        newTreeViewItem.name(obj[names[dataset.name()]]());
                        newTreeViewItem.parent(parentItem);
                        newTreeViewItem.objectId(obj.id())
                        newTreeViewItem.objectGuid(obj.getGuid())
                    } else
                        newTreeViewItem = itemsCol.get(idx);
                    var newNode = {
                        text : obj[names[dataset.name()]](),
                        id : newTreeViewItem.getGuid(),
                        children : isChildren,
                        data:{type: 'item', ds:dataset, objId:obj.id(), treeItem: newTreeViewItem, parentNodeId: node.id},
                        guid: obj.getGuid()
                    };
                    itemsTree.push(newNode);
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

        vDbTreeView.addItem = function(parentId) {

            var parent = null;
            if (parentId !== '#') {
                var items = this.getCol('Items'), itemsTree=[];
                for (var i = 0, len = items.count(); i < len; i++) {
                    var item = items.get(i);
                    if (item.id() == parentId)
                        parent = item;
                }
            }

            // добавляем в коллекцию
            var cm = this.getControlMgr(), vc = cm.getContext();
            var newItem = new (vc.getConstructorHolder().getComponent(UCCELLO_CONFIG.classGuids.TreeViewItem).constr)(cm, {parent: this, colName: "Items", ini:{fields:{Parent:parent, Kind:"item"}} });

            return newItem;
        }

        return vDbTreeView;
    }
);