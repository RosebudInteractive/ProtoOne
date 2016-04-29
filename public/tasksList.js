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
                var cm = this.pvt.uccelloClt.getContextCM()
                cm.getByName('SubForm').loadForm("d39036c6-5806-4886-9492-b53aa08dd63f");
            },

            clickNewTask2: function () {
                console.log ("New task2 clicked");
            }
        });
        return TaskListScripts;
    }
);