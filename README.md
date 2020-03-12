Surf Camp website backend built with node
===========

This backend code handles booking enquiries from this Surf Camp [website](https://ckpantelides.github.io/desert-point) - the repo for the frontend is [here](https://github.com/ckpantelides/desert-point-server). It's hosted on Heroku.

This backend stores the booking enquiries made through the "contact" section of the frontend in a postgresql database, and then serves them to the [Admin page](https://ckpantelides.github.io/desert-point/#/admin) when needed. It also handles updates to the booking enquiries made by the Admin page.

#### Code structure

There are three routes: /post, /enquiries and /update-enquiries. All of the enquiry data is stored in a postgresql database. The [pg](https://www.npmjs.com/package/pg) module is needed to interact with the database. All connections had to be made with Pools - connections via Client were rejected.

**/post** receives the inputs from the frontend booking enquiry form and inserts them into the database with the date.

**/enquiries** selects all of the enquiry data and returns it to the frontend Admin page.

**/update-enquiries** is for when the admin makes changes to the booking enquiries on the front-end, i.e. marking as "read", deleting them or re-ordering them. The route truncates all of the old data in the table, inserts the new data with a new primary key to indicate the enquiries' changed order, and then resets the primary key so it will follow on from the reinserted data.

#### Postgresql database

I initialised the database with this query:

CREATE TABLE requests(rowid SERIAL PRIMARY KEY,enquirydate VARCHAR(50),name VARCHAR(50),email VARCHAR(50),telephone VARCHAR(50),dates VARCHAR(50),package VARCHAR(50),message VARCHAR(255),read VARCHAR(50));

#### Admin page that receives and updates the enquiry data:

![img2]

#### Installation

> npm install

> npm run start

[img2]: https://github.com/ckpantelides/desert-point/blob/images/admin350.png
