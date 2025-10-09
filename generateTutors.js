import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 👇 Replace with your actual districtsByStates array
import { districtsByStates } from "./districtsByStates.js";

// Utility to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions for fake data
const indianNames = [
  "Aarav Sharma", "Diya Mehta", "Rajesh Kumar", "Shalini Roy", "Meera Iyer",
  "Vikram Patel", "Sanjana Das", "Arjun Singh", "Riya Gupta", "Ananya Joshi",
  "Harshit Verma", "Neha Reddy", "Manish Tiwari", "Sneha Nair", "Rohit Bansal"
];

const landmarks = [
  "Near Bus Stand", "Opposite Railway Station", "Behind Market",
  "Near School", "Temple Road", "Next to Hospital", "Beside Park", "Main Bazaar"
];

// Random generators
const getRandomName = () => indianNames[Math.floor(Math.random() * indianNames.length)];
const getRandomPhone = () => Math.floor(7000000000 + Math.random() * 999999999);
const getRandomPincode = () => Math.floor(100000 + Math.random() * 899999);
const getRandomLandmark = () => landmarks[Math.floor(Math.random() * landmarks.length)];

// Generate tutors data
const tutors = [];

districtsByStates.forEach(({ state, districts }) => {
  districts.forEach((district) => {
    for (let i = 0; i < 3; i++) {
      tutors.push({
        name: getRandomName(),
        phoneNumber: getRandomPhone(),
        country: "India",
        stateOrUT: state,
        district: district,
        pincode: getRandomPincode(),
        landmark: getRandomLandmark(),
      });
    }
  });
});

// Save to JSON file
const outputPath = path.join(__dirname, "tutors.json");
fs.writeFileSync(outputPath, JSON.stringify(tutors, null, 2));

console.log(`✅ Generated ${tutors.length} tutors and saved to tutors.json`);
