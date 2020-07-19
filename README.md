# My Stock Watchlist App

This app lets you login using your **email and password**. LoggedIn users can see their stock watchlist. Stocks gets updated on realtime.

Application is deployed [here](https://mystockwatchlist.herokuapp.com/)

## Functionalities

 - Login
 - Watchlists

 ## How to run the app
  
 - Download/clone the app
 - Open terminal and navigate to root folder of the app
 - run **npm install**
 - execute app by using **npm start** or **node server.js**
 - App will start listening on port 3300
 - Browse http://localhost:3300
 
## Technologies used
 - NodeJS
 - ExpressJS
 - MongoDB
 - Passport JS for Authentication
 - SocketIo
 - Mongo Change Stream

## Database
Database  - MongoDB
Database name - stocks-watchlist

Collections
 - stocks
 - users

stocks

 - _id - Unique identifier of the Stock. Mongo ObjectId
 - name - Name of the Stock
 - bseDetails.currentValue - Current value of the stock
 - bseDetails.lastValue - last value of the stock
 - baseDetails.valueUpdatedAt - last value updated time

Users
 - _id - Unique identifier of the User. (Mongo ObjectId)
 - email
 - password


## App directory Structure
client

 - css - Css dependencies
 - js - Javascript dependencies
 - index.html - Main Page
 - 404.html

server
 - api - All the apis within their module
 - routes - routing handlers
 - db - db access handlers for all the entities
 - utils
   - sessions - session management
   - streamer - streaming the data
   - passport and permissions middleware
  
node_modules
