/**
 * Created by staloverov on 25.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function (){
        var TestScript = Class.extend({
            init : function() {
                this.scriptObject = null;
            },

            execScript : function () {
                
                if (this.scriptObject) {
                    var response = this.scriptObject.processFacade
                    .currentToken().getPropertiesOfNode("UserTask1").responses().get(0);
                    
                    var dbGuid = response.findParameter("dbGuid").value();
                    var rootGuid = response.findParameter("rootGuid").value();
                    var objTypeGuid = response.findParameter("objTypeGuid").value();
                    var flds = response.findParameter("flds").value();
                    
                    console.log("New object creation started:");
                    console.log("  dbGuid: " + dbGuid);
                    console.log("  rootGuid: " + rootGuid);
                    console.log("  objTypeGuid: " + objTypeGuid);
                    console.log("  flds: " + JSON.stringify(flds));
                    
                    var db = this.scriptObject.processFacade.getDB().getController().getDB(dbGuid);
                    var dataRoot = db.getRoot(rootGuid).obj;
                    var constr = db.getContext().getConstructorHolder().getComponent(objTypeGuid).constr;
                    
                    var params = { parent: dataRoot, colName: "DataElements", ini: flds };
                    var obj = new constr(db, params);

                    console.log("### New object has been created !!!");
                    
                    var that = this;

                    //setTimeout(function() {
                    that.scriptObject.returnResult(null);
                    //}, 0);
                } else {
                    throw 'scriptObject не определен'
                }
            },
            
            _locateObj : function (uri) {
                var obj = null;
                var i = uri.indexOf("://");
                if (i >= 0) {
                    var scheme = uri.substring(0, i);
                    if (scheme === "memdb") {
                        var j = uri.indexOf(".");
                        if (j >= 0) {
                            var dbGuid = uri.substring(i + 3, j);
                            var objGuid = uri.substring(j + 1, uri.length);
                            var db = this.scriptObject.processFacade.getDB().getController().getDB(dbGuid);
                            obj = db ? db.getObj(objGuid) : null;
                        };
                    };
                };
                return obj;
            },
            
            execObjMethod : function () {
                
                if (this.scriptObject) {
                    var response = this.scriptObject.processFacade
                    .currentToken().getPropertiesOfNode("UserTask1").responses().get(0);
                    
                    var objURI = response.findParameter("objURI").value();
                    var args = response.findParameter("args").value();
                    var obj = this._locateObj(objURI);

                    console.log("New object creation started:");
                    console.log("  dbGuid: " + dbGuid);
                    console.log("  rootGuid: " + rootGuid);
                    console.log("  objTypeGuid: " + objTypeGuid);
                    console.log("  flds: " + JSON.stringify(flds));
                    
                    console.log("### New object has been created !!!");
                    
                    var that = this;
                    
                    //setTimeout(function() {
                    that.scriptObject.returnResult(null);
                    //}, 0);
                } else {
                    throw 'scriptObject не определен'
                }
            },


        });

        return TestScript;
    }
)
