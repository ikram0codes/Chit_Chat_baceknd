const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URI, {
        dbName: "CHITCHAT",
      })
      .then(() => {
        console.log("Data Base Connected");
      });
  } catch (error) {
    console.log("Data base Error:" + " " + error);
  }
};

module.exports = dbConnect;
