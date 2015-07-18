var isEditing = false;

function setEditing() {
    if(isEditing) {
        $('#EDIT').attr('disabled', true);
        $('#SAVE').attr('disabled', false);
        $('#CANCEL').attr('disabled', false);
        $('#CONVERT').attr('disabled', true);
        $('#ARCHIVE').attr('disabled', true);
        $('#NAME').attr('disabled', false);
        $('#ADDRESS').attr('disabled', false);
        $('#CONTACT').attr('disabled', false);
    } else {
        $('#EDIT').attr('disabled', false);
        $('#SAVE').attr('disabled', true);
        $('#CANCEL').attr('disabled', true);
        $('#CONVERT').attr('disabled', false);
        $('#ARCHIVE').attr('disabled', false);
        $('#NAME').attr('disabled', true);
        $('#ADDRESS').attr('disabled', true);
        $('#CONTACT').attr('disabled', true);
    }
}

$(function(){
    setEditing();
});