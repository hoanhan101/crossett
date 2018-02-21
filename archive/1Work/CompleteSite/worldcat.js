/*
 * Kat Berry 11/15/2007 Crossett Library, Bennington College:
 * "I took this file from http://libx.org/catalogs/worldcat.js,so that I can
 * load it onto our server, so our LibX toolbar can utilize this file in order to
 * provide access to the Worldcat Database. 
 * Thank you, Godmar, for creating this wonderful script."
 *
 *
 *
 * Demo for LibX's custom catalog functionality.
 *
 * This script is read whenever the user opens a new window.
 * It is recommended that you install it on a machine that can
 * handle this load, such as googlepages.com
 *
 * The entire JavaScript content is evaluated.  This evaluation
 * does not happen in a sandbox.  Therefore, be careful to not
 * configure your edition to draw catalogs from people you do not
 * trust.
 *
 * The object 'thisCatalog' is defined to refer to the catalog
 * instance being added. You must implement makeSearch and 
 * makeAdvancedSearch.
 * The properties url, name, and options are already set from 
 * your configuration file, and so are param0 to param19 if 
 * configured.
 *
 * Follow the examples in:
 * http://libx.org/libx/src/base/chrome/libx/content/libx/catalogs/
 * See http://libx.org/libx/src/base/documentation.txt for the
 * meaning of the search type field.
 *
 * Godmar Back, libx.org@gmail.com, Oct 2007.
 */

// path is not required, it's just a demonstration that you can add
// your own properties.
thisCatalog.path = '/search';   

thisCatalog.makeSearch = function(stype, sterm) {
    switch (stype) {
    case 'd':       // subject
        sterm = "su:" + sterm;
        break;
    case 't':       // title
        sterm = "ti:" + sterm;
        break;
    case 'a':       // author
        sterm = "au:" + sterm;
        break;
    }
    return this.url + this.path + "?q=" + sterm + "&qt=results_page";
};

thisCatalog.makeAdvancedSearch = function(fields) {
    var query = "";

    for (var i = 0; i < fields.length; i++) {
        var type = fields[i].searchType;
        var term = fields[i].searchTerms;
        switch (type) {
        case 'd':       // subject
            query += "su:" + term + " ";
            break;
        case 't':       // title
            query += "ti:" + term + " ";
            break;
        case 'a':       // author
            query += "au:" + term + " ";
            break;
        default:        // everything else
            query += term + " ";
        }
    }

    return this.url + this.path + "?q=" + query + "&qt=advanced";
};

// to add xISBN support, add
// thisCatalog.xisbn.opacid = ...
// read source for more information or ask.