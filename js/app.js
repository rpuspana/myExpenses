/*
 * Developed by Radu Puspana
 * Date August 2017
 * Version 1.0
 */

// module that handles the budget data using the module pattern
// this controller keeps track of all the income, expenses, the budget itself, and
// also the percentage of how much an income/expense represents of the total budget
var budgetController = (function() {

    // private Expense constructor
    var prvExpense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
    };

    // private Income constructor
    var prvIncome = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // object for storing instances of prvExpense, prvIncome, totalExpenses, totalIncomes
    // every expense entered in the UI will map to an instance of prvExpense
    // every income entered in the UI will map to an instance of prvIncome
    var prvData = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            totalExpenses: 0,
            totalIncomes: 0
        }
    };

    return {

        // pubic method for creating a new Expense or Income instance based on user input from the UI,
        // add it to the exp or inc array of prvData.allItems, and return the new instance created
        pblAddItem: function(type, descripton, value) {

            // new reference to a new intance of prvExpense or prvIncome
            var newItem;

             // create a unique id to put in each prvExpense or prvIncome item
            var id;

            id = prvData.allItems[type].length > 0 ? prvData.allItems[type][prvData.allItems[type].length - 1].id + 1 : 0;

            // create new instance of prvExpense or prvIncome based on the type parameter
            if(type === "exp") {
                newItem = new prvExpense(id, descripton, value);
            } else if (type === "inc") {
                newItem = new prvIncome(id, descripton, value);
            }

            // object[property]
            // add expense/income to the prvData.allItems[exp] or prvData.allItems[inc] array
            // based on the type parameter
            prvData.allItems[type].push(newItem);

            // return new instance of prvExpense or prvIncome
            return newItem;
        },

        pblTestGetDataStr: function() {
            console.info("prvData.allItems = %O", prvData.allItems);
        }
    }

})();


// UI module manipulates the UI of the app
var uiController = (function() {

    // private object containing the class names used in index.html and style.css
    var prvDOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list"
    };

    return {
        // public method to retrieve and return all three field values as strings from the UI
        pblGetInput: function() {

            // return an object with all three fields values as strings from the UI
            return {
                // return "inc" or "exp" from the transaction type list
                type: document.querySelector(prvDOMstrings.inputType).value,

                // return the transaction description as string
                description: document.querySelector(prvDOMstrings.inputDescription).value,

                // return the transaction value as a string
                value: document.querySelector(prvDOMstrings.inputValue).value
            };
        },

        // public method for listing a transaction entered by the user as input, under the Expense or Income column
        // transcation  Expense/Income instance  trasaction entered by the user
        // type  String  type of transaction: income/expense
        pblAddListItem: function(transcation, type, utcTimeAndDate) {

            // html code of a transaction list item to be added with dummy code for the transaction's HTML id, description and value
            var transactionListItem;

            // html code of a transaction list item to be added with value from the transaction parameter for the item's HTML id, description and value
            var newTransactionListItem;

            // HTML class of the father element of the income or expense list
            var transListRootElemClass;

            // if the type of transaction is an income
            if (type === "inc") {
                // transaction list item HTML code with dummy values for:
                // - transaction's HTML id (income-%id%),
                // - the transaction description (%description%),
                // - transaction's value(%value%)
                transactionListItem = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                transListRootElemClass = prvDOMstrings.incomeContainer;
            }
            // if the type of transaction is an expense
            else if (type === "exp") {

                transactionListItem = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                transListRootElemClass = prvDOMstrings.expenseContainer;
            }

            // replace the dummy text in transactionListItem with actual data from the transaction object
            newTransactionListItem = transactionListItem.replace("%id%", transcation.id);
            newTransactionListItem = newTransactionListItem.replace("%description%", utcTimeAndDate + transcation.description);
            newTransactionListItem = newTransactionListItem.replace("%value%", transcation.value);

            // select the transacton column father HTML element and insert the new transaction as it's first child
            // Note - the newest transaction will be placed at the end of the income or expense column
            document.querySelector(transListRootElemClass).insertAdjacentHTML("beforeend", newTransactionListItem);
        },

        // public method for returning the object containing the class names
        // in the index.html and style.css
        pblGetDOMstrings: function() {
            return prvDOMstrings;
        },

        // clear the the transaction's details from the transaction form on the UI (after the user submited the transaction)
        pblClearTransFormFields: function() {
            // NodeList instance that includes the transaction's description and value UI fields
            var transFormDescAndValueFieldsNl;

            // Array instance of the transaction's description and value fields from the UI
            var transFormDescAndValueFieldsArray;

            // get the trasaction's description and value from the UI's input form
            transFormDescAndValueFieldsNl = document.querySelectorAll(prvDOMstrings.inputDescription + "," + prvDOMstrings.inputValue);

            // transform the descAndValueNodeList NodeList into an array
            transFormDescAndValueFieldsArray = Array.prototype.slice.call(transFormDescAndValueFieldsNl);

            // call the annonymous function on each element of the transFormDescAndValueFieldsArray array.
            // result : in the UI, clear the transaction's description and value in the transaction input form
            transFormDescAndValueFieldsArray.forEach(function(currentElem, currentElemIndex, array) {
                currentElem.value = "";
            });

            // put the focus back on the transaction description field on the transaction input form
            transFormDescAndValueFieldsArray[0].focus();
        }
    }

})();


// App controller for communicating between the budgetController and the UIconroller
var controller = (function(budgetCtrl, UIctrl) {

    // private function to place the event listeners and the HTML tags' classes
    var prvSetupEventListeners = function() {

        // object containing the class names in the index.html and style.css
        var DOMstrings = uiController.pblGetDOMstrings();

        // register click event for the button with the tick sign
        document.querySelector(DOMstrings.inputButton).addEventListener("click", prvCtrlAddItem, false);

        // register Enter keypress event for the global object. Used only for the ENTER key
        document.getElementById("enterSum").addEventListener("keypress", function(event) {

            // use event.which to assure comptatibility with IE 9..11, Edge 14, UC Browser for Android 11.4
            // code 13 is returned when the "ENTER" key is pressed
            if (event.key === "Enter" || event.which === 13) { prvCtrlAddItem(); }

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

        // calculate the budget taking into account the submited transaction

        // return the new budget

        // display the newly calculated budget on the UI

    };

    // private function for receiving the user input from the UI,
    // entering the new transaction under the income or expense column on the UI, adjusting the budget according to the user's transaction
    var prvCtrlAddItem = function() {
        var userInput, newTransaction, localTimeAndDate;

        console.log("You pressed enter and an item will be added to one of the tables and the budget will be updated");

        // get the user input data from the UI. This input will be called a transcation
        userInput = uiController.pblGetInput();
        console.log("userInput = %O", userInput);

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

        // calculate the budget and displai it on the UI
        prvUpdateBudget();

    };

    return {
        initialiseVarsAndEvents: function() {
            console.log("App has started.");
            prvSetupEventListeners();
        }
    }

})(budgetController, uiController);

// Global execution scope
controller.initialiseVarsAndEvents();
