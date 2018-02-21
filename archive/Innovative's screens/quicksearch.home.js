/*http://www.hamilton.edu/library/js/quicksearch.home.js*/


var strSelectedTab = 'ALEX';

function TabClick(strClickedTab)
{
  var divALEXControls = document.getElementById('divALEXControls');
  var divDatabasesControls = document.getElementById('divDatabasesControls');
  var divEJournalsControls = document.getElementById('divEJournalsControls');
  var divResearchAidsControls = document.getElementById('divResearchAidsControls');
  var divWebsiteControls = document.getElementById('divWebsiteControls');

  strSelectedTab = strClickedTab;
  divALEXControls.style.visibility = 'hidden';
  divDatabasesControls.style.visibility = 'hidden';
  divEJournalsControls.style.visibility = 'hidden';
  divResearchAidsControls.style.visibility = 'hidden';
  divWebsiteControls.style.visibility = 'hidden';
  eval('div' + strClickedTab + 'Controls').style.visibility = 'visible';
}
