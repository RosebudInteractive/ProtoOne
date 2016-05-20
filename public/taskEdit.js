/**
 * Created by kiknadze on 26.04.2016.
 */

define(
    [],
    function() {
        var TaskEditScripts = Class.extend({
            init: function (uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
                this._process_params_ds = null;
                this._object_ds = null;
            },
            
            paramModify: function (parameter) {
                var cm = this.pvt.uccelloClt.getContextCM();
                console.log("Param modify handler", parameter);
                var form = parameter.getForm();
                if (form) {
                    var model = this._findDataModel(form);
                    if (model) {
                        this._getDataSets(model);
                        var process_params_ds = this._process_params_ds;
                        var params_tree = process_params_ds ? process_params_ds.objectTree() : null;
                        if (params_tree) {
                            var param_name = parameter.name();
                            var param = params_tree.getParameter(param_name);
                            if (param)
                                params_tree.setParameter(param_name, parameter.value());
                        }

                        var object_ds = this._object_ds;
                        var object_tree = object_ds ? object_ds.objectTree() : null;
                        if (object_tree) {
                            param = object_tree.getParameter("ObjId");
                            if (param)
                                object_tree.setParameter("ObjId", -1);
                        }
                    };
                };
            },
            
            onDataInit: function (model) {
                var cm = this.pvt.uccelloClt.getContextCM();
                var self = this;
                console.log("OnDataInit", model);
                
                this._getDataSets(model);
                var process_params_ds = this._process_params_ds;
                var object_ds = this._object_ds;
                var new_object = null;
                
                if (object_ds && process_params_ds) {
                    object_ds.cachedUpdates(true);
                    object_ds.edit(function (result) {
                        if (result.result === "OK") {
                            cm.userEventHandler(self, function () {
                                console.log("START 1st userEventHandler");
                                object_ds.addObject({}, function (result) {
                                    if (result.result === "OK") {
                                        //cm.userEventHandler(self, function () {
                                        //    console.log("START 2nd userEventHandler");
                                            new_object = object_ds.getCurrentDataObject();
                                            process_params_ds.edit(function (result) {
                                                if (result.result === "OK") {
                                                    cm.userEventHandler(self, function () {
                                                        console.log("START 3rd userEventHandler");
                                                        var param_object = process_params_ds.getCurrentDataObject();
                                                        param_object.objId(new_object.id());
                                                        console.log("END 3rd userEventHandler");
                                                    });
                                                }
                                                else
                                                    alert("ERROR: " + result.message);
                                            });
                                         //   console.log("END 2nd userEventHandler");
                                        //});
                                    }
                                    else
                                        alert("ERROR: " + result.message);
                                });
                                console.log("END 1st userEventHandler");
                            });
                        }
                        else
                            alert("ERROR: " + result.message);
                    });
                };
            },

            clickCancel: function (button) {
                console.log ("Cancel clicked");
            },

            clickCreate: function(button) {
                var cm = this.pvt.uccelloClt.getContextCM();
                var self = this;
                
                console.log("Create clicked");
                var process_params_ds = this._process_params_ds;
                var object_ds = this._object_ds;
                if (object_ds && process_params_ds) {
                    object_ds.save({}, function (result) {
                        if (result.result === "OK") {
                            cm.userEventHandler(self, function () {
                                console.log("START 1st userEventHandler");
                                process_params_ds.save({}, function (result) {
                                    if (result.result === "OK") {
                                        console.log("State: " + process_params_ds.getState());
                                        setTimeout(function () {
                                            self._closeForm(button);
                                        }, 5000);
                                    }
                                    else
                                        alert("ERROR: " + result.message);
                                });
                                console.log("END 1st userEventHandler");
                            });
                        }
                        else
                            alert("ERROR: " + result.message);
                    });
                };
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
                    var process_params_ds = null;
                    var object_ds = null;
                    var ds_col = model.getCol("Datasets");
                    for (var i = 0; i < ds_col.count(); i++) {
                        var ds = ds_col.get(i);
                        if (ds.objectTree() && ds.objectTree().isInstanceOf(UCCELLO_CONFIG.classGuids.DbTreeModelRoot, true))
                            object_ds = ds;
                        if (ds.objectTree() && ds.objectTree().isInstanceOf(UCCELLO_CONFIG.classGuids.ProcParamTreeRoot, true))
                            process_params_ds = ds;
                    };
                    this._object_ds = object_ds;
                    this._process_params_ds = process_params_ds;
                };
            },

            _closeForm: function(button) {
                var form = button.getForm();
                form.close({
                    param1: "value1",
                    param2: "value2"
                });
            }
        });
        return TaskEditScripts;
    }
);