// generateTutorsWithPincodes.js
// Node 18+ recommended

import fs from "fs";
import path from "path";
import { districtsByStates } from "./districtsByStates.js"; // your districts array

// ---------- Config ----------
const PINCODE_DB_URL =
  "https://raw.githubusercontent.com/deep5050/indian-pincodes-database/master/data.json";
const LOCAL_PINCODE_FILE = path.resolve("./pincodes.json");
const OUTPUT_FILE = path.resolve("./tutors.json");

// ---------- Name pools (use your expanded pools or replace them) ----------
const indianFirstNames = {
  North: [
    "Amit","Ravi","Neha","Priya","Suresh","Sunita","Anil","Pooja","Rajesh","Kiran",
    "Vikas","Jyoti","Deepak","Reena","Manish","Sakshi","Ajay","Kirti","Mahesh","Anita",
    "Dinesh","Ruchi","Rakesh","Nisha","Tarun","Shalini"
  ],
  South: [
    "Arun","Divya","Venkatesh","Lakshmi","Sridhar","Kavya","Manoj","Meena","Ramesh","Deepa",
    "Harish","Priya","Shiva","Revathi","Vivek","Anusha","Karthik","Sandhya","Ravi","Aishwarya",
    "Ganesh","Sneha","Mahesh","Soumya"
  ],
  East: [
    "Ankita","Rupam","Subham","Mitali","Sanjay","Suman","Prakash","Rekha","Nirmal","Bijoy",
    "Tapas","Rina","Soumya","Rohit","Puja","Nabina","Koushik","Manisha","Alok","Gita",
    "Satyajit","Pratima","Debasish","Sumitra"
  ],
  West: [
    "Nisha","Vivek","Rahul","Sneha","Ketan","Bhavna","Devendra","Komal","Jignesh","Payal",
    "Raj","Kiran","Mitali","Rohit","Seema","Nirav","Meghna","Darshan","Heena","Chirag",
    "Dimple","Harsha","Manoj","Rupal"
  ]
};

const indianLastNames = {
  North: [
    "Singh","Sharma","Verma","Gupta","Chaudhary","Yadav","Bansal","Rana","Thakur","Goel",
    "Tiwari","Pathak","Mehra","Malhotra","Saini"
  ],
  South: [
    "Reddy","Iyer","Pillai","Naidu","Menon","Shetty","Krishnan","Murthy","Gowda","Subramaniam",
    "Raman","Kumar","Raj","Venkat","Narayan"
  ],
  East: [
    "Das","Sarkar","Ghosh","Mishra","Chakraborty","Patra","Borah","Roy","Dutta","Sinha",
    "Nayak","Behera","Mondal","Pradhan","Hazarika"
  ],
  West: [
    "Patel","Desai","Joshi","Shah","Mehta","Chavan","Pawar","More","Naik","Jadhav",
    "Gavaskar","Bhonsle","Shinde","Kulkarni","Ambani"
  ]
};

const landmarks = [
  "Near Market","Opposite Bus Stand","Beside School","Near Temple",
  "Behind Police Station","Next to Hospital","Near Railway Station",
  "Opposite Mall","Near Post Office","Close to Main Road",
  "Beside Community Hall","Behind Cinema Hall","Next to Bank","Near Park",
  "Close to Library","Opposite Petrol Pump","Near University","Behind Fire Station",
  "Next to Stadium","Close to Metro Station"
];

// ---------- Utility ----------
function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getRegionByState(state) {
  const north = ["Delhi","Haryana","Punjab","Uttar Pradesh","Uttarakhand","Himachal Pradesh","Jammu and Kashmir","Ladakh","Chandigarh","Himachal Pradesh"];
  const south = ["Kerala","Karnataka","Tamil Nadu","Andhra Pradesh","Telangana","Puducherry"];
  const east = ["Bihar","Odisha","West Bengal","Assam","Meghalaya","Tripura","Manipur","Arunachal Pradesh","Nagaland"];
  const west = ["Maharashtra","Goa","Gujarat","Rajasthan","Madhya Pradesh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu"];
  if (north.includes(state)) return "North";
  if (south.includes(state)) return "South";
  if (east.includes(state)) return "East";
  if (west.includes(state)) return "West";
  return "North";
}

function generatePhoneNumber(region) {
  const prefixes = { North: ["9","8"], South: ["7","9"], East: ["6","7","9"], West: ["8","9"] };
  let number = getRandom(prefixes[region]);
  for (let i = 0; i < 9; i++) number += Math.floor(Math.random()*10);
  return Number(number);
}

// ---------- Pincode DB helpers ----------

/**
 * Ensure we have pincode data locally.
 * If LOCAL_PINCODE_FILE exists, load it.
 * Otherwise fetch from PINCODE_DB_URL and save it locally.
 * The dataset entries are expected to have at least:
 *   { "PostOfficeName": "...", "Pincode": "226001", "City": "...", "District": "...", "State": "..." }
 */
async function loadOrFetchPincodeDB() {
  if (fs.existsSync(LOCAL_PINCODE_FILE)) {
    const raw = fs.readFileSync(LOCAL_PINCODE_FILE, "utf-8");
    return JSON.parse(raw);
  }

  console.log("Downloading pincode DB from remote source...");
  // Node 18+ has fetch. If not available, user should install node-fetch and uncomment import.
  const res = await fetch(PINCODE_DB_URL);
  if (!res.ok) throw new Error(`Failed to download pincodes DB: ${res.status} ${res.statusText}`);
  const json = await res.json();

  fs.writeFileSync(LOCAL_PINCODE_FILE, JSON.stringify(json, null, 2), "utf-8");
  console.log(`Saved pincodes DB to ${LOCAL_PINCODE_FILE}`);
  return json;
}

/**
 * Given a district name and state name, attempt to return a realistic pincode (number).
 * Strategy:
 *  - find all entries whose District matches district (case-insensitive substring)
 *  - if none, find entries with matching State and pick the most common pincode there
 *  - fallback: return null (caller may use a random pincode)
 */
function findPincodeForDistrict(pincodeDB, state, district) {
  if (!pincodeDB || !Array.isArray(pincodeDB)) return null;

  const districtNorm = (district || "").toLowerCase().trim();
  const stateNorm = (state || "").toLowerCase().trim();

  // collect pincodes where District contains the district string
  const matches = pincodeDB.filter(entry => {
    if (!entry.District && !entry.City && !entry.State) return false;
    const d = (entry.District || entry.City || "").toLowerCase();
    const s = (entry.State || "").toLowerCase();
    return d.includes(districtNorm) && s.includes(stateNorm);
  });

  if (matches.length > 0) {
    // pick the most frequent pincode among matches (or random)
    const freq = {};
    for (const m of matches) {
      const pc = String(m.Pincode).trim();
      if (!pc) continue;
      freq[pc] = (freq[pc] || 0) + 1;
    }
    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
    if (sorted.length > 0) return Number(sorted[0][0]);
    return Number(matches[0].Pincode);
  }

  // fallback: find by state
  const byState = pincodeDB.filter(entry => ((entry.State || "").toLowerCase().includes(stateNorm)));
  if (byState.length > 0) {
    // return a random pincode from the state
    const pc = getRandom(byState).Pincode;
    return Number(pc);
  }

  // final fallback: null
  return null;
}

// ---------- Main generator ----------

async function main() {
  try {
    const pincodeDB = await loadOrFetchPincodeDB();

    const tutors = [];

    for (const { state, districts } of districtsByStates) {
      const region = getRegionByState(state);

      for (const district of districts) {
        // pick a representative pincode for this district once
        const districtPincode = findPincodeForDistrict(pincodeDB, state, district) || Math.floor(100000 + Math.random() * 700000);

        for (let i = 0; i < 3; i++) { // 3 tutors per district by your script
          const first = getRandom(indianFirstNames[region]);
          const last = getRandom(indianLastNames[region]);
          const tutor = {
            name: `${first} ${last}`,
            phoneNumber: generatePhoneNumber(region),
            country: "India",
            stateOrUT: state,
            district,
            pincode: districtPincode,
            landmark: getRandom(landmarks)
          };
          tutors.push(tutor);
        }
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tutors, null, 2), "utf-8");
    console.log(`✅ Generated ${tutors.length} tutors and wrote to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("Error:", err);
  }
}

// main();
