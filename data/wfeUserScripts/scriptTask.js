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
            }
        });

        return TestScript;
    }
)
