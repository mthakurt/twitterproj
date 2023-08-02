$(document).ready(() => {
    if(selectedTab === "replies") {
        loadReplies();
    }
    else {
        loadPosts();
    }
});

function loadPosts() {
    //load posts from this user on their page + only show posts, not replies
    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
        outputPosts(results, $(".pos;tsContainer"))
     })
};

function loadReplies() {
    //load posts from this user on their page + only show posts, not replies
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
        outputPosts(results, $(".pos;tsContainer"))
     })
};