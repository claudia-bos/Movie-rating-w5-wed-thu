import db, { Movie, Rating, User } from "./model.js";
import movieData from './movies.json' assert {type: 'json'}
import userData from './users.json' assert {type: 'json'}
import lodash from 'lodash'

console.log(`Syncing database...`)
await db.sync({force: true})
console.log(`sending database...`)

const moviesInDB = await Promise.all(movieData.map(async movie => {
    const releaseDate = new Date(Date.parse(movie.releaseDate))
    const {title, overview, posterPath} = movie
    
    const newMovie = await Movie.create({
        title,
        overview,
        posterPath,
        releaseDate
    })

    return newMovie
}))

// console.log(moviesInDB)

const usersInDB = await Promise.all(
    userData.map(user => {
        const { email, password } = user

        const newUser = User.create({
            email,
            password
        })

        return newUser
    })
)

const ratingsInDB = await Promise.all(usersInDB.flatMap(user => {
    const randomMovies = lodash.sampleSize(moviesInDB, 10)

    const movieRatings = randomMovies.map(movie => {
        return Rating.create({
            score: lodash.random(1,5),
            userId: user.userId,
            movieId: movie.movieId
        })
    })
    return movieRatings
}))

await db.close()
console.log("Finished seeding database!")
