const userModel = require('../models/user.model');


/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res){
           
    const {username, email, password} = req.body;
}

module.exports = {userRegisterController};