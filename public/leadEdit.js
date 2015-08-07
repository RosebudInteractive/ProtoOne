define(
    [],
    function() {
        var LeadEdit = Class.extend({

            init: function(uccelloClt) {
                this.pvt = {};
                this.pvt.uccelloClt = uccelloClt;
            },

            clickEdit: function() {
                this.setEditForm(true);
                this._invokeObjMethod("edit");
            },

            clickConvert: function(edit) {
                this.setEditForm(true);
                this._invokeObjMethod("convert");
            },

            clickArchive: function(edit) {
                this.setEditForm(true);
                this._invokeObjMethod("archive");
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
                this.setEditForm(false);
                this._invokeObjMethod("save");
            },

            clickCancel: function(edit) {
                this.setEditForm(false);
                this._invokeObjMethod("cancel");
            },

            clickNew: function (edit) {
                var recordid = Math.floor(Math.random() * 10000) + 10000;
                this._dataset().addObject(
                    {
                        fields: {
                            Id: recordid,
                            Name: 'Record ' + recordid,
                            State: 'state ' + recordid,
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
                                alert("Object has been successfully created !")
                            else
                                alert("Error occured !");
                        }
                    });
            },
            
            setEditForm: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
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
                cm.getByName('LeadState').enabled(edit);
                cm.getByName('LeadContent').enabled(edit);
                cm.getByName('LeadCreation').enabled(edit);
                cm.getByName('LeadClosed').enabled(edit);
                cm.getByName('LeadOpportunityId').enabled(edit);
            },

            _dataset: function () {
                var cm = this.pvt.uccelloClt.getContextCM();
                return cm.getByName('DatasetLeadEdit');
            },

            _currentObj: function () {
                return this._dataset().getCurrentDataObject();
            },

            _invokeObjMethod: function (method_name) {
                var obj = this._currentObj();
                if (obj)
                    obj[method_name](function (result) {
                        if (DEBUG)
                            console.log('"' + method_name + '" finished with result: ' + JSON.stringify(result));
                        if (result && result.result) {
                            if (result.result !== "OK")
                                alert("Error occured !");
                        }
                    });
            }
        });
        return LeadEdit;
    }
);