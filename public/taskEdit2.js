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
                });
            },

            clickCancel: function(button) {
                console.log ("Cancel clicked");
            },

            clickEdit: function(button) {
                console.log ("Edit clicked");
            }


        });
        return TaskEditScripts;
    }
);