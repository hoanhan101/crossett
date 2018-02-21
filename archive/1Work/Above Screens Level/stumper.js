/* =======================================================
Email Spider Stumper v3.1
last modified 13 Oct 2005
Developed by Scott Clark & Kevin Duhe
The Source is available at http://www.clarksco.com/blog/
Copyright 2005 Clark Consulting
======================================================= */

// There are three arguments being passed into this array.
// "theName" is the username (or the portion of the email address prior to the @.
// "theExtras" are items such as "?subject=blah".  Can be blank if you don't want to use this feature.
// "theLink" is the text for the link.  For example "Contact Us".  Can be blank if you don't want to use this feature.

function stumpIt(theName,theExtras,theLink) {
var theDomain ="bennington.edu";
var theEmail = theName+"@"+theDomain;
if (theName == ""){
	theName = "ERROR";
	theLink = "ERROR";
	myEmail = theName;
	myLink = theLink;
}else{
	if ((theExtras == "") && (theLink =="")){
		myEmail = theEmail;
		myLink = theEmail;
	}
	if ((theLink == "") && (theExtras != "")){
		myLink = theEmail;
		myEmail = theEmail+theExtras;
	}
	if 	((theLink != "") && (theExtras != "")){
		myLink = theLink;
		myEmail = theEmail+theExtras;
	}
	if 	((theLink != "") && (theExtras == "")){
		myLink = theLink;
		myEmail = theEmail;
	}
}
	document.write('<a href=mailto:' + myEmail + '>' + myLink + '</a>');
}