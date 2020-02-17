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

  let enquirydate = new Date().toISOString().slice(0, 10);
  let name = data.name;
  let email = data.email;
  let telephone = data.telephone;
  let dates = data.dates;
  let package = data.package;
  let message = data.message;
  let read = "false";

  // insert form input into table
  db.run(
    "INSERT INTO bookings (enquirydate, name, email, telephone, dates, package, message, read) VALUES (?,?,?,?,?,?,?,?)",
    enquirydate,
    name,
    email,
    telephone,
    dates,
    package,
    message,
    read
  );

  // close the database connection
  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
  });
});

// show booking enquiries to admin
app.get("/enquiries", function(req, res, callback) {
  // open database connection
  let db = new sqlite3.Database("data.db", "OPEN_READONLY", err => {
    if (err) {
      return console.error(err.message);
    }
  });

  db.all(
    "SELECT rowid,enquirydate, name, email, telephone, dates, package, message, read FROM bookings",
    function(err, rows) {
      if (err) {
        return console.log(err.message);
      } else {
        return callback(rows);
        db.close();
      }
    }
  );
  /*
      // An array storing all of the film data to be sent to the front end
      let collatedFilmsByDay = [day0, day1, day2, day3, day4, day5, day6];
      return callback(collatedFilmsByDay);
    }
  });
  */
  function callback(data) {
    res.send(data);
  }
});

module.exports = app;
