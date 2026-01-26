import express from "express"
import ENV from "./lib/env.js";
import path from "path"

const app =  express ();

const ___dirname = path.resolve();

app.get ("/" , (req,res) => {
    res.status(200).json({msg: "main"})
});
app.get ("/health" , (req,res) => {
    res.status(200).json({msg: "health"})
});
app.get ("/box" , (req,res) => {
    res.status(200).json({msg: "success from backend"})
});



// If we are in Production

if(ENV.NODE_ENV==="production"){
    app.use(express.static(path.join(___dirname, "../frontend/dist")))

    app.get("/{*any}" , (req,res) =>{
        res.sendFile(path.join(___dirname, "../frontend" ,"dist" ,"index.html"))
    } )
}



app.listen(ENV.PORT, () => console.log("Server Is Running On Port:",ENV.PORT))