import { Schema, model } from "mongoose";

const tutorSchema = new Schema({
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

const Tutor = model("Tutor", tutorSchema);

export default Tutor;