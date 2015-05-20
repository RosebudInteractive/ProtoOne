if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}
define(
    [UCCELLO_CONFIG.uccelloPath+'dataman/dataRoot'],
    function(DataRoot) {
        var RootContact = DataRoot.extend({

            className: "RootContact",
            classGuid: "ad17cab2-f41a-36ef-37da-aac967bbe356",
            metaCols: [{"cname": "DataElements", "ctype": "data"}],
            metaFields: [],

            init: function(cm,params){
                this._super(cm,params);
            }
        });
        return RootContact;
    }
);