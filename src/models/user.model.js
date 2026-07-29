const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema(
    {
    email:{
        type: String,
        required: [true, "Email is required for creating a user"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"],
        unique: [true, "Email already exists"]
    },
    name:{
        type: String,
        required: [true, "Name is required for creating an account"]
    },
    password:{
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password must contain more than 6 characters"],
        select: false // This method password automatic selection stoping, if we want to get password then query is need
    },
    systemUser:{
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    }
},
{
    timestamps: true // This give creating and last updating time of data/user
}
)

userSchema.pre("save", async function (){ // pre("save") is a Mongoose middleware (hook). It runs before a document is saved to the database.

    if(!this.isModified("password")){ // Here if password is not change then it call next() and this keyword refer to the creating current document
        // return next();
    }

    const hash = await bcrypt.hash(this.password, 10); // plaintext ---hashing---> hash
    this.password = hash;

    // return next();
})

userSchema.methods.comparePassword = async function (password){
       return   await bcrypt.compare(password, this.password); // Doing compare current entering and database saved password
}

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;