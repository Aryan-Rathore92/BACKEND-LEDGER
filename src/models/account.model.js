const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true // This is use for fast searching in db
    },
    status:{
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN and CLOSED"
        }
    },
    currency:{
        type: "String",
        required: [true, "Currency is required for creating an account"],
        default: "INR"
    }
},
{
    timestamps: true
}
);

accountSchema.index({ user: 1, status: 1}); // This access two fields that is why this is called Compound index

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;