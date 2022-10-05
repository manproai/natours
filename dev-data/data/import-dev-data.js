const dotenv = require("dotenv").config()
const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../../models/tourModel");


const dbURI = process.env.MONGODB_ATLAS.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(process.env.DATABASE_LOCAL)
.then(()=> {
    console.log("DB Connection has been successfully established!");
    const data = JSON.parse(fs.readFileSync(__dirname+'/tours.json', 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(data);
        console.log("Successfully loaded the data")
    } catch (err) {
        console.log("Error while importing the data" + err);
    }
    process.exit();
}

const deleteData = async () => {
    try{
        await Tour.deleteMany()
        console.log("Deleted all the docs")
    } catch (err) {
        console.log("Error while deleting the data" + err);
    }
    process.exit();
}

if (process.argv[2]=="--import") {
    console.log(process.argv[0])
    console.log(process.argv[1])
    importData();
} else if (process.argv[2]=="--delete") {
    console.log(process.argv[0])
    console.log(process.argv[1])
    deleteData();
}
})
.catch(err => {
    console.log(err);
});

