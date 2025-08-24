const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
        default: "India",
    },
    stateOrUT: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    landmark: {
        type: String,
        required: true,
    }
},
{
    timestamps: true,
},
);

const Tutor = mongoose.model("Tutor", tutorSchema);

module.exports = Tutor;