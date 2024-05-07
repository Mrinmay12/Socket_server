import mongoose from "mongoose";
const Schema = mongoose.Schema
const userSchema = new Schema({
    name: {
        type: String
    },
    age: { type: String },
    email: {
        type: String
    },
    password: { type: String },
    resetToken: { type: String },
    sex:{type:String},
    user_id:{type:String},
    sitelink:{type:String},
    about:{type:String},
    message_id:{type:String},
    work_title:{type:String},
    phone_number:{type:String},
    profile_lock:{type:Boolean},
    email:{type:String},
    motivation_line:{type:String}

}, {
    timestamps: true
})

const User = mongoose.model("UsersInformation", userSchema)
export default User
