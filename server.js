const app = require("./app");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"));

const port = process.env.PORT || 3000;
app.listen(port, console.log(`Server is listening at ${port}`));
