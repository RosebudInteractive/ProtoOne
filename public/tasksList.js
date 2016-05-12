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
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('FormParam1').value(newVal);
                this.clickNewTask2();
            }
        });
        return TaskListScripts;
    }
);