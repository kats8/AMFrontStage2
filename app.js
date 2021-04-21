//allows path manipulation cross-platform
//const path = require("path");
const MongoClient = require('mongodb').MongoClient;
var express = require("express");
var bodyParser = require("body-parser");
const uri = "mongodb+srv://Angler_User:89CL735AU@sit725.63pic.mongodb.net/AM_Fish?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
//variable used for MongoDB collection of fish and regulations
let fishes;
client.connect(err => {
  fishes = client.db("AM_Fish").collection("FishRegs");
  console.log("Connected to database");
  //    client.close();
});

const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const vrKey = 'nldt-7z9STbvStrJW26QC6fimSW-8puxcT1ZGuF-uQc7';

const visualRecognition = new VisualRecognitionV3({
  version: '2021-03-02',
  authenticator: new IamAuthenticator({
    apikey: vrKey,
  }),
  serviceUrl: 'https://api.us-south.visual-recognition.watson.cloud.ibm.com/instances/9158b148-831f-4191-8a16-55056c16874b',
});


const app = express();

//to allow use of POST
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

//basic test to check functioning
app.get("/displayHello", function (request, response) {
  var user_name = request.query.name;
  response.json("Hello " + user_name + "!");
});

//VISUAL RECOGNITION 

function analyseImage(requestURL, response) {
  const vrParams = {
    url: requestURL,
    threshold: 0.6,
  };

  visualRecognition.classify(vrParams)
    .then(VRresponse => {
      var imageResults = VRresponse.result;
      console.log(JSON.stringify(imageResults.images[0].classifiers[0].classes, null, 1));
      // response.send(JSON.stringify({ body: imageResults.images[0].classifiers[0].classes[0].class }))
      response.send(JSON.stringify({ body: imageResults.images[0].classifiers[0].classes }));
    })
    .catch(err => {
      console.log('error:', err);
    });
  //response.send(JSON.stringify(response.result.images[0].classifiers[0].classes[0].class));
}

app.get("/classifyURL", function (request, response) {
  analyseImage(request.query.url, response);
});


//DATABASE MANAGEMENT


//const uri = "mongodb+srv://Angler_User:89CL735AU@sit725.63pic.mongodb.net/AM_Fish?retryWrites=true&w=majority";
//const client = new MongoClient(uri, {useUnifiedTopology: true, useNewUrlParser: true});

//**************&&&&&&&&&&&&&&&&&&&&********************** */
//Do I need this? It's not coming from the client. It's been worked out on the server
app.get("/getFishInfo", function (request, response) {
  let fishID = request.query.fish;
  returnInfo(fishID, response);
});

app.get("/checkFishMatch", function (request, response) {
  let objectsFound = request.query.body;
  console.log("this is objects Found in checkFishMatch " + objectsFound);
  checkForFish(objectsFound, response);
});

/*
function returnInfo(fishes, res) {
const uri = "mongodb+srv://Angler_User:89CL735AU@sit725.63pic.mongodb.net/AM_Fish?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useUnifiedTopology: true, useNewUrlParser: true});
 

async function run() {
  try {
    await client.connect();
    console.log("Connected to server");
    //const db = client.db("project");
    let fishTable = client.db("AM_Fish");

   fishTable.collection("FishRegs").find().sort({ Fish: 1 }).limit(10).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      res.send(JSON.stringify(result));
    });

  } catch (err) {
    console.log(err.stack);
  }
  finally {
    await client.close();
  }
}

run().catch(console.dir);
}*/
/*
const uri = "mongodb+srv://Angler_User:89CL735AU@sit725.63pic.mongodb.net/AM_Fish?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
let fishes;
client.connect(err => {
  fishes = client.db("AM_Fish").collection("FishRegs");
  console.log("Connected to database");
  //    client.close();
});
*/
//function to check a single image 'class' name to see if it matches a fish
function returnInfo(fishName, response) {
  let fishData = null;
  // fishes.createIndex({fish:-1}, { collation: { locale: 'en', strength: 2 } } );
  fishes.find().forEach(function (fishes) {

    if (fishes.fish.toLowerCase() == fishName.toLowerCase()) {
      fishData = {
        fish: fishes.fish,
        noxious: fishes.noxious,
        protected: fishes.protected,
        info: fishes.info
      }

      console.log(fishData);
      response.send(JSON.stringify(fishData));

    }
    //  if (err) throw err;
  })

}
//function takes array of classes (identified class/item names) and scores, and checks for match with fish DB
function checkForFish(idfdObjectArray, response) {
  //tracks if a match was found
  let fishMatch = false;
  //tracks score of best match so far
  let score = 0;
  let fishData = { fishMatch: fishMatch };
  //let objectArray = JSON.parse(idfdObjectArray);
  let objectArray = idfdObjectArray;
  console.log(idfdObjectArray);

  try {
    console.log("Checking database");
    fishes = client.db("AM_Fish").collection("FishRegs");
    //checkForFish(classesFound);
    objectArray.forEach((idfdObject) => {
      //check the fishRegulations database for a match of fish type 
      fishes.find().forEach(function (fishes) {
        //***** */
        console.log("I'm in here");
        //if a match is found, check if it scores better than current match score, if so, replace data (better match).
        if (fishes.fish.toLowerCase() == (idfdObject.class).toLowerCase()) {
          fishMatch = true;
          if (idfdObject.score > score) {
            fishData = {
              fish: fishes.fish,
              noxious: fishes.noxious,
              protected: fishes.protected,
              info: fishes.info,
              score: score,
              fishMatch: fishMatch
            }
            console.log("found a matcg");
            console.log(fishData);

          }

        }
      })
    })
    console.log(fishData);
    // response.send(JSON.stringify(fishData));
    response.send(JSON.stringify(fishData));


  } catch (e) {
    console.error(e);

  }


}
//testing - previously worked
function returnInfo1(fishName, response) {
  // fishes.createIndex({fish:-1}, { collation: { locale: 'en', strength: 2 } } );
  fishes.find({ fish: fishName }, { fish: 1, info: 1, noxious: 1, protected: 1, _id: 0 }).toArray(function (err, result) {

    //  fishes.find({ fish: fishName }, { fish: 1, info: 1, noxious: 1, protected: 1, _id: 0 }).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    response.send(JSON.stringify(result));
  });

  /*
  fishes.find().sort({ Fish: 1 }).limit(10).toArray(function (err, result) {
    if (err) throw err;
    console.log(result);
    response.send(JSON.stringify(result));
  });
  */
  //db.fishes.find( { fish: fishName }, { fish: 1, info: 1, noxious: 1, protected: 1, _id: 0 } } )
  // perform actions on the collection object


}
/*
//insert message
const insertMessage = (message) => {
  fishes.insertOne({message: message })
}

const retrieveMessages = (res) => {
  fishes.find().toArray(function (err, result) {
    if (err) throw err;
    res.send(result);
  })

}*/

app.listen(port);
console.log("Listening on port ", port);