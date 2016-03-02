define(
    [],
    function() {
        var LeadEditDataset = Class.extend({

            init: function(uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
            },

            clickEdit: function () {
                var self = this;
                var ds = this._dataset();
                ds.edit(function (result) {
                    if (result.result === "OK") {
                        self.setEditForm(true);
                    } else
                        alert("Error occured: \"" + result.message + "\"");
                });
            },

            clickArchive: function(edit) {
                var self = this;
                this._invokeObjMethod("archive", function () {
                    //self.setEditForm(true);
                });
            },

            clickNext: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('DatasetLeadEdit').next();
            },

            clickPrev: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('DatasetLeadEdit').prev();
            },

            clickSave: function(edit) {
                var self = this;
                var ds = this._dataset();
                ds.save({}, function (result) {
                    if (result.result === "OK") {
                        self.setEditForm(false);
                    } else
                        alert("Error occured: \"" + result.message + "\"");
                });
            },

            clickCancel: function(edit) {
                var self = this;
                var ds = this._dataset();
                ds.cancel(function (result) {
                    if (result.result === "OK") {
                        self.setEditForm(false);
                    } else
                        alert("Error occured: \"" + result.message + "\"");
                });
            },

            clickNew: function (edit) {
                var recordid = Math.floor(Math.random() * 10000) + 10000;
                this._dataset().addObject(
                    {
                        fields: {
                            Name: 'Record ' + recordid,
                            State: 'Open',
                            Source: 'Source ' + recordid,
                            Content: 'Content ' + recordid,
                            Creation: new Date().toISOString().slice(0, 19).replace('T', ' '),
                            OpportunityId: recordid
                        }
                    }, function (result) {
                        if (DEBUG)
                            console.log('END ADD OBJ with result: ' + JSON.stringify(result));
                        if (result && result.result) {
                            if (result.result === "OK")
                                alert("Object has been successfully created !\nGUID: \"" + result.newObject + "\".");
                            else
                                alert("Error occured: \"" + result.message + "\"");
                        }
                    });
            },

            clickAutoEdit: function() {
                var cm = this.pvt.uccelloClt.getContextCM();
                var ds = this._dataset();
                ds.autoEdit(!ds.autoEdit());
                console.log(ds.autoEdit());
            },
            
            setEditForm: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.userEventHandler(this, function () {
                    cm.getByName('EditButton').enabled(!edit);
                    cm.getByName('NextButton').enabled(!edit);
                    cm.getByName('PrevButton').enabled(!edit);
                    cm.getByName('SaveButton').enabled(edit);
                    cm.getByName('CancelButton').enabled(edit);
                    cm.getByName('NewButton').enabled(!edit);
                });
            },

            _dataset: function () {
                var cm = this.pvt.uccelloClt.getContextCM();
                return cm.getByName('DatasetLeadEdit');
            },

            _currentObj: function () {
                return this._dataset().getCurrentDataObject();
            },

            _invokeObjMethod: function (method_name, callback) {
                var obj = this._currentObj();
                var isDone = true;
                if (arguments.length >= 1) {
                    var method_name = arguments[0];
                    var callback = (arguments.length > 1) &&
                        (typeof (arguments[arguments.length - 1]) === "function") ? arguments[arguments.length - 1] : null;
                    var args = [];
                    for (var i = 1; i < (arguments.length - 1) ; i++)
                        args[i - 1] = arguments[i];
                    if (obj) {
                        args.push(function (result) {
                            if (DEBUG)
                                console.log('"' + method_name + '" finished with result: ' + JSON.stringify(result));
                            if (result && result.result) {
                                if (result.result !== "OK") {
                                    var msg = result.message ? ": \"" + result.message + "\"" : ".";
                                    alert("Error occured" + msg);
                                    isDone = false;
                                };
                            };
                            if (isDone && callback)
                                setTimeout(function () {
                                    callback();
                                }, 0);
                        });
                        obj[method_name].apply(obj, args);
                    }
                    else {
                        if (callback)
                            setTimeout(function () {
                                callback();
                            }, 0);
                    };
                };
            }
        });
        return LeadEditDataset;
    }
);