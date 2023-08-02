const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    //required not set for retweets (no new content sent)
    content : { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User'}],
    //id of retweeted post
    retweetData: { type: Schema.Types.ObjectId, ref: 'Post' },
    replyTo: { type: Schema.Types.ObjectId, ref: 'Post' }
}, { timestamps: true } )

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;