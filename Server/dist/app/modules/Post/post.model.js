"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    upVotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    downVotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    district: { type: String, required: true },
    division: { type: String, required: true },
    location: { type: String, required: true },
    postDate: { type: Date, required: true },
    crimeDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Post = (0, mongoose_1.model)('Post', postSchema);
