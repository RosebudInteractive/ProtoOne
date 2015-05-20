if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootContract = DataRoot.extend({

            className: "RootContract",
            classGuid: "4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b",
            metaCols: [{"cname": "DataElements", "ctype": "data"}],
            metaFields: [],

            init: function(cm,params){
                this._super(cm,params);
            }
        });
        return RootContract;
    }
);