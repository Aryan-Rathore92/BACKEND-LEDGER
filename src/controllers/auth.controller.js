const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');


/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res){
           
    const {name, email, password} = req.body;

    const isExists = await userModel.findOne({
        email: email
    })

    if(isExists){
        return res.status(422).json({
            message: "User already exists with email",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, password, name
    })

    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d"});

    res.cookie("token", token);

    res.status(201).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name,
        },
        token
    })

    await emailService.sendRegistrationEmail(user.email, user.name); // This use for send a mail of user
}

/**
* - User Login Controller
* - POST /api/auth/login
*/
async function userLoginController(req, res){

      const {email, password} = req.body;
      
      const user = await userModel.findOne({ email }).select("+password");

      if(!user){
        return res.status(401).json({
            message: "Email and password is Invalid"
        })
      }

      const isValidPassword = await user.comparePassword(password);// This for comapre password and comparePassword method is already written in user.model.js

      if(!isValidPassword){
        return res.status(401).json({
            message: "Email and password is Invalid"
        })
      }
      
      const token = await jwt.sign({ userId: user._id}, process.env.JWT_SECRET, { expiresIn: "3d"});

      res.cookie("token", token);

        res.status(200).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name,
        },
        token
    })
}

module.exports = {userRegisterController, userLoginController};