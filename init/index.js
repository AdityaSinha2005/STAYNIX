require("dotenv").config();
const mongoose=require("mongoose");
const initdata =require("./data.js");
const listing=require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL;

main().then(() =>{
    console.log("connected to MongoDB");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({
        ...obj, owner: "6a0c382c2044f32c0b4271fb"})); // Assign a user ID
    await listing.insertMany(initdata.data);
    console.log("Data was initialised");
};

initDB();