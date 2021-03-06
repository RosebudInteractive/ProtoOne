/**
 * Created by kiknadze on 26.04.2016.
 */

define(
    [],
    function() {
        var TaskListScripts = Class.extend({
            init: function(uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
                this.pvt.enableShowForms = true;
            },

            clickNewTask1: function () {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('SubForm').loadForm("d39036c6-5806-4886-9492-b53aa08dd63f", {
                    ProcessDefName: "Simple Task Definition"
                });
            },

            clickNewTask2: function () {
                // редактирование
                var cm = this.pvt.uccelloClt.getContextCM();
                var dataset = cm.getByName('DatasetTasks');
                if (!dataset.cursor()) return;
                cm.getByName('SubForm').loadForm("733af949-e0c7-465c-b736-ee232593c149", {
                    ProcessId: dataset.getField("TaskId"),
                    RequestId: dataset.getField("RequestId"),
                    ObjId: dataset.getField("ObjId")
                });
            },

            onMoveCursor: function(dataset, newVal) {
                if (!this.pvt.enableShowForms) return;
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('FormParam1').value(newVal);
                this.clickNewTask2();
            },

            formClosed: function(event, container) {
                console.log("Subform closed. Event args:", event);
                var self = this;
                var cm = this.pvt.uccelloClt.getContextCM();
                var ds = cm.getByName('DatasetTasks');

                function callback() {
                    self.pvt.enableShowForms = true;
                    var old_cursor = ds.cursor();
                    var new_cursor = null;
                    if (event.data && event.data.taskId) {
                        var data_col = ds.getDataCollection();
                        if (data_col) {
                            for (var i = 0; data_col.count(); i++) {
                                var task_info = data_col.get(i);
                                if (task_info.taskId() === event.data.taskId) {
                                    new_cursor = task_info.getGuid();
                                    break;
                                };
                            };
                        }
                    }
                    if (new_cursor)
                        ds.cursor(new_cursor)
                    else
                        ds.last();
                    
                    new_cursor = ds.cursor();
                    if (new_cursor === old_cursor) {
                        cm.userEventHandler(self, function () {
                            self.clickNewTask2();
                        });
                    };

                    ds.event.off({
                            type: 'refreshData',
                            subscriber: this,
                            callback: callback
                        });
                }

                ds.event.on({
                    type: 'refreshData',
                    subscriber: this,
                    callback: callback
                });

                cm.userEventHandler(self, function () {
                    self.pvt.enableShowForms = false;
                    ds.refreshData();
                });
            }
        });
        return TaskListScripts;
    }
);