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

    var ctrlAddItem = function() {
        // get the field input data(expense or income)
        // add the item to the budget controller
        // add the new item to the UI
        // update the budget taking into account the expense/budget just entered
        // display the newly calculated budget on the UI
        console.log("You pressed enter and an item will be added to one of the tables and the budget will be updated")
    }

    // register click event for the button with the tick sign
    document.querySelector(".add__btn").addEventListener("click", ctrlAddItem, false);

    // register Enter keypress event for the global object. Used only for the ENTER key
    document.addEventListener("keypress", function(event) {

        // use event.which to assure comptatibility with IE 9..11, Edge 14, UC Browser for Android 11.4
        // code 13 is returned when the "ENTER" key is pressed
        if (event.key === "Enter" || event.which === 13) { ctrlAddItem(); }
    }, false);

})(budgetController, uiController);
