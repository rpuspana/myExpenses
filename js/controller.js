/*
 * Developed by Radu Puspana
 * Date August 2017
 * Version 1.0
 */


// App controller for communicating between the budgetController and the UIconroller
var controller = (function(budgetCtrl, UIctrl) {

    // private function to place the event listeners and the HTML tags' classes
    var prvSetupEventListeners = function() {

        // object containing the class names in the index.html and style.css
        var DOMstrings = uiController.pblGetDOMstrings();

         // register click event for the input validation popup's X button
        document.getElementById("alertBox_close").addEventListener("click", function () {

            // hide the modal window when it's X button is clicked
            document.getElementById("alertBox_container").style.visibility = "hidden";
        });

        // add event listener for the .container div to catch the click event that bubbles up from the
        // .item__delete__btn <button> tag
        document.querySelector(DOMstrings.transactionContainer).addEventListener("click", prvDeleteItem);


        // register click event for the button with the tick sign
        document.querySelector(DOMstrings.inputButton).addEventListener("click", prvAddItem, false);

        // register Enter keypress event for the global object. Used only for the ENTER key
        document.getElementById("enterSum").addEventListener("keypress", function(event) {

            // use event.which to assure comptatibility with IE 9..11, Edge 14, UC Browser for Android 11.4
            // code 13 is returned when the "ENTER" key is pressed
            if (event.key === "Enter" || event.which === 13) { prvAddItem(); }

        }, false);
    };

    // get tine and date of the local time to record the creation of a transaction
    // return dateAndTime String time and date formated as YYYY-MM-DD HH:MM:SS local time
    // return String HH:MM  DD-MM-YYYY local time
    var prvGetLocalTimeAndDate = function() {
        var date = new Date;

        var hour = date.getHours();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var seconds = date.getSeconds();

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        var dateAndTime = "" + hour + ":" + minutes + ":" + seconds +
                          "  "  + day + "-" + month + "-" + year + "  ";

        return dateAndTime;
    }

    // calculate the budget based on the last submited or selected transaction and display it on the UI
    var prvUpdateBudget = function() {

        // object holding:
        // the budget after the last transaction, total expenses, total incomes,
        // how much of the budget in % the expenses represent
        var budgetIncExpExppercentage;

        // calculate the budget taking into account the submited transaction
        budgetController.pblCalculateBudget();

        // return the new budget
        budgetIncExpExppercentage = budgetController.pblGetBudgetExpIncExpPercentage();

        // display the newly calculated budget on the UI
        console.info(budgetIncExpExppercentage);
        uiController.pblDisplayTransactionOverview(budgetIncExpExppercentage);

    };

    // update the percentage value in the red box next to a submited expense transaction
    var prvUpdatePercentageSubmitedExpenses = function() {

        // for each submited expense, calculate how much it's value represents in %,
        // out of the total income
        budgetCtrl.pblSetPercentageOfExpenseOutOfTotalIncomeForEachExp();

        // read the percentages from the budget controller

        // update the UI with the new percentages
    };

    // private function for receiving the user input from the UI,
    // entering the new transaction under the income or expense column on the UI, a
    // djusting the budget according to the user's transaction
    var prvAddItem = function() {
        var userInput, newTransaction, localTimeAndDate;

        console.log("You pressed enter and an item will be added to one of the tables and the budget will be updated");

        // get the user input data from the UI. This input will be called a transcation
        userInput = uiController.pblGetInput();
        console.log("userInput = %O", userInput);

        // input form validation for the description and value fields
        if (userInput.description.trim().length > 2 && !isNaN(userInput.value) && userInput.value > 0) {

            // add the transaction to the budget controller
            newTransaction = budgetController.pblAddItem(userInput.type, userInput.description, userInput.value);
            console.info("newTransaction = %O", newTransaction);

            // TO BE REMOVED. Inspect the prvData structure
            budgetController.pblTestGetDataStr();

            localTimeAndDate = prvGetLocalTimeAndDate();

            // add the transaction to the UI in the Income or Expense comumn depending on the transaction's type
            uiController.pblAddListItem(newTransaction, userInput.type, localTimeAndDate);

            // after transaction submit, clear the transaction's details from the transaction input form
            uiController.pblClearTransFormFields();

            // calculate the budget and display it on the UI
            prvUpdateBudget();

            // for each submited expense transaction calculate how much this expense representes out of the total income
            prvUpdatePercentageSubmitedExpenses();
        }
        else {

             // HTML to replace the content(if any) of the alertBox_text div
            var modalWindowInnerHTML = "<p>The description should have at least three characters." +
                " The value should have at least one digit, excluding  0, before submiting the transaction.</p>";

            // display custom modal window with this text, type and width
            uiController.pblDisplayPopup(modalWindowInnerHTML, "err", "22%");

            // make the modal window visible
            document.getElementById("alertBox_container").style.visibility = "visible";
        }
    };

    // function for deleting a submited transaction from the income or expense columns
    // event   click event  an event that was fired up from below the .container div tag
    var prvDeleteItem = function(event) {

        var transactionIdStr, strList, transactionType, transactionIdNumber;

        console.info(event.target.parentNode.parentNode.parentNode.parentNode);

        // return <div class="item clearfix" id="income-0">...</div> when
        // the user clicks the .continer div and any of it's children
        // The instr is safe to use because in uiController.pblAddListItem() we used a <div>
        // structure that matches the instruction below to insert an income/expense trasaction
        // in the income/expense columns
        transactionIdStr = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // this will coert to true or false if an id attribute exists inside the node that transactionId points to
        if (transactionIdStr) {

            // transform the string primitive into an object and call the split method
            // return a list holding the trasaction type and the index of the trasaction in it's corresponding array
            strList = transactionIdStr.split("-");

            // select the trasacton's type
            transactionType = strList[0];

            // select the trasaction's id
            transactionIdNumber = parseInt(strList[1]);

            if (!isNaN(transactionIdNumber))
            {
                // delete the trasaction from the appropiate transaction array
                budgetCtrl.pblDeleteItem(transactionType, transactionIdNumber);

                // delete the transaction from the UI
                uiController.pblDeleteListItem(transactionIdStr);

                // update and show the new budget, total income, total expenses, expense percentage out of income
                prvUpdateBudget();
            }
            else {
                console.err("The value of the id attribute of %O, doesn't containg a number." +
                            "\nThe trasanction will not be removed from budgetController.prvData.allItems[%s]." +
                            "\nThe transaction will not dissapear from the UI." +
                            "\nThe financial situation overview panel from the UI will not change.", event.target.parentNode.parentNode.parentNode.parentNode,
                            transactionType);
            }

             // for each submited expense transaction calculate how much this expense representes out of the total income
            prvUpdatePercentageSubmitedExpenses();
        }
    };


    return {
        initialiseVarsAndEvents: function() {
            console.log("controller has finished loading.");
            prvSetupEventListeners();
        }
    }

})(budgetController, uiController);


// start the app
controller.initialiseVarsAndEvents();
