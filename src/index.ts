import express, { Application } from "express";
import dotenv from "dotenv"
import { router } from "@routes";
dotenv.config()
import "./config/passport"
import session from "express-session"
import passport from "passport";
import { ErrorHandlerMiddleware } from "@middlewares";

const app:Application = express()
app.use(express.json())

app.use(session({
    secret:process.env.MY_SECRET_KEY || "anything_first",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/v1",router)
app.use("/*",ErrorHandlerMiddleware.errorHandlerMiddleware)

let PORT =  process.env.APPLiCATION_PORT || 7000


app.listen(PORT , ()=>{
    console.log(`Server running on port ${PORT}`)})