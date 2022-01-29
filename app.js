
require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const userRoutes = require("./Routes/user");
const mongoose = require("mongoose");
const {AppError, sendErrorDev, sendErrorProd, handleCastError, handleDuplicateError, handleValidationError} = require("./Models/error")
mongoose.connect(process.env.CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



app.use(express.json())

app.use("/api", userRoutes);






app.all("*", (req, res, next) => {

    next(new AppError(`${req.originalUrl}: This path does not exist`, 404));
})


app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if(process.env.NODE_ENV === "DEVELOPMENT"){
        sendErrorDev(err, res);
        console.log(err);
    }

    else if(process.env.NODE_ENV === "PRODUCTION"){
        
        let errors = { ...err };
        if(errors.name === 'CastError') {
            errors = handleCastError(errors);
        }

        if(errors.code === 11000) {
            errors = handleDuplicateError(errors);
        }

        if (errors.name === 'ValidationError') {
            errors = handleValidationError(errors);
        }
        sendErrorProd(errors, res);

    }
});




app.listen(PORT, (err) => {
    if(err){
        console.log(err);
    }else{
        console.log("Server is running");
    }
});