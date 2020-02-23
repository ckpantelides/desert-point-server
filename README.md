Surf Camp website backend built with node
===========

This backend code handles booking enquiries from this Surf Camp [website](https://ckpantelides.github.io/desert-point) - the repo for the frontend is [here](https://github.com/ckpantelides/desert-point-server). It's hosted on Heroku.

This backend stores the booking enquiries made through the "contact" section of the frontend in a postgresql database, and then serves them to the [Admin page](https://github.com/ckpantelides/deser-point/#/admin) when needed. It also handles updates to the booking enquiries sent from the Admin page.

#### Code structure

There are three routes /post, /enquiries and /update-enquiries. All the information is stored in a Postgresql database. The [pg](https://www.npmjs.com/package/pg) module is needed to interact with the database. All connections had to be made with Pools - connections via Client were rejected.

/post receives an object from the frontend with inputs from the booking enquiry form and inserts them into the database with the date.

/enquiries selects all of the booking enquiries into an array of objects and returns them to the frontend Admin page.

/update-enquiries is for when the Admin makes changes to the booking enquiries on the front-end, i.e. marking as "read", deleting them or re-ordering them. The route first truncates all of the data in the table, reinserts them with a new primary key to indicate the enquiries changed order, and then resets the primary key so it will follow on from the reinserted data.

#### Postgresql database

I initialised the database with this query:

CREATE TABLE bookings(rowid SERIAL PRIMARY KEY,enquirydate VARCHAR(50),name VARCHAR(50),email VARCHAR(50),telephone VARCHAR(50),dates VARCHAR(50),package VARCHAR(50),message VARCHAR(255),read VARCHAR(50));

#### Admin page that receives and updates the enquiry data:

![img2]

#### Installation

> npm install

> npm run start

[img2]: https://github.com/ckpantelides/desert-point/blob/images/admin350.png
