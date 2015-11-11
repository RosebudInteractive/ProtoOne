/**
 * Created by staloverov on 25.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath + '/process/processObject'],
    function (ProcessObject){
        var TestScript = UccelloClass.extend( {
            init : function () {
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
            
            execObjMethodCreate : function () {
                this._execObjMethod("StartTask");
            },            
            
            execObjMethodEdit : function () {
                this._execObjMethod("ObjEditTask");
            },            
            
            checkIfDone : function () {
                this.scriptObject.returnResult(this._checkIfDone());
            },
            
            checkIfNotDone : function () {
                this.scriptObject.returnResult(!this._checkIfDone());
            },
            
            _checkIfDone : function () {
                var param = this.scriptObject.processFacade.findParameter("IsDone");
                var result = param ? param.value() : false;
                return result;
            },
            
            _setDone : function (clearContext, obj_to_save) {
                if (this.scriptObject) {
                    var result = false;
                    var param = this.scriptObject.processFacade.findParameter("CurrentObj");
                    if (param) {
                        var obj = this._locateObj(param.value());
                        if (obj && (obj instanceof ProcessObject)) {
                            var state = obj._genericSetter("State");
                            result = ((state == "Converted") || (state == "Archieved"));
                            if (result && clearContext) {
                                obj.currentProcess(null);
                                if (obj_to_save)
                                    obj_to_save.obj = obj;
                            }
                            param = this.scriptObject.processFacade.findParameter("IsDone");
                            if (param && result)
                                param.value(result);
                        };
                    };
                } else {
                    throw 'scriptObject не определен'
                };
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
            
            _execObjMethod : function (prev_node) {
                
                console.log("==> [execObjMethod] started!");
                
                if (this.scriptObject) {
                    var response = this.scriptObject.processFacade
                    .currentToken().getPropertiesOfNode(prev_node).responses().get(0);
                    //var response = this.scriptObject.response;
                    
                    var objURI = response.findParameter("objURI").value();
                    var func = response.findParameter("func").value();
                    var args = response.findParameter("args").value();
                    var obj = this._locateObj(objURI);
                    var db = obj ? obj.getDB() : null;
                    
                    var that = this;
                    
                    function callback(result) {
                        
                        var res = result;
                        var obj_to_save = {};
                        if (result && result.newObject && db) {
                            var newObject = db.getObj(result.newObject);
                            
                            if (newObject instanceof ProcessObject) {
                                
                                var processID = that.scriptObject.processFacade.get("ProcessID");
                                newObject.currentProcess(processID);
                                obj_to_save.obj = newObject;

                                var param = that.scriptObject.processFacade.findParameter("CurrentObj");
                                if (param)
                                    param.value("memdb://" + db.getGuid() + "." + result.newObject);
                            };
                        } else {
                            that._setDone(true, obj_to_save);
                        };
                        
                        function finalize(result) {
                            that.scriptObject.returnResult(result);
                            console.log("<== [execObjMethod] finished!");
                        };
                        if (obj_to_save.obj)
                            obj_to_save.obj._$local_save(finalize) // Если вызвать просто save - страшно представить, что будет !
                        else
                            finalize(result);
                    };
                    
                    args.push(callback);
                    obj[func].apply(obj, args);

                } else {
                    throw 'scriptObject не определен'
                }
            }
        });

        return TestScript;
    }
)
