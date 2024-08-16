const axios = require('axios');
const { MongoClient } = require('mongodb');


const apiKey = '669a4175a226599303e788ed359dd4ba';


const mongoUri = 'mongodb://localhost:27017/TMDB'; // Adjust connection details as needed
const collectionName = 'Movies'; // Adjust collection name if desired

async function importMovies() {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db();
    const collection = db.collection(collectionName);

    // Get popular movies 
    const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
        // Extract only desired data from movies
        const movies = response.data.results.map(movie => ({
            title: movie.title,
            year: new Date(movie.release_date).getFullYear(),
            rewards: movie.awards?.map(award => ({
              ceremony: award.ceremony,
              category: award.category,
              year: award.year
            })),
            director: movie.credits?.crew?.find(crewMember => crewMember.job === "Director")?.name
          }));

    // Insert movies into MongoDB collection
    await collection.insertMany(movies);

    console.log('Movies imported successfully!');

    // Close MongoDB connection
    await client.close();
  } catch (error) {
    console.error('Error importing movies:', error);
  }
}

importMovies();
