define(
    ['/public/uccello/uses/template.js', 'text!./templates/dbTreeView.html', '/public/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vDbTreeView = {};
        vDbTreeView._templates = template.parseTemplate(tpl);
        vDbTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');


            if (item.length == 0) {
                this.elemId = 0;
                item = $(vDbTreeView._templates['dbTreeView']).attr('id', this.getLid());
                item.focus(function(){
                    if (that.getRoot().currentControl() != that) {
                        console.log("!!!!!!!!!!!!!!!!!START!!!!!!!!!!!!!!!!!!!!");
                        that.getControlMgr().userEventHandler(that, function(){
                            that.setFocused();
                        });
                        console.log("!!!!!!!!!!!!!!!!!COMMIT!!!!!!!!!!!!!!!!!!!!");
                    }
                });

                tree = item.find('.tree').jstree({
                    'core' : {
                        'data' : function (node, cb) {
                            if(node.id === "#") {
                                cb(vDbTreeView.getDatasets.apply(that, [null]));
                            }
                            else {
                                if (node.data.type == 'dataset') {
                                    vDbTreeView._setDatasetCursor.call(that, node, function() {
                                        cb(vDbTreeView.getItems.apply(that, [node.data.ds]));
                                    });
                                } else
                                    cb(vDbTreeView.getDatasets.apply(that, [node.data.ds]));
                            }
                        }
                    }
                });

                tree.on('changed.jstree', function (e, data) {
                    var val = data.selected && data.selected.length>0 ? data.selected[0] : null;
                    var node = val ? data.instance.get_node(val) : null;
                    if (data.action == 'select_node') {
                        console.log("!!!!!!!!!!!!!!!!!START!!!!!!!!!!!!!!!!!!!!");
                            that.getControlMgr().userEventHandler(that, function(){
                                if (node.data.type == 'item') {
                                    vDbTreeView._setDatasetCursor.call(that, node);
                                }
                                that.cursor(val);
                            });
                        console.log("!!!!!!!!!!!!!!!!!END!!!!!!!!!!!!!!!!!!!!");
                    }
                })/*.on("select_node.jstree", function(e, data) {
                    var d = data;
                    var val = null;
                    if (data.selected.length > 0) {
                        val = data.selected[0];
                    }
                    that.getControlMgr().userEventHandler(that, function(){
                        that.cursor(val);
                    });
                })*/;

                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(item);
            }

            if (this.cursor()) {
                var n = tree.jstree("get_node",  this.cursor());
                if(n) tree.jstree("select_node", n.id);
            }
            //tree.jstree("refresh", false);


            // выставляем фокус
            if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
                $('#ch_'+this.getLid()).focus();
        }

        vDbTreeView._setDatasetCursor = function(node, cb) {
            var item = $('#' + this.getLid()),
                that=this,
                tree = item.find('.tree');
            if (node.data.obj && node.data.obj.id() == node.data.ds.cursor()) {
                if (cb) cb();
                return;
            }
            var pars = [];
            if (node.parents.length > 0) {
                for (var i = node.parents.length - 1; i >= 0; i--) {
                    var parentNode = tree.jstree("get_node", node.parents[i]);
                    if (parentNode.data && parentNode.data.type == "item" && parentNode.data.ds.cursor() != parentNode.data.obj.id()) {
                        pars.push({
                            ds: parentNode.data.ds,
                            id: parentNode.data.obj.id()
                        });
                    }
                }
            }
            pars.push({
                ds: node.data.ds,
                id: node.data.obj ? node.data.obj.id() : null
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

        vDbTreeView.getDatasets = function(parent) {
            var items = this.getCol('Datasets'), childs = [];
            for (var i = 0, len = items.count(); i < len; i++){
                var item = items.get(i), ds = item.dataset();
                if (parent == item.parent())
                    childs.push({
                        text: ds.name(),
                        id: 't'+(++this.elemId),
                        children: true,
                        data: {type: 'dataset', ds: ds}
                    });
            }
            return childs;
        }

        vDbTreeView.getItems = function(dataset) {
            var itemsTree=[],
                names = {'DatasetContact':'firstname',
                    'DatasetContract':'number',
                    'DatasetCompany':'name',
                    'DatasetAddress':'country'};
            var col = dataset.root().getCol('DataElements'), isChildren = vDbTreeView.isChildren.apply(this, [dataset]);
            for (var i = 0, len2 = col.count(); i < len2; i++) {
                var obj = col.get(i);
                itemsTree.push({
                    text : obj[names[dataset.name()]](),
                    id : 't'+(++this.elemId),
                    children : isChildren,
                    data:{type: 'item', ds:dataset, obj:obj},
                    guid: obj.getGuid()
                });
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