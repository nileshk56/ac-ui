$( document ).ready(function() {

    $("#btnCreatePost").click(function(){
        $("#modalCreatePost").modal()
    });
    
    //$('#txtPost').focus();

    $('#txtPost')
    .click(function(){ 
        this.rows=3;
        $('#txtPost').addClass("p-2");
        $('#txtPost').css("font-size", "14px") 
    });

    $("#btnAddMedia").click(function(){
        $("#filePostsMedia").click();
    });
    $("#filePostsMedia").change(function(e){
        var arrPath = $("#filePostsMedia").val().split('\\');

        $("#frmAddCreatePost").append("<p>"+arrPath[arrPath.length-1]+"</p>");
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
        var url = $(this).attr('href');
        $("#divPostComments_"+postId).show();
        
        $.get(url, function(data) {
            $("#divPostComments_"+postId).append(data);
        });
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

    $('.formTxtComment').click(function(){ 
        this.rows=2;
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
        var url = $(this).attr('href');
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        $.get(url+'?offset='+offset, function(data, status){
            console.log("asdfad", data, status);
            if(data.status != 'FAIL') {
                $("#divPosts").append(data);
                offset += limit;
                $("#btnLoadMorePosts").html("Load more posts");
                $("#btnLoadMorePosts").data("offset", offset);
            } else {
                $("#btnLoadMorePosts").hide();
            }
        });
        return false;
    });

    //$("#btnFriendRequest").click(function(){
    $(document).on('click', "#btnFriendRequest", function(event){    
        var ops = $(this).data('ops');
        var url = $(this).attr('href');
        var btnFriendRequest = $(this);
        console.log("URL", url)
        if(ops == "SENT") {
            $.get(url, function(){
                btnFriendRequest.data('ops', 'CANCEL');
                btnFriendRequest.html('Cancel friend request');
                url = url.replace('sendfriendrequest', 'deletefriendrequest');
                console.log("URL1", url)
                btnFriendRequest.attr('href', url);
            });
        } else if (ops == "CANCEL") {
            $.get(url, function(){
                btnFriendRequest.data('ops', 'SENT');
                btnFriendRequest.html('Add Friend');
                url = url.replace('deletefriendrequest', 'sendfriendrequest');
                console.log("URL2", url)
                btnFriendRequest.attr('href', url);
            });
        }
        return false;
    });

    $("#btnLoadMoreUsers").click(function(){
        var offset = parseInt($(this).data("offset"));
        var search = $(this).data("search");
        var limit = 1;
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        $.get('/search?search='+search+'&offset='+offset, function(data){
            $("#divUsers").append(data);
            offset += limit;
            $("#btnLoadMoreUsers").html("Load more users");
            $("#btnLoadMoreUsers").data("offset", offset)
        });
    });

    $("#btnLoadMoreUserPosts").click(function(){
        var offset = parseInt($(this).data("offset"));
        var limit = 1;
        var url = $(this).attr('href');
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        $.get(url+'?offset='+offset, function(data){
            if(data.status != 'FAIL') {
                $("#divPosts").append(data);
                offset += limit;
                $("#btnLoadMoreUserPosts").html("Load more posts");
                $("#btnLoadMoreUserPosts").data("offset", offset)
            } else {
                $("#btnLoadMoreUserPosts").hide();
            }
        });
        return false;
    });

    $("#frActions a").click(function(){
        var url = $(this).attr('href');
        $.get(url, function(data){
            $("#frActions").html("<b>"+data.status+"</b>")
        })
        return false;
    });
    
    $("#btnUnfriend").click(function(){
        var url = $(this).attr('href');
        $.get(url, function(data){
            $("#btnUnfriend").hide();
        })
        return false;
    });

    $("#frmUpp").submit(function(e){
        
        e.preventDefault();
        $( this ).fadeTo( "slow", 0.33 );

        //get the action-url of the form
        var actionurl = e.currentTarget.action;

        // Get form
        var form = $('#frmUpp')[0];

		// Create an FormData object 
        var data = new FormData(form);
        data.append("filePP", $(form.filePP).val());
        data.append("a","b");
        console.log("data", actionurl, data)
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
                $( "#frmUpp" ).fadeTo( "slow", 1 );
                $("#frmUpp")[0].reset();
                window.location = actionurl
            },
            error: function (e) {
                console.log("ERROR : ", e);
                $("#frmUpp")[0].reset();
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
