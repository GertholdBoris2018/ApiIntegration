var express = require('express')
var app = express()

app.get('/', function(req, res) {
	// render to views/index.ejs template file
	//create table for database 1
	var createTodos = `create table if not exists table1(
		id int primary key auto_increment,
		quantity tinyint(10) not null,
		first_name varchar(24) not null,
		last_name varchar(24) not null,
		email_address varchar(32) not null,
		mobile_number varchar(12) not null,
		street_address1 varchar(24) not null,
		street_address2 varchar(24) not null,
		state_city varchar(24) not null,
		date_deliverty varchar(24) not null,
		message varchar(128) not null
	)`;
	req.getConnection(function(error, conn) {
		conn.query(createTodos,function(err, rows, fields) {
			//if(err) throw err
			if (err) {
				console.log(err);
			} else {
				// render to views/user/list.ejs template file
				console.log('table1 created');
			}
		})
	})

	res.render('index', {title: 'My Node.js Application'})
})

/** 
 * We assign app object to module.exports
 * 
 * module.exports exposes the app object as a module
 * 
 * module.exports should be used to return the object 
 * when this file is required in another module like app.js
 */ 
module.exports = app;
