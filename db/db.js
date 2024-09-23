const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
    email : {
        type: String,
        unique: true
    },
    password : String,
    username : String
}) 

const courseSchema = new Schema({
    title : String,
    description : String,
    price: Number,
    imageURL: String,
    creatorId : ObjectId
})

const adminSchema = new Schema({
    email : {
        type: String,
        unique: true
    },
    password : String,
    username : String
})

const purchaseSchema = new Schema({
    userId : ObjectId,
    courseId: ObjectId
})

const userModel = mongoose.model('users', userSchema);
const adminModel = mongoose.model('admin', adminSchema);
const courseModel = mongoose.model('course', courseSchema);
const purchaseModel = mongoose.model('purchase', purchaseSchema);


module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}