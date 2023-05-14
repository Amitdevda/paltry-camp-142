const express = require("express")
const jwt = require("jsonwebtoken")
const { UserModel } = require("../model/user.model")
const { BlacklistModel } = require("../model/block")
const { createClient } = require("redis");
const client = createClient("redis://default:pAZIQGIYzeoDcfPm3PKrPU0gmPWpMeQo@redis-11856.c301.ap-south-1-1.ec2.cloud.redislabs.com:11856")
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

const authenticate = async (req, res, next) => {
  console.log("Middleware")
  const token = await client.get('token')
  console.log(token)
  if (token) {
    const blocked = await BlacklistModel.find({ token })
    if (blocked.length > 0) {
      res.end("Your Logged out, Please login again")
    }

    jwt.verify(token, "imran", async (err, decoded) => {
      if (decoded) {
        // req.body.user = decoded.userId
        // req.user = await UserModel.find({ _id: decoded.userId })
        console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
        next()
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
      }
      else {
        res.send({ "msg": "Please login first" })
      }
    });

  }
  else {
    res.send({ "msg": "Please login first" })
    // res.status(400).send({ "msg": "Please login first" })
  }

}

module.exports = {
  authenticate
}