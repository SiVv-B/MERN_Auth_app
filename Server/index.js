const express = require ('express')
const mongoose =require("mongoose")
const userRouter = require("./routes/userRoutes")
const cookieParser = require('cookie-parser')
const cors = require('cors')
require ('dotenv').config()
const app = express()
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/api', userRouter)
 


mongoose.connect(`mongodb+srv://siwar:${process.env.MONGODB_PASSWORD}@cluster0.x5fxfzt.mongodb.net/mern-auth-app?retryWrites=true&w=majority`).then(()=>{
    app.listen(5100)
    console.log('Database is connected & listening to localhost 5100')
}).catch((err)=>console.log('error connection or localhost:',err))
   



