import mongoose, { Schema } from "mongoose";
const schema = (Schema) = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    timestamps: true
});
export const User = mongoose.model('User', schema);
