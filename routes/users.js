var express = require('express')
var app = express()

// SHOW LIST OF USERS
app.get('/', function(req, res, next) {
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM table1 ORDER BY id DESC',function(err, rows, fields) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				res.render('user/list', {
					title: 'User List', 
					data: ''
				})
			} else {
				// render to views/user/list.ejs template file
				res.render('user/list', {
					title: 'User List', 
					data: rows
				})
			}
		})
	})
})

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('user/add', {
		title: 'Add New User',
		quantity: '',
		first_name : '',
		last_name : '',
		email_address : '',
		mobile_number : '',
		street_address1 : '',
		street_address2: '',
		state_city : '',
		date_deliverty : '',
		message : ''			
	})
})

// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){	
	req.assert('quantity', 'quantity is required').notEmpty()           //Validate fist name 
	req.assert('first_name', 'First name is required').notEmpty()             //Validate last name 
    req.assert('email_address', 'A valid email is required').isEmail()  //Validate email address
	req.assert('last_name', 'Last name is required').notEmpty()           //Validate fist name 
	req.assert('mobile_number', 'Mobile Phone is required').notEmpty()    
	req.assert('street_address1', 'street_address1 is required').notEmpty()           //Validate fist name 
	req.assert('street_address2', 'street_address2 is required').notEmpty()    
	req.assert('state_city', 'state_city is required').notEmpty()           //Validate fist name    
	req.assert('date_deliverty', 'date_deliverty is required').notEmpty()           //Validate fist name 
	req.assert('message', 'message is required').notEmpty()   

    var errors = req.validationErrors()
    var user = {
		quantity: req.sanitize('quantity').escape().trim(),
		first_name: req.sanitize('first_name').escape().trim(),
		last_name: req.sanitize('last_name').escape().trim(),
		email_address: req.sanitize('email_address').escape().trim(),
		mobile_number: req.sanitize('mobile_number').escape().trim(),
		street_address1: req.sanitize('street_address1').escape().trim(),
		street_address2: req.sanitize('street_address2').escape().trim(),
		state_city: req.sanitize('state_city').escape().trim(),
		date_deliverty: req.sanitize('date_deliverty').escape().trim(),
		message: req.sanitize('message').escape().trim()
	}
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a user    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a user'
		********************************************/
		
		
		req.getConnection(function(error, conn) {
			conn.query('INSERT INTO table1 SET ?', user, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.render('user/add', {
						title: 'Add New',
						quantity: user.quantity,
						first_name : user.first_name,
						last_name : user.last_name,
						email_address : user.email_address,
						mobile_number : user.mobile_number,
						street_address1 : user.street_address1,
						street_address2: user.street_address2,
						state_city : user.state_city,
						date_deliverty : user.date_deliverty,
						message : user.message				
					})
				} else {				
					req.flash('success', 'Data added successfully!')
					
					// render to views/user/add.ejs
					res.render('user/add', {
						title: 'Add New',
						quantity: '',
						first_name : '',
						last_name : '',
						email_address : '',
						mobile_number : '',
						street_address1 : '',
						street_address2: '',
						state_city : '',
						date_deliverty : '',
						message : ''					
					})
				}
			})
		})
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/add', { 
            title: 'Add New',
            quantity: user.quantity,
			first_name : user.first_name,
			last_name : user.last_name,
			email_address : user.email_address,
			mobile_number : user.mobile_number,
			street_address1 : user.street_address1,
			street_address2: user.street_address2,
			state_city : user.state_city,
			date_deliverty : user.date_deliverty,
			message : user.message
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req, res, next){
	req.getConnection(function(error, conn) {
		conn.query('SELECT * FROM table1 WHERE id = ' + req.params.id, function(err, rows, fields) {
			if(err) throw err
			
			// if user not found
			if (rows.length <= 0) {
				req.flash('error', 'User not found with id = ' + req.params.id)
				res.redirect('/users')
			}
			else { // if user found
				// render to views/user/edit.ejs template file
				res.render('user/edit', {
					title: 'Edit User', 
					//data: rows[0],
					id: rows[0].id,
					quantity : rows[0].quantity,
					first_name: rows[0].first_name,
					last_name: rows[0].last_name,
					email_address: rows[0].email_address,
					mobile_number: rows[0].mobile_number,
					street_address1: rows[0].street_address1,
					street_address2: rows[0].street_address2,
					state_city: rows[0].state_city,
					date_deliverty: rows[0].date_deliverty,
					message: rows[0].message,
				})
			}			
		})
	})
})

// EDIT USER POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('first_name', 'FirstName is required').notEmpty()           //Validate fist name 
	req.assert('last_name', 'LastName is required').notEmpty()             //Validate last name 
    req.assert('email_address', 'A valid email is required').isEmail()  //Validate email address
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
		
		/********************************************
		 * Express-validator module
		 
		req.body.comment = 'a <span>comment</span>';
		req.body.username = '   a user    ';

		req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
		req.sanitize('username').trim(); // returns 'a user'
		********************************************/
		
		var user = {
			quantity: req.sanitize('quantity').escape().trim(),
			first_name: req.sanitize('first_name').escape().trim(),
			last_name: req.sanitize('last_name').escape().trim(),
			email_address: req.sanitize('email_address').escape().trim(),
			mobile_number: req.sanitize('mobile_number').escape().trim(),
			street_address1: req.sanitize('street_address1').escape().trim(),
			street_address2: req.sanitize('street_address2').escape().trim(),
			state_city: req.sanitize('state_city').escape().trim(),
			date_deliverty: req.sanitize('date_deliverty').escape().trim(),
			message: req.sanitize('message').escape().trim()
		}
		
		req.getConnection(function(error, conn) {
			conn.query('UPDATE table1 SET ? WHERE id = ' + req.params.id, user, function(err, result) {
				//if(err) throw err
				if (err) {
					req.flash('error', err)
					
					// render to views/user/add.ejs
					res.render('user/edit', {
						title: 'Edit Data',
						id: req.params.id,
						quantity: user.quantity,
						first_name : user.first_name,
						last_name : user.last_name,
						email_address : user.email_address,
						mobile_number : user.mobile_number,
						street_address1 : user.street_address1,
						street_address2: user.street_address2,
						state_city : user.state_city,
						date_deliverty : user.date_deliverty,
						message : user.message	
					})
				} else {
					req.flash('success', 'Data updated successfully!')
					
					// render to views/user/add.ejs
					res.render('user/edit', {
						title: 'Edit Data',
						id: req.params.id,
						quantity: user.quantity,
						first_name : user.first_name,
						last_name : user.last_name,
						email_address : user.email_address,
						mobile_number : user.mobile_number,
						street_address1 : user.street_address1,
						street_address2: user.street_address2,
						state_city : user.state_city,
						date_deliverty : user.date_deliverty,
						message : user.message	
					})
				}
			})
		})
	}
	else {   //Display errors to user
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
		/**
		 * Using req.body.name 
		 * because req.param('name') is deprecated
		 */ 
        res.render('user/edit', { 
            title: 'Edit User',            
			id: req.params.id, 
			name: req.body.name,
			age: req.body.age,
			email: req.body.email
        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
	var user = { id: req.params.id }
	
	req.getConnection(function(error, conn) {
		conn.query('DELETE FROM table1 WHERE id = ' + req.params.id, user, function(err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				// redirect to users list page
				res.redirect('/users')
			} else {
				req.flash('success', 'User deleted successfully! id = ' + req.params.id)
				// redirect to users list page
				res.redirect('/users')
			}
		})
	})
})

module.exports = app
