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
            },

            clickConvert: function(edit) {
                this.setEditForm(true);
            },

            clickArchive: function(edit) {
                this.setEditForm(true);
            },

            clickSave: function(edit) {
                this.setEditForm(false);
            },

            clickCancel: function(edit) {
                this.setEditForm(false);
            },

            setEditForm: function(edit) {
                var cm = this.pvt.uccelloClt.getContextCM();
                cm.getByName('EditButton').enabled(!edit);
                cm.getByName('ConvertButton').enabled(!edit);
                cm.getByName('ArchiveButton').enabled(!edit);
                cm.getByName('SaveButton').enabled(edit);
                cm.getByName('CancelButton').enabled(edit);
                cm.getByName('LeadId').enabled(edit);
                cm.getByName('LeadSource').enabled(edit);
                cm.getByName('LeadState').enabled(edit);
                cm.getByName('LeadContent').enabled(edit);
                cm.getByName('LeadCreation').enabled(edit);
                cm.getByName('LeadClosed').enabled(edit);
                cm.getByName('LeadOpportunityId').enabled(edit);
            }
        });
        return LeadEdit;
    }
);