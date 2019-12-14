// run server: node index.js || nodemon index.js for hot-reloads
const app = require("express")();
const server = require("http").Server(app);
const sqlite3 = require("sqlite3").verbose();

// parsing middleware allows us to read incoming axios data
const bodyParser = require("body-parser");

// CORS middleware allows data to be sent from client-side
const cors = require("cors");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;
server.listen(port);
console.log("Server running on port " + port);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

// when data received from client-side via axios
app.post("/post", function(req, res) {
  // body-parser saves incoming data in req.body
  const data = req.body.inputs;

  // open database
  let db = new sqlite3.Database("data.db", err => {
    if (err) {
      return console.error(err.message);
    }
  });

  let name = data.name;
  let email = data.email;
  let message = data.message;
  // insert form input into table
  db.run(
    "INSERT INTO bookings (name, email, message) VALUES (?,?,?)",
    name,
    email,
    message
  );

  // close the database connection
  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
  });
});

module.exports = app;
