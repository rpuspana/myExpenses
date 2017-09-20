/*
 * Developed by Radu Puspana
 * Date August 2017
 * Version 1.0
 */


// App controller for communicating between the budgetController and the UIconroller
var controller = (function(budgetCtrl, UIctrl) {

    // private function to place the event listeners and the HTML tags' classes
    var prvSetupEventListeners = function(event) {

        // object containing the class names in the index.html and style.css
        var nodeClassAndIdValues = uiController.pblGetDOMstrings();

        // add event listener for the .container div to catch the click event that bubbles up from the
        // .item__delete__btn <button> tag
        document.querySelector(nodeClassAndIdValues.transactionContainer).addEventListener("click", function(event) {

            // if the user didn't click on one of the buttons to close the custom popup window for invalid input
            if (event.target.id !== nodeClassAndIdValues.errorPopupOKbutton &&
                event.target.id !== nodeClassAndIdValues.errorPopupXbutton) {
                prvDeleteItem(event);
            }
        });

        // register click event for the button with the tick sign
        document.querySelector(nodeClassAndIdValues.inputButton).addEventListener("click", prvAddItem, false);

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

        var expensePercentageOutOfTotalIncomeArray;

        // for each submited expense, calculate how much it's value represents in %,
        // out of the total income
        budgetController.pblSetPercentageOfExpenseOutOfTotalIncomeForEachExp();

        // store this values in an array
        expensePercentageOutOfTotalIncomeArray = budgetController.pblGetPercentageOfExpenseOutOfTotalIncomeForEachExp()

        // for each submited expense in the UI update the expense percentage
        console.log(expensePercentageOutOfTotalIncomeArray);
        uiController.pbldisplayPercentageOfExpenseOutOfTotalIncomeForAllExpenses(expensePercentageOutOfTotalIncomeArray);
    };

    var prvIsSubmitedTransactonValid = function(userInput) {
        if (
            userInput.description.trim().length >= 3 &&
            !isNaN(userInput.value) &&
            userInput.value > 0 &&
            rpJSframework.pblNumberDecimalCount(userInput.value) <= 2
        ) {
                return true;
        }
        else {
            return false;
        }
    };

    // private function for receiving the user input from the UI,
    // entering the new transaction under the income or expense column on the UI, a
    // djusting the budget according to the user's transaction
    var prvAddItem = function() {
        var userInput, newTransaction, domNodeClassAndIdValues, localTimeAndDate;

        domNodeClassAndIdValues = uiController.pblGetDOMstrings();

        console.log("You pressed 'Enter'.The transaction is being validated...");

        // get the user input data from the UI. This input will be called a transcation
        userInput = uiController.pblGetInput();
        console.log("userInput = %O", userInput);

        // input form validation for the description and value fields
//        if (userInput.description.trim().length > 2 && !isNaN(userInput.value) && userInput.value > 0) {
        if (prvIsSubmitedTransactonValid(userInput)) {

            // create an Expense or Income object and add the object to the appropiate array
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
            console.log("Transaction input not valid. Display error popup")
            // select the popup node from in the DOM
            popupNode = document.getElementById(domNodeClassAndIdValues.popupMainDiv);

            // if popupNode = null it means it was not added to the DOM
            if (!popupNode) {
                 // text of the popup to be displayed
                var popupText =
                    "<h3>Transaction invalid input error</h4>" +
                    "<p>The following fields need input adjustment before submiting again:</p>" +
                    "<p>Transaction description: A mandatory text of at least three characters long</p>" +
                    "<p>Transaction value: A mandatory number greater than 0 with two decimals at most</p>";

                // display the popup and register button events
                uiController.pblConstructPopupAndRegisterItsEvents(popupText, "err", "22%");

                // make the popup visible
                popupNode = document.getElementById(domNodeClassAndIdValues.popupMainDiv);
                popupNode.style.visibility = "visible";
            }
            else {
                if (popupNode.style.visibility === "hidden") {
                    popupNode.style.visibility = "visible";
                }
            }
        }
    };

    // function for deleting a submited transaction from the income or expense columns
    // event   click event  an event that was fired up from below the .container div tag
    var prvDeleteItem = function(event) {

        var transactionIdStr, strList, transactionType, transactionIdNumber, domClassesIds;

        console.info("event.target = %O", event.target);
        console.info("event.target 4th parent = %O", event.target.parentNode.parentNode.parentNode.parentNode);

        domClassesIds = uiController.pblGetDOMstrings();

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

            if (!isNaN(transactionIdNumber)) {
                // delete the trasaction from the appropiate transaction array
                budgetCtrl.pblDeleteItem(transactionType, transactionIdNumber);

                // delete the transaction from the UI
                uiController.pblDeleteListItem(transactionIdStr);

                // update and show the new budget, total income, total expenses, expense percentage out of income
                prvUpdateBudget();

                // for each submited expense transaction calculate how much this expense representes out of the total income
                prvUpdatePercentageSubmitedExpenses();
            }
            else {
                console.error("The value of the id attribute of %O, doesn't containg a number." +
                            "\nThe trasanction will not be removed from budgetController.prvData.allItems[%s]." +
                            "\nThe transaction will not dissapear from the UI." +
                            "\nThe financial situation overview panel from the UI will not change.", event.target.parentNode.parentNode.parentNode.parentNode,
                            transactionType);
            }
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
