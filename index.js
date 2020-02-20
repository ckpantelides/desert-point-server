// run server: node index.js || nodemon index.js for hot-reloads

// app runs on the Express middleware
const app = require('express')();

//const server = require('http').Server(app);
//const sqlite3 = require('sqlite3').verbose();

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

// pg is the module used for node to interact with postgresql
let pg = require('pg');
if (process.env.DATABASE_URL) {
  pg.defaults.ssl = true;
}

// pool is used instead of client to connect to postgresql (client kept returning errors)
// c.f. npm 'pg' documentation recommends pools. No need to call pool.end() - the pool can be left open
let connString = process.env.DATABASE_URL;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: connString
});

// this route confirms the backend is running, and displays a simply message
// at the url (from index.html)
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// this route is called when a booking enquiry is made from the front-end
app.post('/post', function(req, res) {
  // booking enquiry saved to 'data' variable
  // (body-parser saves incoming data in req.body)
  const data = req.body.inputs;

  // get today's date i.e. the date of the enquiry
  let enquirydate = new Date().toISOString().slice(0, 10);

  // insert the booking enquiry into the requests table
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

  res.end();
});

// this route is called to show the booking enquiries to the admin on the frontend
app.get('/enquiries', function(req, res, callback) {
  pool.query(
    'SELECT rowid, enquirydate, name, email, telephone, dates, package, message, read FROM requests ORDER BY rowid',
    (err, res) => {
      if (err) {
        return console.log(err.message);
      } else {
        return callback(res.rows);
      }
    }
  );
  function callback(data) {
    res.send(data);
  }
});

// this route is called when enquiries are deleted, marked as "read" or reordered
// by the admin on the frontend
app.post('/update-enquiries', function(req, res) {
  // set data to the updated enquiries received from the frontend
  const data = req.body.data;

  // iterate over the updated enquiry data and insert into requests table
  function updateEnquiries() {
    data.forEach(function(el, index) {
      // rowid is reset to account for enquiries being re-ordered by the user
      let rowid = index + 1;

      // insert updated enquiry data into requests table
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
        .then(console.log('Updates inserted into database'))
        .catch(err =>
          setImmediate(() => {
            throw err;
          })
        );
    });
  }

  let resetPrimaryKey = `"SELECT setval('requests_rowid_seq', ${data.length}, true);"`;
  // deletes all rows from the requests table and then calls updateEnquiries()
  // this is necessary to reset the rowids, to account for reodered enquiries
  pool.query('TRUNCATE TABLE requests', function(err) {
    if (err) {
      return console.error(err.message);
    } else {
      pool.query(resetPrimaryKey);
      updateEnquiries();
    }
  });
  res.end();
});

module.exports = app;
