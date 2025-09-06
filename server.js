require("dotenv").config();
const express = require("express");
const connectDB = require('./Config/dbConn');
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const corsOptions = require('./Config/corsOptions');
const app = express();
const PORT = process.env.PORT || 5000 ;


connectDB();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));
app.use("/", require ("./routes/root"));
app.use("/auth", require ("./routes/authRoutes"));
app.use("/users", require ("./routes/userRoutes"));


app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.status(404).json({ error: 'Not Found' });
    } else {
        res.status(404).type('txt').send('Not Found');
    }
});


mongoose.connection.once("open", ()=>{
    console.log('connect to DB');
    app.listen(PORT , () => {
    console.log(`server running on ${PORT}`);
    
});
});
mongoose.connection.on("error", (err)=> {
    console.log(err);
    
});