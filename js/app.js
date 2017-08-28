/*
 * Developed by Radu Puspana
 * Date August 2017
 * Version 1.0
 */

// module that handles the budget data using the module pattern
// IFEE creates a new scope. IFEE creates a closure for the vars/functions/objects
var budgetController = (function() {

    // some code

})();


// UI module manipulates the UI of the app
var uiController = (function() {

    // some code

})();


// App controller for communicating between the budgetController and the UIconroller
var controller = (function(budgetCtrl, UIctrl) {

    document.querySelector(".add__btn").addEventListener("click", function() {
        console.log("button with .add__btn was clicked");

        // get the field input data(expense or income)
        // add the item to the budget controller
        // add the new item to the UI
        // update the budget taking into account the expense/budget just entered
        // display the newly calculated budget on the UI
    }, false);

    // click event happens on the page, not on a specific elem. Used only for the ENTER key
    document.addEventListener("keypress", function(event) {

    }, false);

})(budgetController, uiController);
