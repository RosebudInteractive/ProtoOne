if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootAddress = DataRoot.extend({

            className: "RootAddress",
            classGuid: "07e64ce0-4a6c-978e-077d-8f6810bf9386",
            metaCols: [{"cname": "DataElements", "ctype": "data"}],
            metaFields: [],

            init: function(cm,params){
                this._super(cm,params);
            }
        });
        return RootAddress;
    }
);