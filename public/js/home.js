$(document).ready(() => {
    $.get("/api/posts", results => {
       outputPosts(results, $(".postsContainer"))
    })
})

//display other posts
function outputPosts(results, container) {
    //clear container
    container.html("");
    //loop and output results
    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    })
    //no posts
    if(results.length == 0) {
        container.append("<span class = 'noResults'> Nothing to show here. </span>")
    }
}
