var express = require('express')
var app = express()
var mysql = require('mysql')
var config = require('../config')
// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('databases/add', {
		title: 'Add New Database',
		dbname: ''	
	})
})

// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){	
	/********************************************
     * Express-validator module
     
    req.body.comment = 'a <span>comment</span>';
    req.body.username = '   a user    ';

    req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
    req.sanitize('username').trim(); // returns 'a user'
    ********************************************/
   var dbname = req.sanitize('dbname').escape().trim();
   //console.log(dbname);
   var con = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        supportBigNumbers: true,
        bigNumberStrings: true
    });
  
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        
        con.query("CREATE DATABASE IF NOT EXISTS " + dbname, function (err, result) {
            if (err) throw err;
            console.log("database1 created");
            var myconnection = createConnection(config.database.host,config.database.user,config.database.password,dbname);
            
            myconnection.connect(function(err) {
                if (err) {
                  return console.error('error: ' + err.message);
                }
               
                let createTodos = `create table if not exists table1(
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
                    message varchar(128) not null)`;
               
                myconnection.query(createTodos, function(err, results, fields) {
                    if (err) {
                        req.flash('error', err)
                        console.log(err.message);
                        res.render('databases/add', {
                            title: 'Add Database',
                            dbname: dbname				
                        })
                    }
                    else{
                        req.flash('success', 'Database Added successfully!')
                        console.log('table created');
                        res.render('databases/add', {
                            title: 'Add Database',
                            dbname : ''				
                        })
                    }
                });
               
                myconnection.end(function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            });
        });
    });
    
})

function createConnection(host, user, password, dbname){
    var connection = mysql.createConnection({
        host     : host,
        user     : user,
        password : password,
        database : dbname
    });
    return connection;
}
module.exports = app