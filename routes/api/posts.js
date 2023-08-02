const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/UserSchema");
const Post = require("../../schemas/PostSchema");


app.use(bodyParser.urlencoded({ extended: false }));

//get request
router.get("/", async (req, res, next) => {
    
    var searchObj = req.query;

    //find posts with replyTo field
    if(searchObj.isReply !== undefined) {
        var isReply = searchObj.isReply == "true";
        searchObj.replyTo = { $exists: isReply };
        delete searchObj.isReply;
    }

    var results = await getPosts(searchObj);
    res.status(200).send(results);
})

router.get("/:id", async (req, res, next) => {
    var postId = req.params.id;

    var postData = await getPosts({_id: postId });
    postData = postData[0];

    var results = {
        postData: postData
    }
    //if a reply exists, load it
    if(postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    //get posts with reply to field with matching postId
    results.replies = await getPosts({replyTo: postId });

    res.status(200).send(results);
})

router.post("/", async (req, res, next) => {

    //data not sent with req 
    if(!req.body.content) {
        console.log("content not sent with request");
        return res.sendStatus(400);
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)

    .then(async newPost => {
        newPost = await User.populate(newPost, { path:"postedBy" })
        res.status(201).send(newPost);
    })

    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

router.put("/:id/like", async (req, res, next) => {
    var postId = req.params.id;
    var userId = req.session.user._id;

    //does post id exist in user likes?
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    var option = isLiked ? "$pull": "SaddtoSet";


    //user like: update likes value. use square brackets to indicate variable. returns updated document
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId }}, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    //post like
    var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId }}, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    res.status(200).send(post);

})

router.post("/:id/retweet", async (req, res, next) => {
    var postId = req.params.id;
    var userId = req.session.user._id;

    //delete retweet to detect if tweet has been retweeted
    var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    var option = deletedPost != null ? "$pull": "SaddtoSet";
    
    var repost = deletedPost
    if(repost == null) {
        //create post
        repost = await Post.create({ postedBy: userId, repostData: postId })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        })
    }
    
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id }}, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

    //update post to reflect retweet of user id who retweeted
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId }}, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    res.status(200).send(post);

})

router.delete("/:id", (req, res, next) => {
    Post.findByIdAndDelete(req.params.id)
    .then(result => res.sendStatus(202))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
})

async function getPosts(filter) {
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ "createdAt": -1 })
    .catch(error => {
        console.log(error);
    })

    //populate reply to field to access user info
    results = await User.populate(results, { path: "replyTo.postedBy "});

    return await User.populate(results, { path: "retweetData.postedBy "});
}

module.exports = router;