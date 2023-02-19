const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(cors());
const errorMiddleware = require("./middleware/error");
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload());

if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "config/config.env" });
}
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");

connectDatabase();
const PORT = process.env.PORT || 3000;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
app.use("/", (req, res) => {
    res.json({
        message: "Helloe from express",
    });
});
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

// Middleware
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is runnig on port number http://localhost:${PORT}`);
});

module.exports = app;
