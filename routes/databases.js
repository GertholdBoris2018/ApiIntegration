var express = require('express')
var app = express()
var mysql = require('mysql')
var config = require('../config')
var multer = require('multer');
var XLSX = require('xlsx');
var dateFormat = require('dateformat');
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.logfile = function(d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
  };

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};
var upload = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

            /** API path that will upload the files */
    function to_json(workbook){
        var result = [];
        workbook.SheetNames.forEach(function(sheetName) {
            var item = {};
            var sheet = workbook.Sheets[sheetName];
            var roa = XLSX.utils.sheet_to_row_object_array(sheet);
            //console.log(get_header_row(sheet));
            var headers = get_header_row(sheet);
            //console.log(roa);
            //calculate the size of each fields
            var sizeof = [];
            for(var i = 1; i < headers.length ; i++){
                var sizeofitem = [];
                for(var k= 0; k < roa.length ; k++){
                    //console.log(roa[k][headers[i]]);
                    if(typeof roa[k][headers[i]] !== 'undefined'){
                        var length = roa[k][headers[i]].length;
                        //console.log(length);
                        sizeofitem.push(length);
                    }
                    
                    //if(typeof roa[k][headers[i]].length !== 'undefined' && roa[k][headers[i]].length) 
                        //sizeofitem.push(roa[k][headers[i]].length);
                }
                //console.log(sizeofitem);
                sizeof.push(sizeofitem.max());
            }

            item.headers = headers;
            item.datas = roa;
            item.sheetname = sheetName;
            item.sizeof = sizeof;
            result.push(item);
            // if(roa.length > 0){
            //     var item = [headers,roa;
            //     result[sheetName] = item;
            // }
        });
        return result;
    }
    function get_header_row(sheet) {
        var headers = [];
        var range = XLSX.utils.decode_range(sheet['!ref']);
        var C, R = range.s.r; /* start in the first row */
        /* walk every column in the range */
        for(C = range.s.c; C <= range.e.c; ++C) {
            var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */
    
            var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
            if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);
    
            headers.push(hdr);
        }
        return headers;
    }

// SHOW ADD USER FORM
app.get('/add', function(req, res, next){	
	// render to views/user/add.ejs
	res.render('databases/add', {
		title: 'Add New Database',
		dbname: ''	
	})
})

function fetchID(data, callback) {
    connection.query('SELECT id FROM new_databases ',        
           [], function(err, rows) {
        if (err) {
            callback(err, null);
        } else 
            callback(null, rows[0].id);
    });
}

var databases = [];
app.get('/import', function(req, res, next){
    //get databases
    var myconnection = createConnection(config.database.host,config.database.user,config.database.password,config.database.db);
    myconnection.connect(function(err) {
        if (err) {
            return console.error('error: ' + err.message);
        }
        var createTodos = `select name from new_databases;`;
        console.log(createTodos);
        myconnection.query(createTodos, function(err, results, fields) {
            if (err) {
                req.flash('error', err)
                res.render('databases/import', {
                    title: 'Import Tables from Xlsx files',
                    selecteddb : '',
                    dbname: '',
                    databases : []
                })
            }
            else{
                databases = results;
                console.log(results);
                res.render('databases/import', {
                    title: 'Import Tables from Xlsx files',
                    selecteddb : '',
                    dbname: '',
                    databases : databases
                })
            }
            myconnection.end(function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
        });
    });
});



// ADD NEW USER POST ACTION
app.post('/add', function(req, res, next){	
	/********************************************
     * Express-validator module
     
    req.body.comment = 'a <span>comment</span>';
    req.body.username = '   a user    ';

    req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
    req.sanitize('username').trim(); // returns 'a user'
    ********************************************/
    req.assert('dbname', 'database is required').notEmpty()   
    var errors = req.validationErrors();

    if(!errors){
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

                //insert log

                var myconnection = createConnection(config.database.host,config.database.user,config.database.password,config.database.db);
                
                myconnection.connect(function(err) {
                    if (err) {
                        return console.error('error: ' + err.message);
                    }
                    
                    let createTodos = `create table if not exists new_databases(
                        no int primary key auto_increment,
                        name varchar(24) not null,
                        created_date datetime not null)`;
                    
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
                            console.log('table created');
                            //add new database history
                            var insertDB = `INSERT INTO new_databases (name, created_date)
                            VALUES ('`+ dbname +`', '`+ dateFormat(new Date(), "yyyy-mm-dd h:MM:ss") +`');`;
// console.log(insertDB);
                            myconnection.query(insertDB, function(err, results, fields){
                                if(err) {
                                    req.flash('error', err)
                                    console.log(err.message);
                                    res.render('databases/add', {
                                        title: 'Add Database',
                                        dbname: dbname				
                                    })
                                }
                                else{
                                    req.flash('success', 'Database Added successfully!');
                                    res.render('databases/add', {
                                        title: 'Add Database',
                                        dbname: ''
                                    })
                                }
                                myconnection.end(function(err) {
                                    if (err) {
                                        return console.log(err.message);
                                    }
                                });
                            });
                        }
                    });
                    
                    
                });
            });
        });
    }
    else{
        var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
        req.flash('error', error_msg);
        
        res.render('databases/add', {
            title: 'Add Database',
            dbname: ''	
        })
    }
})

app.post('/upload',function(req, res, next){
    upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        /** Multer gives us file info in req.file object */
        if(!req.file){
            req.flash('error', 'Please select the xlsx file!');
            res.render('databases/import', {
                title: 'Import Tables from Xlsx files',
                selecteddb : '',
                dbname: '',
                databases: databases
            })
        }
        else{
            var workbook = XLSX.readFile(req.file.path);
            var json_result = to_json(workbook);    
            var dbname = req.body.selecteddb;
            var cnt = 0; 
            json_result.forEach(function(item) {
                var headers = item.headers;
                var datas = item.datas;
                var sheetName = item.sheetname;
                var sizeof = item.sizeof;
                //console.log(sheetName);
                //console.log(sizeof);
                //console.log(datas);

                var myconnection = createConnection(config.database.host,config.database.user,config.database.password,dbname);
                myconnection.connect(function(err) {
                    if (err) {
                        return console.error('error: ' + err.message);
                    }

                    var createTodos = `create table if not exists `+sheetName+`(
                        `+headers[0]+` int primary key auto_increment,`;

                    for(var i = 1; i < headers.length; i++){

                        var sizeofitem = sizeof[i-1];
                        var sizeobbyte = 10;
                        if(isFinite(sizeof)) sizeobbyte = sizeofitem;

                        if(i < headers.length - 1){
                            createTodos += headers[i] + ` varchar(`+sizeobbyte+`) not null,`;
                        }
                        else{
                            createTodos += headers[i] + ` varchar(`+sizeobbyte+`) not null);`;
                        }
                    }
                    //console.log(createTodos);
                    
                    myconnection.query(createTodos, function(err, results, fields) {
                        if (err) {
                            // req.flash('error', err)
                            // res.render('databases/import', {
                            //     title: 'Import Tables from Xlsx files',
                            //     selecteddb : '',
                            //     dbname: '',
                            //     databases : []
                            // })
                            console.log(createTodos);
                        }
                        else{
                            // console.log('cnt =>' + cnt);
                            // console.log('itemlength =>' + headers.length);
                            // if(cnt == headers.length - 1){
                            //     myconnection.end(function(err) {
                            //         if (err) {
                            //             return console.log(err.message);
                            //         }
                            //     });
                            //     req.flash('success', 'Tables Imported Successfully into database '+dbname+'!');
                            //     res.render('databases/import', {
                            //         title: 'Import Tables from Xlsx files',
                            //         selecteddb : '',
                            //         dbname: '',
                            //         databases : databases
                            //     })
                            // }
                            cnt++;
                        }
                        
                        
                    });
                });
                
                
            });

            
        }
    })
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