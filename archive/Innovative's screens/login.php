<?php
include("header.php");

//session_unset(); for troubleshooting



include("functions.php");

$form_name = 'reserves_login';
$required_fields = 'lname,barcode';
$required_fields_nice = 'last name,barcode';
$optional_fields = '';

initialize_form($form_name, $required_fields, $required_fields_nice, $optional_fields);
$ff = simply_form($form_name);

echo"<h2>Reserves Management System</h2>";

display_message();



echo "<form method=\"post\" action=\"_login.php\" name=\"" . $form_name . "\">\n";
echo "<table><tbody>\n";


echo "<tr><td><strong>Last Name: </strong></td>";
echo "<td><input type=\"text\" name=\"lname\" size=\"25\" maxlength=\"35\" value=\"" . $ff['lname'] . "\" /></td></tr>\n";

echo "<tr><td><strong>Barcode: </strong><br>Your barcode is the series of digits underneath the barcode on your College ID Card.</td>";
echo "<td><input type=\"password\" name=\"barcode\" size=\"5\" maxlength=\"5\" value=\"" . $ff['barcode'] . "\" autocomplete='off' /></td></tr>\n";


echo "<tr><td colspan=\"2\"><input type=\"submit\" name=\"submit\" value=\"Submit\" /></td></tr>";
echo "</tbody></table>\n";
echo "</form>\n";


//include("footer.php"); for troubleshooting
?>

