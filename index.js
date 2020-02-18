// run server: node index.js || nodemon index.js for hot-reloads
const app = require("express")();
const server = require("http").Server(app);
const sqlite3 = require("sqlite3").verbose();

// parsing middleware allows us to read incoming axios data
const bodyParser = require("body-parser");

// CORS middleware allows data to be sent from client-side
const cors = require("cors");

/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  next();
});
*/
//app.use(cors());
//app.options("*", cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;
//server.listen(port);
app.listen(port);
console.log("Server running on port " + port);

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

// when data received from client-side via axios
app.post("/post", function(req, res) {
  // body-parser saves incoming data in req.body
  const data = req.body.inputs;
  console.log(data);
  client.connect();

  let enquirydate = new Date().toISOString().slice(0, 10);
  let name = data.name;
  let email = data.email;
  let telephone = data.telephone;
  let dates = data.dates;
  let package = data.package;
  let message = data.message;
  let read = "false";

  // insert form input into table
  client.query(
    "INSERT INTO bookings (enquirydate, name, email, telephone, dates, package, message, read) VALUES (enquirydate, name, email, telephone, dates, package, message, read)"
  );

  // close the database connection
  client.end();
});

// show booking enquiries to admin
app.get("/enquiries", function(req, res, callback) {
  // open database connection
  client.connect();

  client.query(
    "SELECT rowid,enquirydate, name, email, telephone, dates, package, message, read FROM bookings",
    function(err, rows) {
      if (err) {
        return console.log(err.message);
      } else {
        return callback(rows);
        client.end();
      }
    }
  );
  function callback(data) {
    res.send(data);
  }
});

app.post("/update-enquiries", function(req, res) {
  const data = req.body.data;

  // iterate over updated enquiry data and input into bookings table
  function updateEnquiries() {
    data.forEach(function(el, index) {
      let rowid = index + 1;
      let enquirydate = el.enquirydate;
      let name = el.name;
      let email = el.email;
      let telephone = el.telephone;
      let dates = el.dates;
      let package = el.package;
      let message = el.message;
      let read = el.read;

      // insert updated enquiry data into bookings table
      db.run(
        "INSERT INTO bookings (rowid,enquirydate, name, email, telephone, dates, package, message, read) VALUES (?,?,?,?,?,?,?,?,?)",
        rowid,
        enquirydate,
        name,
        email,
        telephone,
        dates,
        package,
        message,
        read
      );
    });
  }

  // open database
  let db = new sqlite3.Database("data.db", err => {
    if (err) {
      return console.error(err.message);
    }
  });

  // delete all rows from bookings table
  db.run("DELETE FROM bookings", function(err) {
    if (err) {
      return console.error(err.message);
    } else {
      updateEnquiries();
    }
  });

  // close the database connection
  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
  });
});

/*
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
  function callback(data) {
    res.send(data);
  }
});

app.post("/update-enquiries", function(req, res) {
  const data = req.body.data;

  // iterate over updated enquiry data and input into bookings table
  function updateEnquiries() {
    data.forEach(function(el, index) {
      let rowid = index + 1;
      let enquirydate = el.enquirydate;
      let name = el.name;
      let email = el.email;
      let telephone = el.telephone;
      let dates = el.dates;
      let package = el.package;
      let message = el.message;
      let read = el.read;

      // insert updated enquiry data into bookings table
      db.run(
        "INSERT INTO bookings (rowid,enquirydate, name, email, telephone, dates, package, message, read) VALUES (?,?,?,?,?,?,?,?,?)",
        rowid,
        enquirydate,
        name,
        email,
        telephone,
        dates,
        package,
        message,
        read
      );
    });
  }

  // open database
  let db = new sqlite3.Database("data.db", err => {
    if (err) {
      return console.error(err.message);
    }
  });

  // delete all rows from bookings table
  db.run("DELETE FROM bookings", function(err) {
    if (err) {
      return console.error(err.message);
    } else {
      updateEnquiries();
    }
  });

  // close the database connection
  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
  });
});
*/
module.exports = app;
