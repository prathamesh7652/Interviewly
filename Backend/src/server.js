import express from "express"
import ENV from "./lib/env.js";

const app =  express ();


app.get ("/" , (req,res) => {
    res.status(200).json({msg: "success from backend"})
});


app.listen(ENV.PORT, () => console.log("Server Is Running On Port:",ENV.PORT))

