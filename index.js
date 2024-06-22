const app = require("./app");
const dbConnect = require("./utils/database");

//Database
dbConnect();

//Starting Server
let server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port:${process.env.PORT}`);
});

//Unhandeled Exception Error
process.on("uncaughtException", function (error) {
  console.log(`Error:${error.message}`);
  console.log("Shutting Server Due to Unhandeled Exception");

  server.close(() => {
    process.exit(1);
  });
});

//Handling Unhandeled Promise Rejection
process.on("unhandledRejection", function (error) {
  console.log(`ERROR:${error.message}`);
  console.log("Shutting Server due to unhandeled promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});
