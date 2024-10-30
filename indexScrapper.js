import express from 'express' 
import axios from 'axios'
import fs from 'fs'
import bodyParser from "body-parser";
import puppeteer from 'puppeteer' 

console.log("App Started")

const app = express();
const PORT = 3000;

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  // ...
];

const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

const headers = {
    'User-Agent': userAgent,
    'Referer': 'https://google.com',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Requested-With': 'XMLHttpRequest',
  };

let proxys = [
        {protocol: 'http',
        host: '162.223.90.130',//works
        port: 80},
        {protocol: 'http',
        host: '45.92.177.60',
        port: 8080},
        {protocol: 'http',
        host: '185.105.91.62',//works
        port: 4444},
        {protocol: 'http',
        host: '198.44.255.3',
        port: 80},
        {protocol: 'http',
        host: '51.89.255.67',
        port: 80},    
    ]

    
  
const proxy = proxys[Math.floor(Math.random() * proxys.length)];

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

let quote = ""
let numberOfQuote;
let quotesDB = [];

function createRequest1(index) {
    numberOfQuote=index
    console.log("from create request1",numberOfQuote)
    //let url = 'https://bashforever.com/?quote=' + numberOfQuote
    let url = 'https://bash-org-archive.com/?' + numberOfQuote
    //const request = axios.get(url, {headers: headers, proxy: proxy})
    const request = axios.get(url, {headers: headers})
    

  //request
  //.then(result => quote = result.data/*console.log('(1) Inside result:', result.data)*/)
  //.catch(error => console.error('(1) Inside error:', error))

  return request
}

function processResolt(result) {
    quote = ""
    let data = result
    let init = "<a href='?"
    let fin = "<div id='footer'>"
    if (data.length > 2640 &! data.includes("<span class='neg'>")){
        let enableInitTest = true;
        let enableFinTest = false;
        let initIndex = 0
        let finIndex = 0
        for (let i = 1650; i < data.length-900; i++) {
            let initTest;
            let finTest;
            if (data[i] === "<" && (enableFinTest === true || enableInitTest === true)) {
                if (enableInitTest === true) {
                    initTest = data[i]+data[i+1]+data[i+2]+data[i+3]+data[i+4]+data[i+5]+data[i+6]+data[i+7]+data[i+8]+data[i+9];
                    if (initTest === init) {
                        //console.log("init found at index:",i)
                        enableFinTest = true
                        enableInitTest = false
                        initIndex = i
                    }
                }
                if (enableFinTest === true) {
                    finTest = data[i]+data[i+1]+data[i+2]+data[i+3]+data[i+4]+data[i+5]+data[i+6]+data[i+7]+data[i+8]+data[i+9]+data[i+10]+data[i+11]+data[i+12]+data[i+13]+data[i+14]+data[i+15]+data[i+16];
                    if (finTest === fin) {
                        //console.log("fin found at index:",i)
                        enableFinTest = false
                        enableInitTest = false
                        finIndex = i
                    }
                }
            }
            //console.log(finIndex,initIndex)
            if (initIndex !== 0 && finIndex === 0) {
                if (data[i] !== " "){
                    quote = quote + data[i]
                }
                else if (data[i] === " " && data[i-1] !== " ") {
                    quote = quote + data[i]
                }

            }
        }
        quote = quote.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ")
        //console.log(quote)
        quote = quote.replaceAll("<br/>", "\n")
        quote = quote.replaceAll("<div class='quoteYear'>Estimated quote year: ", "\n")
        quote = quote.replaceAll(" </div> </p> </div> </div>", "")
        //quote = quote.replaceAll("&lt;", "<")
        //quote = quote.replaceAll("&gt;", ">")
        quote = quote.replaceAll("</span> </div> ", "\n")
        quote = quote.replaceAll("</a> <span class='pos'>", "+")
        quote = quote.replace(numberOfQuote, "")
        quote = quote.replace(numberOfQuote, "")
        quote = quote.replace("<a href='?'>#", "")
        console.log("**************************************")
        let rating;
        let year;
        let tempQuote;
        rating = quote.slice(1, quote.indexOf("\n"));
        year = quote.at(-4)+quote.at(-3)+quote.at(-2)+quote.at(-1)

        quote = quote.substring(quote.indexOf("\n") + 1) //remove first line(rating)
        quote = quote.substring(quote.lastIndexOf("\n") + 0, -1 )//remove last line(year)

        console.log("Rating:", rating,"\nQuote:",quote,"\nYear:",year)
        console.log("**************************************")
        return {"rating:":rating,"quote:":quote, "year:":year}
    }
    else {
        console.log("**************")       
        console.log("No Quote at",numberOfQuote)
        console.log("**************")       

    }
}
/*createRequest1()
.then(result => console.log('(1) Outside result:',quote, result.data))
.catch(error => console.error('(1) Outside error:', error))*/

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function processItems2() {
    for (let index = 200010; index < 201000; index++) {
        await createRequest1(index).then(result => processResolt(result.data)).then((data) => {
            if (data !== undefined) {
                quotesDB.push(data)
            }
        })

        //const randomDelay = Math.floor(Math.random() * 3000) + 1000; // between 1s and 3s
        const randomDelay = Math.floor(Math.random() * 5000) + 3000;

        await delay(randomDelay);
    }
    console.log('All items processed');
    return JSON.stringify(quotesDB)
}



processItems2().then((data) => {

fs.writeFileSync("sample.txt", data , {encoding:'utf8',flag:'w'}, function (err) {
  		if (err) {
		    return console.error(err);
	  	}
	});

})

/* for testing purposes of headers/proxies 
axios({

   method: 'GET',

   url: 'https://httpbin.org/get', headers: headers, proxy: proxy,

}).then(response => {

   console.log("headers response:", response.data)

});*/