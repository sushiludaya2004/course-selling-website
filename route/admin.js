const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db/db");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
const jwt = require("jsonwebtoken");

const { adminMiddleware } = require("../middleware/adminMiddleware")

adminRouter.post("/signup", async function (req, res) {

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


    await adminModel.create({
        email,
        password: hashedPassword,
        username
    })

    res.json({
        message: "signup success"
    })
})

adminRouter.post("/signin", async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await adminModel.findOne({
        email: email
    });

    if (!admin) {
        return res.json({
            message: "No user found!"
        })
    }
    console.log(admin.password)
    const verify = await bcrypt.compare(password, admin.password);

    if (!verify) {
        return res.json({
            message: "Invalid Password"
        })
    }

    const token = jwt.sign({
        id: admin._id
    }, JWT_ADMIN_SECRET);

    res.json({
        token
    })

})

adminRouter.post("/course", adminMiddleware, async function (req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price } = req.body;

    const course = await courseModel.create({
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
        creatorId: adminId
    })
    console.log(course);


    res.json({
        message: "Course created",
        courseId: course._id
    })
})

adminRouter.put("/course", adminMiddleware, async function (req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price, courseId } = req.body;

    const check = await courseModel.findOne({
        _id: courseId,
        creatorId: adminId
    })

    if (check) {
        const course = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        }, {
            title: title,
            description: description,
            imageUrl: imageUrl,
            price: price
        })

        res.json({
            message: "Course updated",
            courseId: course._id
        })
    }
    else {
        res.json({
            message: "Enter valid credentials!!!!"
        })
    }
})

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
    
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId 
    });

    const courseTitles = courses.map(course => course.title);

    res.json({
        message: `Courses by ${adminId}`,
        courses,
        courseTitles
    })
    
})

module.exports = {
    adminRouter: adminRouter
}