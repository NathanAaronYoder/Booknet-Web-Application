/*
This is the Backend code for Booknet
*/

var express = require('express');
var app = express();
var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
//var io = require('socket.io')(http);

//Checks to see if the pathname is a proper pathname
function inPathArray(pathname){
    var paths = ['Shop', 'SignIn', 'Sell', 'CreateAccount','Account'];
	for (var i = 0; i < paths.length; i++){
		if (pathname == paths[i]){
			return true;
		}
	}
	return false;
}

/*
Returns a string of table html data from a mysql query of the Textbooks table.
Used for searching for a textbook
*/
function dataToTable(result) {
	var a = ["Textbook","Seller","Price","ISBN"];
    var returnTrue = false;
	var table = "<table><tr><th>Textbook</th><th>Seller</th><th>Price ($)</th><th>ISBN</th><th>Purchase</th></tr>";
    for (var i = 0; i < result.length; i++) {
        if(result[i]["Status"] == "Listed"){
            returnTrue = true;
            table += "<tr>";
            for (var j = 0; j < a.length; j++) {
                table += "<td>" + result[i][a[j]] + "</td>";
            }
            table += "<td><button onclick='buyTextbook(" + result[i]['ID'] + ")'>Buy Textbook</button></td>";
            table += "</tr>";
        }
	}
	table += "</table></div><div id='bottom'></div></body></html>";
    if (!returnTrue){
        table = "<p>Sorry, no results matched your search.</p></div><div id='bottom'></div></body></html>";
    }
    return table;
}

/*
Returns a string of html data from a mysql query of the Users table
Not currently being used
*/
function accountData(result){
    var accountInfo = ["FirstName", "LastName", "Username", "Password", "Email"];
    var accountTitles = ["First name", "Last name", "Username", "Password", "Email"];
    var accountData = '';
    for(var i = 0; i < accountInfo.length; i++){
        accountData += '<p>' + accountTitles[i] + ': ' + result[0][accountInfo[i]];
    }
    return accountData;
}

/*
Returns a string of html data from a mysql query of the Users table
Used for getting the current textbook listings of a user
*/ 
function accountListings(result){
    var a = ["Textbook","Price","ISBN","Status"];
    var table = "<table><caption>Your Current Listings<tr><th>Textbook<th>Price ($)<th>ISBN<th>Status";
    for (var i = 0; i < result.length; i++) {
        table += "<tr>";
        for (var j = 0; j < a.length; j++) {
            table += "<td>" + result[i][a[j]] + "</td>";
        }
        table += "</tr>";
    }
    return table;
}

/*
Returns a mysql connection
*/
function mySqlDatabase()
{
	return mysql.createConnection({
		host: "localhost",
		port: "3306",
		user: "root",
		password: Password,
		database: "BooknetDB"
	});
}

//Response for homepage request
app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'Html Files/Booknet.html'));
	console.log('Get Request for /');
});

//Response for homepage request
app.get('/:path', function(req, res){
    if (inPathArray(req.params.path)){
        res.sendFile(path.join(__dirname, 'Html Files/' + req.params.path + '.html'));
        console.log('Get Request for ' + req.params.path);
    }
    else{
        res.send("Sorry, we can't find that.");
    }
});

//Response for CSS file
app.get('/CSSFiles/booknet.css', function(req, res){
    res.sendFile(path.join(__dirname, 'CSS Files/booknet.css'));
});

//Response for Client Side JavaScript
app.get('/JSScripts/booknetscripts.js', function(req, res){
    res.sendFile(path.join(__dirname, 'JS Scripts/booknetscripts.js'));
});

//Response for Booknet Image
app.get('/Images/Booknet.png', function(req, res){
    res.sendFile(path.join(__dirname, 'Images/Booknet.png'));
});

/*
  io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
*/

//Response for Sign In
app.post('/', function(req, res, next) {
    console.log("POST Request to /");
    var connection = mySqlDatabase();
    var sql = "SELECT * FROM Users WHERE Username = ? AND Password = ?";
    var post = [
        req.body.username,
        req.body.password
    ];
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        if (result != "")
        {
            res.sendFile(path.join(__dirname, "Html Files/SignInSuccessful.html"));
        }
        else{
            res.sendFile(path.join(__dirname, "Html Files/SignInFailed.html"));
        }
    });
});

//Response for User Textbook Listings
app.post('/Account', function(req, res, next) {
    console.log("POST Request to /Account");
    var connection = mySqlDatabase();
    var sql = "SELECT * FROM Textbooks WHERE Seller = ?";
    var post = [req.body.username];
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        //res.send((accountData(result)));
        if (result != ""){
            res.send((accountListings(result)));
        }
        else{
            res.send("<p>You do not have any listings at the moment.");
        }
    });
});

//Response for Creating an Account
app.post('/SignIn', function(req, res, next) {
    console.log("POST Request to /SignIn");
    var connection = mySqlDatabase();
    var sql = "";
    var post = {};

    sql = "SELECT * FROM Users WHERE Username = ? OR Email = ?";
    post = [
        req.body.username,
        req.body.email
    ];
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        if (result != ""){
            res.sendFile(path.join(__dirname, 'Html Files/CreateAccountError.html'));
        }
        else{
            sql = "INSERT INTO Users SET ?";
            post = {
                FirstName: req.body.firstname,
                LastName: req.body.lastname,
                Username: req.body.username,
                Password: req.body.password,
                Email: req.body.email
            };
            connection.query(sql, [post], function(err, result) {
                if(err) throw err;
                console.log("Insert Successful");
                res.sendFile(path.join(__dirname, 'Html Files/SignIn.html'));
            });
        }
    });
});

//Response for Creating a Textbook Listing
app.get('/Sell/Textbook', function(req, res) {
    console.log("GET Request to /Sell/Textbook");
    var connection = mySqlDatabase();
    var sql = "INSERT INTO Textbooks SET ?";
    var post = {
    	Textbook: req.query.textbook,
    	Seller: req.query.seller,
    	Price: req.query.price,
    	ISBN: req.query.isbn,
        Status: 'Listed'
    };
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        console.log("Insert Successful");
        res.sendFile(path.join(__dirname, 'Html Files/SellSuccessful.html'));
    });
});

//Response for Searching for a Textbook
app.get('/Shop/Textbook', function(req, res) {
    console.log("GET Request to /Shop/Textbook");
    var connection = mySqlDatabase();
    var sql = "SELECT * FROM Textbooks WHERE ?";
    var post = {Textbook: req.query.textbook};
    var html ='';
    fs.readFile(path.join(__dirname, "Html Files/SearchResults.html"), 'utf8', function(err, data){
        html += data;
    });
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        if(result != ""){
            html += dataToTable(result);
        }
        else{
            html += "<p>Sorry, no results matched your search.</p></div><div id='bottom'></div></body></html>"
        }
        res.send(html);
    });
});

//Response for Searching for a Textbook by ISBN
app.get('/Shop/Isbn', function(req, res) {
    console.log("GET Request to /Shop/Isbn");
    var connection = mySqlDatabase();
    var sql = "SELECT * FROM Textbooks WHERE ?";
    var post = {ISBN: req.query.isbn};
    var html ='';
    fs.readFile(path.join(__dirname, "Html Files/SearchResults.html"), 'utf8', function(err, data){
        html += data;
    })
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        if(result != ""){
            html += dataToTable(result);
        }
        else{
            html += "<p>Sorry, no results matched your search.</p></div><div id='bottom'></div></body></html>"
        }
        res.send(html);
    });
});

//Response for Buying a Textbook
app.get('/Shop/BuyTextbook', function(req, res) {
    console.log("GET Request to /Shop/BuyTextbook");
    var connection = mySqlDatabase();
    var sql = "UPDATE Textbooks SET Status = 'Sold' WHERE ?";
    var post = {ID: req.query.textbookID};
    connection.query(sql, post, function(err, result) {
        if(err) throw err;
        res.sendFile(path.join(__dirname, "Html Files/ShopPurchaseSuccessful.html"));
    });
});

//Start Server
app.listen(3000, function(){
  console.log('listening on *:3000');
});
