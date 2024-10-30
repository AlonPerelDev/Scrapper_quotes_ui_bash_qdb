import express from 'express' 
import axios from 'axios'
import fs from 'fs'
import bodyParser from "body-parser";

console.log("App Started")

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.listen(PORT, (error) =>{
    if(!error) {
        console.log("Server status: Running")
        console.log("Listening on port: ", PORT)
    }

    else 
        console.log("Error occurred, server can't start", error);
    }
);

let qdb = JSON.parse(fs.readFileSync("1-200k v2.txt", 'utf8' ))
let q = "quote:"
let y = "year:"
let r = "rating:"
let r500;
let r1000;
let r2000;
let r3000;
let r4000;
let r5000;
let r6000;
let r7000;
let r8000;
let r9000;
let indexesOfRatings = []

qdb = qdb.sort((a, b) => {
  if (parseInt(a[r]) < parseInt(b[r])) {
    return -1;
  }
});

for (let index = 0; index < qdb.length; index++) {
    const element = qdb[index];
    const elementR = element[r]
    if (parseInt(elementR) >= 500 && r500 === undefined) {r500 = index}
    if (parseInt(elementR) >= 1000 && r1000 === undefined) {r1000 = index}
    if (parseInt(elementR) >= 2000 && r2000 === undefined) {r2000 = index}
    if (parseInt(elementR) >= 3000 && r3000 === undefined) {r3000 = index}
    if (parseInt(elementR) >= 4000 && r4000 === undefined) {r4000 = index}
    if (parseInt(elementR) >= 5000 && r5000 === undefined) {r5000 = index}
    if (parseInt(elementR) >= 6000 && r6000 === undefined) {r6000 = index}
    if (parseInt(elementR) >= 7000 && r7000 === undefined) {r7000 = index}
    if (parseInt(elementR) >= 8000 && r8000 === undefined) {r8000 = index}
    if (parseInt(elementR) >= 9000 && r9000 === undefined) {r9000 = index}
}

indexesOfRatings.push({"0":0, "500":r500, "1000":r1000, "2000":r2000, "3000":r3000, "4000":r4000, "5000":r5000, "6000":r6000, "7000":r7000, "8000":r8000, "9000":r9000, "9999":qdb.length-1})
let indexRatings = [0,500,1000,2000,3000,4000,5000,6000,7000,8000,9000,9999]
console.log(indexesOfRatings)


app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "Click stuff..." });
});

function getRandomInt() {
  console.log("using the following guidelines:",indexesOfRatings[0][lowerIndex],indexesOfRatings[0][upperIndex])
  const minCeiled = Math.ceil(parseInt(indexesOfRatings[0][lowerIndex]));
  const maxFloored = Math.floor(parseInt(indexesOfRatings[0][upperIndex]));
  console.log("returning a number like this more or less:",Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled))
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

let lowerIndex = 0;
let upperIndex = 9999;
let quotesToSend = [];
let singleQuote = [];
let result = [];

app.post("/get-secret", async (req, res) => {
  result = [];
  singleQuote = [];
  quotesToSend = [];

  if (req.body.randomQuote === "yesPlease") {
    lowerIndex = 0
    upperIndex = 9999

    if (req.body.scoreMin > 0) {
      for (let index = 1; index < indexRatings.length ; index++) {
        const element = indexRatings[index];
        lowerIndex = req.body.scoreMin > element ? indexRatings[index] : lowerIndex
      }
      console.log("lowerIndex:",lowerIndex)
    }
    if (req.body.scoreMax < 9999) {
      for (let index = 0; index < indexRatings.length ; index++) {
        const element = indexRatings[index];
        upperIndex = req.body.scoreMax >= element ? indexRatings[index] : upperIndex
      }
      console.log("upperIndex:",upperIndex)
    }
    console.log(indexesOfRatings[0][lowerIndex],indexesOfRatings[0][upperIndex])

    for (let index = 0; index < req.body.amountOfQuotes; index++) {
      quotesToSend.push(qdb[getRandomInt()])
      console.log("pushing quote #",index, "quote is:",quotesToSend)
    }
  }
  else {
    singleQuote = qdb[req.body.id];
    console.log("we've reached single quote",singleQuote)
  }


  if (req.body.randomQuote !== "yesPlease") {
    result = singleQuote
    console.log("relegating single quote -> result",singleQuote)
  }
  else {
    result = quotesToSend
    console.log("relegating multiple quotes -> result",result)

  }


  try {
    //res.render("index.ejs", { content: JSON.stringify(result) });
    res.render("index.ejs", { content: result });
  }
  catch (error) {
    console.log("error zone")
    res.render("index.ejs", { content: "error" });
  }
});