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
                });
            },

            clickCancel: function() {
                console.log ("Cancel clicked");
            },

            clickCreate: function() {
                console.log ("Create clicked");
            }


        });
        return TaskEditScripts;
    }
);