define(
    ['/public/uccello/uses/template.js', 'text!./templates/dbTreeView.html', '/public/uccello/system/utils.js'],
    function(template, tpl, Utils) {
        var vDbTreeView = {};
        vDbTreeView._templates = template.parseTemplate(tpl);
        vDbTreeView.render = function(options) {
            var item = $('#' + this.getLid()), that=this, tree = item.find('.tree');
            this.elemId = 0;


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
                                cb(vDbTreeView.getDatasets.apply(that, [null]));
                            }
                            else {
                                if (node.data.type == 'dataset')
                                    cb(vDbTreeView.getItems.apply(that, [node.data.ds]));
                                else
                                    cb(vDbTreeView.getDatasets.apply(that, [node.data.ds]));
                            }
                        }
                    }
                });

                tree.on('changed.jstree', function (e, data) {
                    var node = data.selected && data.selected.length>0 ? data.instance.get_node(data.selected[0]) : null;
                    if (node && node.data.type == 'item') {
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
            var itemsTree=[], names = {'DatasetContact':'firstname', 'DatasetContract':'number', 'DatasetCompany':'name', 'DatasetAddress':'country'};
            var col = dataset.root().getCol('DataElements'), isChildren = vDbTreeView.isChildren.apply(this, [dataset]);
            for (var i = 0, len2 = col.count(); i < len2; i++) {
                var obj = col.get(i);
                itemsTree.push({
                    text : obj[names[dataset.name()]](),
                    id : 't'+(++this.elemId),
                    children : isChildren,
                    data:{type: 'item', ds:dataset, obj:obj}
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