const { Router } = require("express");
const { userModel, purchaseModel } = require("../db/db");
const userRouter = Router();
const jwt = require("jsonwebtoken");
const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const { z } = require("zod")
const bcrypt = require("bcrypt")

const { userMiddleware } = require("../middleware/userMiddleware");

userRouter.post('/signup', async (req, res) => {
    const requiredBody = z.object({
        email: z.string().min(4).max(100).email(),

        password: z.string().min(3).max(30),
        username: z.string().min(3).max(50)
    })

    const safeParsedData = requiredBody.safeParse(req.body);
    if (!safeParsedData.success) {
        res.json({
            message: "Incorrect format",
            error: safeParsedData.error
        })
    }

    const email = req.body.email;
    const password = req.body.password;
    const username = req.body.username;

    const hashedPassword = await bcrypt.hash(password, 7);
    console.log(hashedPassword);


    await userModel.create({
        email,
        password: hashedPassword,
        username
    })

    res.json({
        message: "login success"
    })

})

userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email
    })

    if (!user) {
        return res.json({
            message: "No user found!"
        })
    }
    const verify = await bcrypt.compare(password, user.password);

    if (!verify) {
        return res.json({
            message: "Invalid Password"
        })
    }

    const token = jwt.sign({
        id: user._id
    }, JWT_USER_SECRET);

    res.json({
        message: "You are in user signin route",
        token
    })
}
)

userRouter.get('/purchases', userMiddleware, async (req, res) => {
    const userId = req.userId;
    const purchases = await purchaseModel.find({
        userId,
    });
    console.log(purchases);

    let purchasedCourseIds = [];

    for (let i = 0; i < purchases.length; i++) {
        purchasedCourseIds.push(purchases[i].courseId)
    }


    res.json({
        purchases,
        purchasedCourseIds
    })
})


module.exports = {
    userRouter
}