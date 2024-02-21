const app = require("./app");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Database connection
connectDatabase();

// const PORT = process.env.PORT || 3000;
const PORT = 3001;
app.use("/", (req, res) => {
  res.json({
    message: "Backend  is up.",
  });
});
app.listen(PORT, () => {
  console.log(`Server is runnig on port number http://localhost:${PORT}`);
});
