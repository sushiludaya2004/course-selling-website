const express = require("express");
const mongoose = require("mongoose");

require('dotenv').config()

const { userRouter } = require("./route/user")
const { courseRouter } = require("./route/course")
const { adminRouter } = require("./route/admin")

const jwt = require("jsonwebtoken");


const app = express();
app.use(express.json());

app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);

async function main(){
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(3000, ()=>{
        console.log("Server is running!!!");
    })
}

main();
