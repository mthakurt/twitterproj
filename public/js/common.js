// client side frontend components

//control button enable/disable
$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    //check parents to see if it has class modal
    var isModal = textbox.parents(".modal").length == 1;

    var submitButton = isModal? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) {
        return alert("no submit button found");
    }
    if(value == "") {
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false);

})

//what happens after button is clicked
$("#submitPostButton, #submitReplyButton").click((event) => {
    var button = $(event.target);

    var isModal = button.parents(".modal").length == 1;

    var textbox = isModal? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    //get id of post replying to
    if (isModal) {
        var id = button.data().id;
        if(id == null) return alert("null button id");
        data.replyTo = id;
    }
    
    //success
    $.post("/api/posts", data, postData => {
        //reload if there is a reply
        if(postData.replyTo) {
            location.reload();
        }

        else {
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }
    })
})

//check if modal open using bootstrap
$("#replyModal").on("show.bs.modal"), (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);

    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
     })

}

//when modal is closed
$("#replyModal").on("hidden.bs.modal"), () => $("#originalPostContainer").html("");

//for deleting a post
$("#deletePostModal").on("show.bs.modal"), (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);

    $("#deletePostButton").data("id", postId);

}

//on delete button click
$("#deletePostButton").click((event) => {
    var postId = $(event.target).data("id");

    //use delete ajax request
    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {
            if(xhr.status != 202) {
                alert("could not delete post!");
                return;
            }
            //reload page
           location.reload();
        }
    })

})

//shows after page load
$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    if(postId === undefined) return;
    //make put request, basically same as post/get request format
    $.ajax({
        //backtick for js var
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");
            //check if user has liked it
            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }
        }
    })

})

$(document).on("click", ".retweetButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    if(postId === undefined) return;
    
    $.ajax({

        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            
            button.find("span").text(postData.retweetUsers.length || "");
            
            if(postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }
        }
    })

})

$(document).on("click", ".post", (event) => {
    //get post id
    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    //if postId exists, send user to post page
    if(postId !== undefined && !element.is("button")) {
        window.location.href = '/posts/' + postId;
    }
})

//find post id
function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot ? element: element.closest(".post");
    var postId = rootElement.data().id;
    if(postId === undefined) return alert("Undefined post ID");
    return postId;
}

//don't have to pass in font if not needed, defaults to false
function createPostHtml(postData, largeFont = false) {

    if(postData == null) return alert("post object is null");

    var isRetweet = postData.retweetData !== undefined;

    //return username or null if not retweeted
    var retweetedBy = isRetweet ? postData.postedBy.username: null;
    postData = isRetweet ? postData.retweetData : postData;
    var postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return alert("User object not populated");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    var retweetText = '';
    var largeFontClass = largeFont ? "largeFont" : "";

    //link user who retweeted
    if (isRetweet) {
        retweetText = `<span>
                        <i class = 'fa-solid fa-retweet'> </i>
                        Retweeted by <a href = '/profile/${retweetedBy}'>@${retweetedBy}</a>
                       </span>`
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id) {
        if(!postData.replyTo._id) {
            return alert("Reply to is not populated");
        }

        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class = 'replyFlag>
                        Replying to <a href = '/profile/${replyToUsername}'> @${replyToUsername} <a>
                    </div>`
    }

    var buttons = "";
    //if post belongs to user logged in
    if(postData.postedBy._id == userLoggedIn._id) {
        buttons = `<button data-id= "${postData._id}" data-toggle = "modal" data-target = "#deletePostModal">
            <i class= 'fa-solid fa-xmark'></i>
        </button>`;
    }


    return `<div class = 'post ${largeFontClass}' data-id= '${postData._id}'> 
            <div class = 'postActionContainer'> 
                ${retweetText}
            </div>
            <div class = 'mainContentContainer'>
                <div class='userImageContainer'>
                    <img src = '${postedBy.profilePic}'>
                </div>
                <div class = 'postContentContainer'>
                    <div class = 'header'>
                        <a href = '/profile/${postedBy.username}' class = 'displayName' >${displayName}</a>
                        <span class = 'username'>@${postedBy.username}</span>
                        <span class = 'date'>${timestamp}</span>
                        ${buttons}
                    </div>
                    ${replyFlag}
                    <div class = 'postBody'>
                        <span> ${postData.content} </span>
                    </div>
                    <div class = 'postFooter'>
                        <div class = 'postButtonContainer'>
                            <button data-toggle='modal' data-target = '#replyModal'>
                                <i class = 'fa-regular fa-comment'> </i>
                             </button> 
                        </div>
                        <div class = 'postButtonContainer green'>
                            <button class = 'retweetButton ${retweetButtonActiveClass}'>
                                <i class = 'fa-solid fa-retweet'> </i>
                                <span>${postData.retweetUsers.length || ""} </span>
                             </button> 
                        </div>
                        <div class = 'postButtonContainer red'>
                            <button class = 'likeButton ${likeButtonActiveClass}'>
                                <i class = 'fa-regular fa-heart'> </i>
                                <span>${postData.likes.length || ""} </span>
                             </button> 
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed / 1000 < 30) return 'Just now';

         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {
    container.html("");

    //make it an array 
    if(!Array.isArray(results)) {
        results = [results];
    }
    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    })
    if(results.length == 0) {
        container.append("<span class = 'noResults'> Nothing to show here. </span>")
    }
}

function outputPostsWithReplies(results, container) {
    container.html("");

    //check if post is a reply
    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo);
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);

    //output posts 
    results.replies.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    });
}