import { initializeDatabase } from "./db/db.connect.js";
// import fs from "fs";
import Tutor from "./models/tutor.models.js";
import express from "express";
import axios from "axios";

const app = express()
app.use(express.json());

import cors from "cors";
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

initializeDatabase();

//---------------------------------------------------------------------------------------------------------
// oauth
app.get("/auth/github", (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`;
    res.redirect(githubAuthUrl);
})

app.get("/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send("Authorization code not provided.");
    }
    try {
        const tokenResponse = await axios.post(`https://github.com/login/oauth/access_token`, {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: {
                Accept: "application/json"
            }
        }
    );

        const accessToken = tokenResponse.data.access_token;
        res.cookie("access_token", accessToken);
        return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/github`);

    } catch (error) {
        res.status(500).json({error});
    }
})

app.get("/auth/google", (req, res) => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}:${process.env.PORT}/auth/google/callback&response_type=code&scope=profile email`;
    res.redirect(googleAuthUrl);
})

app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send("Authorization code not provided.");
    }
    let accessToken;
    try {
        const tokenResponse = await axios.post(`https://oauth2.googleapis.com/token`, {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${process.env.BACKEND_URL}:${PORT}/auth/google/callback`,
        },{
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        accessToken = tokenResponse.data.access_token;
        res.cookie("access_token", accessToken);
        return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/google`);

    } catch (error) {
        res.status(500).json({error})
    }
})


//---------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------
// const jsonData = fs.readFileSync("tutors.json", "utf-8");
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