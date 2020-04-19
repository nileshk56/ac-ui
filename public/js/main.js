$( document ).ready(function() {

    $("#btnCreatePost").click(function(){
        $("#modalCreatePost").modal()
    });
    
    $('#txtPost').focus();

    $('#txtPost')
    .click(function(){ this.rows=3 });

    $("#btnAddMedia").click(function(){
        $("#filePostsMedia").click();
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
                $( "#frmAddCreatePost" ).fadeTo( "slow", 1 );
                $("#divPosts").prepend(data);
                $("#frmAddCreatePost")[0].reset();
            },
            error: function (e) {
                console.log("ERROR : ", e);
                $("#frmAddCreatePost")[0].reset();
            }
        });
    });

    $(document).on('click', ".btnPostLike", function(event){
        var likeCount = parseInt($(this).data("likecount"));
        var url = $(this).attr('href');
        console.log("asd", url);
        $.ajax({
            type: "GET",
            url: url,
            success:  (data) => {
                $(this).children("span").html(likeCount +1);
                $(this).removeAttr("href");
            },
            error:  (e) => {
                $(this).removeAttr("href");
            }
        });

		return false;
	});

    $(document).on('click', ".btnPostComment", function(event){
		var postId = parseInt($(this).data("postid"));
        $("#divPostComments_"+postId).show();
		return false;
    });
    
    $('.formTxtComment').keydown(function(event) {
        if (event.keyCode == 13) {
            var commentCount = parseInt($(this).data("commentcount"));
            var form = $(this.form)[0];
            var data = new FormData();            
            data.append("post_id", $(form.post_id).val())
            data.append("comment", $(form.comment).val());
            $( form ).fadeTo( "slow", 0.33 );
            var actionurl = form.action;

            $.ajax({
                type: "POST",
                url: actionurl,
                data: $(form).serialize(),
                success: function (data) {
                    $( form ).fadeTo( "slow", 1 );
                    $( form ).after(data);
                    $(this).children("span").html(commentCount +1);
                    form.reset();
                },
                error: function (e) {
                    console.log("ERROR : ", e);
                    form.reset();
                }
            });
         }
    });

    $(".formPostComment").submit(function(e){
        
        e.preventDefault();
        $( this ).fadeTo( "slow", 0.33 );

        //get the action-url of the form
        var actionurl = e.currentTarget.action;

        // Get form
        var form = $(this)[0];

		// Create an FormData object 
        var data = new FormData(form);
        
        console.log("dafa", data, actionurl)

        $.ajax({
            type: "POST",
            url: actionurl,
            data: data,
            success: function (data) {
                $( form ).fadeTo( "slow", 0.33 );
                $( form ).prepend(data);
                form.reset();
            },
            error: function (e) {
                console.log("ERROR : ", e);
                form.reset();
            }
        });
        return false;
    });

    $(document).on('click', ".btnPostShare", function(event){
		
        var shareCount = parseInt($(this).data("sharecount"));
        var url = $(this).attr('href');
        $.ajax({
            type: "GET",
            url: url,
            success:  (data) => {
                $(this).children("span").html(shareCount +1);
                $(this).removeAttr("href");
            },
            error:  (e) => {
                $(this).removeAttr("href");
            }
        });

		return false;
    });
    
    $("#btnLoadMorePosts").click(function(){
        var offset = parseInt($(this).data("offset"));
        var limit = 1;
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        $.get('/?offset='+offset, function(data){
            $("#divPosts").append(data);
            offset += limit;
            $("#btnLoadMorePosts").html("Load More");
            $("#btnLoadMorePosts").data("offset", offset)
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
