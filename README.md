# Redis-GettingStarted

1. Install Redis
2. Install Dependencies by running command       npm run dev
3.App starts on Port 5000

//overview

This Application Fetches Data from API ( `https://www.fishwatch.gov/api/species/${species}`) and Store the result in Redis Cache 


localhost:500/fish/:species   - hit this url in browser to trigger Api

here species is the name of fish   Ex: (red-snapper, bluefish, scup)

localhost:500/fish/bluefish --- intialhit will fetch data from Api and stores it Redis Cache with Key as Name of Fish here it is bluefish

when you hit API next time data will be fetched from Redis , Observe Response times in console.
