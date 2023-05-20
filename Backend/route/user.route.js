const express = require("express")
const { UserModel } = require("../model/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const {BlacklistModel} = require("../model/block")
var cookieParser = require('cookie-parser')
const user_route = express.Router()
user_route.use(cookieParser())
user_route.use(express.json());
const cors = require("cors")




user_route.post("/signup", async (req, res) => {
    const { name, email, pass } = req.body
    try {
        bcrypt.hash(pass, 4, async (err, hash) => {
            if (err) {
                console.log(err);
                res.send("something went wrong")
            } else {
                const user = new UserModel({ name, email, pass: hash })
                await user.save()
                res.json({ "msg": "signup successfull", user })
            }
        })
    } catch (error) {
        res.send("error in register the user")
        console.log(error);
    }

})

user_route.post("/login", async (req, res) => {
    const { email, pass } = req.body
    try {
        const user = await UserModel.find({ email })
        if (user.length > 0) {
            bcrypt.compare(pass, user[0].pass, async (err, result) => {
                if (result == true) {
                    const token = jwt.sign({ userId: user[0]._id }, "imran", {
                        expiresIn: "10h",
                    });
                    fs.writeFileSync("token.txt", token);
                    res.clearCookie("tokn")
                    await res.cookie("tokn", token)
                    res.send({ msg: "Login successful", token: token, user });
                } else if (result === false) {
                    res.send({ msg: "Wrong password" });
                }
            })
        }
        else{
            res.send({msg:"Please signup first"})
        }
    } catch (error) {
        res.json({ "msg": "Login failed Error in try" })
        console.log(error);
    }
})


module.exports = { user_route }