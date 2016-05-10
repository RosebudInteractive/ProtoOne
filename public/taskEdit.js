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
                this._process_params_ds = null;
                this._object_ds = null;
            },

            paramModify: function (parameter) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.userEventHandler(this, function () {
                    console.log("Param modify handler", parameter);
                });

            },

            onDataInit: function(model) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.userEventHandler(this, function () {
                    console.log("OnDataInit", model);
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
                    var new_object = null;
                    this._object_ds = object_ds;
                    this._process_params_ds = process_params_ds;
                    
                    if (object_ds && process_params_ds) {
                        object_ds.cachedUpdates(true);
                        object_ds.edit(function (result) {
                            if (result.result === "OK") {
                                object_ds.addObject({}, function (result) {
                                    if (result.result === "OK") {
                                        new_object = object_ds.getCurrentDataObject();
                                        process_params_ds.edit(function (result) {
                                            if (result.result === "OK") {
                                                var param_object = process_params_ds.getCurrentDataObject();
                                                param_object.objId(new_object.id());
                                            }
                                            else
                                                alert("ERROR: " + result.message);
                                        });
                                    }
                                    else
                                        alert("ERROR: " + result.message);
                                });
                            }
                            else
                                alert("ERROR: " + result.message);
                        });
                    };
                });
            },

            clickCancel: function(button) {
                console.log ("Cancel clicked");
            },

            clickCreate: function(button) {
                console.log ("Create clicked");
                var process_params_ds = this._process_params_ds;
                var object_ds = this._object_ds;
                if (object_ds && process_params_ds) {
                    object_ds.save({}, function (result) {
                        if (result.result === "OK") {
                            process_params_ds.save({}, function (result) {
                                if (result.result === "OK") {
                                }
                                else
                                    alert("ERROR: " + result.message);
                            });
                        }
                        else
                            alert("ERROR: " + result.message);
                    });
                };
            }


        });
        return TaskEditScripts;
    }
);