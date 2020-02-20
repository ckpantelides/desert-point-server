// run server: node index.js || nodemon index.js for hot-reloads
const app = require('express')();
const server = require('http').Server(app);
const sqlite3 = require('sqlite3').verbose();

// parsing middleware allows us to read incoming axios data
const bodyParser = require('body-parser');

// CORS middleware allows data to be sent from client-side
const cors = require('cors');

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
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 8000;
//server.listen(port);
app.listen(port);
console.log('Server running on port ' + port);

let pg = require('pg');
if (process.env.DATABASE_URL) {
  pg.defaults.ssl = true;
}

let connString = process.env.DATABASE_URL;

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: connString
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// when data received from client-side via axios
app.post('/post', function(req, res) {
  // body-parser saves incoming data in req.body
  const data = req.body.inputs;

  let enquirydate = new Date().toISOString().slice(0, 10);

  pool
    .query(
      'INSERT INTO requests(enquirydate, name, email, telephone, dates, package, message, read)VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        enquirydate,
        data.name,
        data.email,
        data.telephone,
        data.dates,
        data.package,
        data.message,
        'false'
      ]
    )
    .then(console.log('Enquiry inserted into database'))
    .catch(err =>
      setImmediate(() => {
        throw err;
      })
    );

  // pool.end();

  // Below inserts data but throws error message
  /*
  pool.query(
    'INSERT INTO requests(name,email,message)VALUES($1,$2,$3)',
    [data.name, data.email, data.message],
    err => {
      console.log(err);
      pool.end();
    }
  );
  */
  // The below is confirmed as working
  /*
  pool.query("INSERT INTO requests(name)VALUES('Mary Ann')", (err, res) => {
    console.log(err, res);
    pool.end();
  });
  */
});

// show booking enquiries to admin
app.get('/enquiries', function(req, res, callback) {
  pool.query(
    'SELECT enquirydate, name, email, telephone, dates, package, message, read FROM requests',
    (err, res) => {
      if (err) {
        return console.log(err.message);
      } else {
        //console.log(res.rows);
        return callback(res.rows);
      }
    }
  );
  function callback(data) {
    res.send(data);
  }

  // Below confirmed as working. N/B reading from booking not requests
  /*
  const { Client } = require('pg');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });

  client
    .connect()
    .then(() => {
      console.log('connected');
      retrieveEnquiries();
    })
    .catch(e => {
      console.log(e);
    });

  function retrieveEnquiries() {
    client.query(
      'SELECT rowid,enquirydate, name, email, telephone, dates, package, message, read FROM bookings',
      (err, res) => {
        if (err) {
          return console.log(err.message);
        } else {
          console.log(res.rows);
          return callback(res.rows);
          client.end();
        }
      }
    );
    function callback(data) {
      res.send(data);
    }
  }
  */
});

app.post('/update-enquiries', function(req, res) {
  const data = req.body.data;

  // iterate over updated enquiry data and input into bookings table
  function updateEnquiries() {
    data.forEach(function(el, index) {
      let rowid = index + 1;

      // insert updated enquiry data into bookings table
      pool
        .query(
          'INSERT INTO requests (rowid, enquirydate, name, email, telephone, dates, package, message, read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [
            rowid,
            el.enquirydate,
            el.name,
            el.email,
            el.telephone,
            el.dates,
            el.package,
            el.message,
            el.read
          ]
        )
        .then(console.log('Updates inserted into detabase'))
        .catch(err =>
          setImmediate(() => {
            throw err;
          })
        );
    });
  }

  // delete all rows from requests table
  pool.query('DELETE FROM requests', function(err) {
    if (err) {
      return console.error(err.message);
    } else {
      updateEnquiries();
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
