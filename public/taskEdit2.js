/**
 * Created by kiknadze on 26.04.2016.
 */

define(
    [],
    function() {
        var TaskEditScripts = Class.extend({
            init: function(uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
                this._process_data_ds = null;
                this._request_data_ds = null;
                this._object_ds = null;
            },

            paramModify: function (parameter) {
                
                function set_parameter(obj_tree) {
                    var param_name = parameter.name();
                    var param = obj_tree.getParameter(param_name);
                    if (param)
                        obj_tree.setParameter(param_name, parameter.value());
                };
                
                var cm = this.pvt.uccelloClt.getContextCM();
                console.log("Param modify handler", parameter);
                var form = parameter.getForm();
                if (form) {
                    var model = this._findDataModel(form);
                    if (model) {
                        this._getDataSets(model);
                        var process_data_ds = this._process_data_ds;
                        var process_tree = process_data_ds ? process_data_ds.objectTree() : null;
                        if (process_tree)
                            set_parameter(process_tree);

                        var request_data_ds = this._request_data_ds;
                        var request_tree = request_data_ds ? request_data_ds.objectTree() : null;
                        if (request_tree)
                            set_parameter(request_tree);
                        
                        var object_ds = this._object_ds;
                        var obj_tree = object_ds ? object_ds.objectTree() : null;
                        if (obj_tree)
                            set_parameter(obj_tree);
                    }
                };
            },

            onDataInit: function(model) {
                var cm = this.pvt.uccelloClt.getContextCM();
            },

            clickCancel: function(button) {
                console.log ("Cancel clicked");
            },

            clickEdit: function(button) {
                console.log ("Edit clicked");
            },

            _findDataModel: function (container) {
                var result = null;
                var children_cols = container.getCol("Children");
                for (var i = 0; i < children_cols.count(); i++) {
                    var curr_el = children_cols.get(i);
                    if (curr_el.isInstanceOf(UCCELLO_CONFIG.classGuids.ADataModel))
                        result = curr_el
                    else
                        if (curr_el.isInstanceOf(UCCELLO_CONFIG.classGuids.Container))
                            result = this._findDataModel(curr_el);
                    if (result)
                        break;
                };
                return result;
            },
            
            _getDataSets: function (model) {
                if ((!this._object_ds) || (!this._process_params_ds)) {
                    var process_data_ds = null;
                    var request_data_ds = null;
                    var object_ds = null;
                    var ds_col = model.getCol("Datasets");
                    for (var i = 0; i < ds_col.count(); i++) {
                        var ds = ds_col.get(i);
                        if (ds.objectTree() && ds.objectTree().isInstanceOf(UCCELLO_CONFIG.classGuids.DbTreeModelRoot, true))
                            object_ds = ds;
                        if (ds.objectTree() && ds.objectTree().isInstanceOf(UCCELLO_CONFIG.classGuids.ProcDataTreeRoot, true))
                            process_data_ds = ds;
                        if (ds.objectTree() && ds.objectTree().isInstanceOf(UCCELLO_CONFIG.classGuids.RequestTreeRoot, true))
                            request_data_ds = ds;
                    };
                    this._object_ds = object_ds;
                    this._process_data_ds = process_data_ds;
                    this._request_data_ds = request_data_ds;
                };
            }

        });
        return TaskEditScripts;
    }
);