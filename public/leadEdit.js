define(
    [],
    function() {
        var LeadEdit = Class.extend({

            init: function(uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
            },

            clickEdit: function () {
                var self = this;
                this._invokeObjMethod("edit", function () {
                    self.setEditForm(true);
                });
            },

            clickConvert: function(edit) {
                var self = this;
                this._invokeObjMethod("convert", function () {
                    //self.setEditForm(true);
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
                this._invokeObjMethod("save", function () {
                    self.setEditForm(false);
                });
            },

            clickCancel: function(edit) {
                var self = this;
                this._invokeObjMethod("cancel", function () {
                    self.setEditForm(false);
                });
            },

            clickNew: function (edit) {
                var recordid = Math.floor(Math.random() * 10000) + 10000;
                this._dataset().addObject(
                    {
                        fields: {
                            Id: recordid,
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
            
            setEditForm: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.userEventHandler(this, function () {
                    cm.getByName('EditButton').enabled(!edit);
                    cm.getByName('ConvertButton').enabled(!edit);
                    cm.getByName('ArchiveButton').enabled(!edit);
                    cm.getByName('NextButton').enabled(!edit);
                    cm.getByName('PrevButton').enabled(!edit);
                    cm.getByName('SaveButton').enabled(edit);
                    cm.getByName('CancelButton').enabled(edit);
                    cm.getByName('NewButton').enabled(!edit);
                    cm.getByName('LeadId').enabled(edit);
                    cm.getByName('LeadSource').enabled(edit);
                    //cm.getByName('LeadState').enabled(edit);
                    cm.getByName('LeadContent').enabled(edit);
                    cm.getByName('LeadCreation').enabled(edit);
                    //cm.getByName('LeadClosed').enabled(edit);
                    cm.getByName('LeadOpportunityId').enabled(edit);
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
                if (obj)
                    obj[method_name](function (result) {
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
                    })
                else {
                    if (callback)
                        setTimeout(function () {
                            callback();
                        }, 0);
                };
            }
        });
        return LeadEdit;
    }
);