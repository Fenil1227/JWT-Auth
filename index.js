const express = require("express");
const auth = require("./routes/auth")
const post = require("./routes/post")
const app = express();

app.use(express.json());

app.use("/auth", auth);
app.use("/posts", post);

app.get("/", (req, res) => {
    res.send("Hii i am fenil")
})

app.listen(5000, () => {
    console.log("Running on port 5000")
})