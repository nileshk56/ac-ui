$( document ).ready(function() {

    $("#btnCreatePost").click(function(){
        $("#modalCreatePost").modal()
    });
    
    $('#txtPost').focus();

    $('#txtPost')
    .click(function(){ this.rows=3 })
    .blur( function(){ this.rows=1 });

    $("#btnAddMedia").click(function(){
        $("#filePostsMedia").click();
        $("#filePostsMedia").show();
    });

    $("#frmAddCreatePost").submit(function(e){
        
        e.preventDefault();
        $( this ).fadeTo( "slow", 0.33 );

        //get the action-url of the form
        var actionurl = e.currentTarget.action;

        // Get form
        var form = $('#frmAddCreatePost')[0];

		// Create an FormData object 
        var data = new FormData(form);
        alert(data);
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: actionurl,
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data) {

                $("#result").text(data);
                console.log("SUCCESS : ", data);
                $("#btnSubmit").prop("disabled", false);

            },
            error: function (e) {

                $("#result").text(e.responseText);
                console.log("ERROR : ", e);
                $("#btnSubmit").prop("disabled", false);

            }
        });
    });

    /*$( "#dob" ).datepicker({
        changeMonth: true,
        changeYear: true,
        minDate : "-100Y",
        maxDate : "1D",
        dateFormat : "yy-mm-dd"
    });

    $( "#curr_amount" ).keyup(function(event){
       
        $("#loader").show();

        var curr_type = $("#buy_with option:selected").val();
        var curr_amount = $(this).val();
        
        var url = "/get_tokens_amount?symbol=" + curr_type + "&curr_amount=" + curr_amount;
        
        $.get(url, function(data, status){
            $("#loader").hide();    
            $( "#token_amount" ).val(data.tokens);
 
        });

    });

    $("#btn_submit_buy_form").click(function(){

        $("#loader").show();

        var curr_type = $("#buy_with option:selected").val();
        var curr_amount = $("#curr_amount").val();
        
        var url = "/get_tokens_amount?symbol=" + curr_type + "&curr_amount=" + curr_amount;
        
        $.get(url, function(data, status){
            //$("#loader").hide();    
            $( "#token_amount" ).val(data.tokens);
           
            $.ajax({
                type: 'post',
                url: '/buy_tokens',
                data: $('#frmBuyTokens').serialize(),
                success: function (data) {
                    $( "#deposit_address_" + curr_type ).val(data.depositAddress);
                    $( "#modal_deposit_" + curr_type ).modal();
                    $("#loader").hide(); 
                },
                error:function(e, data) {
                    console.log("e",e, typeof e, e.msg)
                    $("#divMsg").append(e.responseJSON.msg);
                    $("#divMsg").show();
                    $("#loader").hide(); 
                }
            });
            $("#frmBuyTokens")[0].reset();
            //$( "#modal_deposit_" + curr_type ).modal();
            //return false;
        });

        //return false;
    });

    $(".modal_deposit").on('hidden.bs.modal', function(){
        $("#frmBuyTokens")[0].reset();
    });

    $("#buy_with").change(function(){

        var curr_type = $("#buy_with option:selected").val();
        var curr_amount = parseInt($("#curr_amount").val());
        
        var url = "/get_tokens_amount?symbol=" + curr_type + "&curr_amount=" + curr_amount;
        
        if(curr_amount > 0) {
            $("#loader").show();
            
            $.get(url, function(data, status){
                $("#loader").hide();    
                $( "#token_amount" ).val(data.tokens);
            });
        }
    });

    $("#btnChangePass").click(function(){

        var p1 = $("#password1").val();
        var p2 = $("#password2").val();
        
        console.log(p1, p2)
        if(p1 != p2) {
            $("#divMsg").append("Password & Confirm Password should be same");
            $("#divMsg").show();
            return false;
        }

        $("#frmChangePwd").submit();
    });*/

});
