$(function() {
    $( "#tabs" ).tabs();
});

function doAction(btn, action) {
    $(btn).attr('disabled', true);
    $.ajax({
        method: "POST",
        url: "/admin/"+action,
        data: { branchProject: $('#branchProject').val(), branchName: $('#branchName').val(), serverProject: $('#serverProject').val() }
    })
        .done(function( msg ) {
            //console.log(arguments);
            if (!msg && msg == '') msg = 'Ok';
            $('#branchResponse').html('<p>'+msg+'</p>'+$('#branchResponse').html());
            //$('#branchResponse').html('<p>'+msg+'</p>');
            $(btn).attr('disabled', false);
        });
}
