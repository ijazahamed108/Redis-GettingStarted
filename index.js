const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const port = process.env.PORT || 5000;

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

 const fetchApiData = async(species) => {
  
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to the API");
  //res.send(apiResponse.data);
  return apiResponse.data;
}
//bluefish, scup
const  cacheData = async (req, res, next) => {
  const species = req.params.species;
  let results;
  try {
    const cacheResults = await redisClient.get(species);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results[0].Population,
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }
}
const  getData = async (req, res) => {
  const species = req.params.species;
  let results;

  try {
    results = await fetchApiData(species);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    await redisClient.set(species, JSON.stringify(results), {
      EX: 180,
      NX: true,
    });

    res.send({
      fromCache: false,
      data: results[0].Population,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

const setValue = async (req, res) => {
  const {key , value} = req.params;
  const result  = await redisClient.set(key, value)
  res.send("value stored", result) // OK
  
}

const getValue = async (req, res) => {
  const {key} = req.params
  const result = await redisClient.get(key);
  res.send(result)
}


// Hashes
const setHash = async (req, res) => { 
      
  const result = await redisClient.hmset('frameworks', 'javascript', 'ReactJS', 'css', 'TailwindCSS', 'node', 'Express');
  redisClient.send(result)

}
//setHash();

const getHash = async (req, res) => {
  const {key} = req.params;
  const result  = await redisClient.hgetall(key)
  redisClient.send()
}

// // Lists

// redisClient.rpush(['frameworks_list', 'ReactJS', 'Angular'], function(err, response) {
//   console.log(response); // 2
// });

// redisClient.lrange('frameworks_list', 0, -1, function(err, response) {
//   console.log(response); // [ 'ReactJS', 'Angular' ]
// });

// // Sets

// redisClient.sadd(['frameworks_set', 'ReactJS', 'Angular', 'Svelte', 'VueJS', 'VueJS'], function(err, response) {
//   console.log(response); // 4
// });

// redisClient.smembers('frameworks_set', function(err, response) {
//   console.log(response); // [ 'Angular', 'ReactJS', 'VueJS', 'Svelte' ]
// });

// // Check the existence of a key

// redisClient.exists('framework', function(err, response) {
//   if (response === 1) {
//     console.log('Exists!');
//   } else {
//     console.log('Doesn\'t exist!');
//   }
// });

// // Delete a key

// redisClient.del('frameworks_list', function(err, response) {
//   console.log(response); // 1
// });

// // Increment a key

// redisClient.set('working_days', 5, function() {
//   redisClient.incr('working_days', function(err, response) {
//     console.log(response); // 6
//   });
// });

// app.get("/",fetchApiData)
// app.get("/set/:key/:value", setValue)
// app.get("/get/:key", getValue)
//app.get("/hash/:key", getHash)


app.get("/fish/:species", cacheData, getData);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
