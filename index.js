const {initializeDatabase} = require("./db/db.connect");
// const fs = require("fs");
const Tutor = require("./models/tutor.models");
const express = require("express");

const app = express()
app.use(express.json());

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

initializeDatabase();

//---------------------------------------------------------------------------------------------------------
// const jsonData = fs.readFileSync("tutorsData1000.json", "utf-8");
// const tutorsData = JSON.parse(jsonData);
// // seed tutor database
// async function seedTutors() {
//     try {
//         for (const tutorData of tutorsData) {
//             const newTutor = new Tutor({
//                 name: tutorData.name,
//                 phoneNumber: tutorData.phoneNumber,
//                 country: tutorData.country,
//                 stateOrUT: tutorData.stateOrUT,
//                 district: tutorData.district,
//                 pincode: tutorData.pincode,
//                 landmark: tutorData.landmark
//             });
//             await newTutor.save();
//         }
//         console.log("Tutor collection seeded successfully.");
//     } catch (error) {
//         throw error;
//     }
// }
// seedTutors()
//---------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------
// home route
app.get("/", async (req, res) => {
    try {
        res
            .status(200)
            .send("This is tutor directory backend api.");
    } catch (error) {
        res
            .status(500)
            .json({error: "Failed to load data!"})
    }
})
//---------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------
// get a tutor list by query data
async function readTutorByAddress(queryData) {
    try {       
        const tutors = await Tutor.find(queryData);
        return tutors;
    } catch (error) {
        throw error;
    }
}

app.get("/api/tutors", async (req, res) => {

    try {
        const queryObj = {};
        if (req.query.country && req.query.stateOrUT && req.query.district) {
            queryObj.country = req.query.country;
            queryObj.stateOrUT = req.query.stateOrUT;
            queryObj.district = req.query.district;
        } else {
            res.status(400).json({error: "All fields are required!"})
            return;
        }
        // console.log("queryObj:", queryObj)
        const tutors = await readTutorByAddress(queryObj);
        if (tutors) {
            res
                .status(200)
                .send(tutors)
        } else {
            res
                .status(404)
                .json({error: "Data Not Found!"})
        }
    } catch (error) {
        res
            .status(500)
            .json({error: "Failed to load data!"})
    }
})
//---------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------
// add a new tutor in the tutors collection
async function addNewTutor(tutorData) {
    try {
        const newTutor = new Tutor(tutorData);
        const savedTutor = await newTutor.save();
        return savedTutor
    } catch (error) {
        throw error;
    }
}

app.post("/api/tutors", async (req, res) => {
    try {
        const savedTutor = await addNewTutor(req.body);
        if (savedTutor) {
            res
                .status(200)
                .send(savedTutor)
        } else {
            res
                .status(400)
                .json({error: "All fields are required!"})
        }
    } catch (error) {
        res
            .status(500)
            .json({error: "Failed to create data!"})
    }
})
//---------------------------------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
})
//---------------------------------------------------------------------------------------------------------