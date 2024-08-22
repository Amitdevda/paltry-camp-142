const express = require("express")
const jwt = require("jsonwebtoken")
const { UserModel } = require("../model/user.model")
var cookieParser = require('cookie-parser')
const { BlacklistModel } = require("../model/block")
const fs = require("fs")
const app= express()
app.use(cookieParser())
const cors = require("cors")
app.use(cors({
    origin: "*"
}))

const authenticate = async (req, res, next) => {
  let token = fs.readFileSync('./token.txt',
    { encoding: 'utf8'});
 console.log("middleware", token)
  if (token) {
    const blocked = await BlacklistModel.find({ token })
    if (blocked.length > 0) {
      res.end("Your Logged out, Please login again")
    }
    jwt.verify(token, "imran", async (err, decoded) => {
      if (decoded) {
        next()
      }
      else {
        res.send({ "msg": "Please login first" })
      }
    });
  }
  else {
    res.send({ "msg": "Please login first" })
  }
}

module.exports = {
  authenticate
}