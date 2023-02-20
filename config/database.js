const mongoose = require("mongoose");

const connectionString = `mongodb+srv://ecommerce:${process.env.PASS}@cluster0.fme6k.mongodb.net/ecommerce?retryWrites=true&w=majority`;
const connectDB = () => {
    mongoose
        .connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then((data) => {
            console.log(
                `Mongodb connected with server: ${data.connection.host}`
            );
        })
        .catch((error) => {
            console.log("Error", error);
        });
};
module.exports = connectDB;
