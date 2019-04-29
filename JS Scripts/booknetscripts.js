/*
This is the Javascript code that is run on the Client side
All of the functions used by the client are put into this file
*/

/*
Used by Booknet, Shop, Sell, SearchResults, Account
Returns the cookie value of cname
*/
function getCookie(cname) {
  var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/*
Used by Booknet, Shop, Sell, SearchResults
Returns whether or not user is signed in
If signed in, adds sign out button and adds link to user account
*/
function checkSignIn(){
  if (getCookie("signedin") == "true"){
    changeSignIn();
    return true;
  }
  return false;
}

/*
Used by Booknet, Shop, Sell, SearchResults, SignInSuccessful, Account
When sign out button is clicked, this function signs user out and changes webpage to the homepage
*/
function signOut(){
  document.cookie = "signedin=false" + ';';
  document.getElementById("signin").href = "/SignIn";
  document.getElementById("signin").innerHTML = 'Sign In';
  document.getElementById("bottom").innerHTML = '';
  var xhttp = new XMLHttpRequest();
  location.assign("/");
}

/*
Used by Booknet, Shop, Sell, SearchResults, SignInSuccessful, Account
Adds link to user account and sign out button
*/
function changeSignIn(){
  var username = getCookie("username");
  document.getElementById("signin").href = "/Account";
  document.getElementById("signin").innerHTML = username;
  document.getElementById("bottom").innerHTML = '<button onclick="signOut()">Sign Out</button>';
}

/*
Used by SignInSuccessful
Signs user in, adds link to user account and sign out button
*/
function signedIn(){
  document.cookie = "signedin=true" + ';';
  changeSignIn();
}

/*
Used by SignIn, SignInFailed
Stores username and password in the cookie
*/
function createCookie(){
  document.cookie = "username=" + document.getElementById("username").value + ';';
  document.cookie = "password=" + document.getElementById("password").value + ';';
}

/*
Used by Account
Adds link to user account and sign out button, then posts username and password to server in order 
to retrieve the user's textbook listings and outputs the response
*/
function signIn(){
  changeSignIn();
  var username = getCookie("username");
  var password = getCookie("password");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("NoListings").innerHTML = this.responseText;
    }
  };
  xhttp.open("POST", "/Account", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("username=" + username + "&password=" + password);
}

/*
Used by Shop, Sell, SearchResults
Validates that the isbn input is 10-13 digits
If isbn is not, outputs a message and returns false
*/
function validateISBN() {
  var isbn = document.getElementById("isbn").value;
  if (isbn.length < 10 || isbn.length > 13) {
    alert("Please enter a valid ISBN.");
    return false;
  }
  return true;
}


/*
Used by Sell
If signed in, adds sign out button and adds link to user account
and sets input value of seller in /Sell to the username of the user
*/
function setSeller(){
  checkSignIn();
  if (getCookie("signedin") == "true"){
    var username = getCookie("username");
    document.getElementById("seller").value = username;
  }
}


/*
Used by Sell
Returns true if user is signed in and has entered a valid isbn
*/
function validateSellForm(){
  if (!checkSignIn()){
    alert("Make sure you are signed in.");
    return false;
  }
  if(!validateISBN()){
    alert("Please enter a valid ISBN.");
    return false;
  }
  return true;
}

/*
Used by SearchResults
If signed in, changes a textbooks status to 'Sold'
*/
function buyTextbook(textbookID){
  if (checkSignIn()){
    window.location.assign("/Shop/BuyTextbook?textbookID=" + textbookID);
  }
  else{
    alert("You must be signed in to make a purchase.")
  }
}

/*
Used by CreateAccount
Checks if passwords match
*/
function validatePasswords(){
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmpassword").value;
  if (confirmPassword != password){
    document.getElementById("passwordsmatch").innerHTML = "The passwords do not match.";
  }
  else{
    document.getElementById("passwordsmatch").innerHTML = "";
  }
}
