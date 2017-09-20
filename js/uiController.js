/*
 * Developed by Radu Puspana
 * Date August 2017
 * Version 1.0
 */


// UI module manipulates the UI of the app
var uiController = (function() {

    // private object containing the class names used in index.html and style.css
    var prvDOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income__value",
        expenseLabel: ".budget__expenses__value",
        expPercentTotalInc: ".budget__expenses__percentage",
        transactionContainer: ".container",
        expensePercentageLabel: ".item__percentage",
        errorPopupOKbutton: "err_alert_box_OK_button",
        errorPopupXbutton: "alert_box_x_button",
        popupContainer: "alertBox_container",
        popupButtonDiv: "alertBox_button_div",
        popupTextAndButtonContainer: "alertBox_text",
        popupMainDiv: "alertBox"
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

                // return the transaction value as a floating point number
                value: parseFloat(document.querySelector(prvDOMstrings.inputValue).value)
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
                transactionListItem = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                transListRootElemClass = prvDOMstrings.incomeContainer;
            }
            // if the type of transaction is an expense
            else if (type === "exp") {

                transactionListItem = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">---</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                transListRootElemClass = prvDOMstrings.expenseContainer;
            }

            // replace the dummy text in transactionListItem with actual data from the transaction object
            newTransactionListItem = transactionListItem.replace("%id%", transcation.id);
            newTransactionListItem = newTransactionListItem.replace("%description%", utcTimeAndDate + transcation.description);
            newTransactionListItem = newTransactionListItem.replace("%value%", transcation.value);

            // select the transacton column father HTML element and insert the new transaction as it's first child
            // the newest transaction will be placed at the end of the income or expense column
            document.querySelector(transListRootElemClass).insertAdjacentHTML("beforeend", newTransactionListItem);
        },

        // public method for returning the object containing the class names
        // in the index.html and style.css
        pblGetDOMstrings: function() {
            return prvDOMstrings;
        },

        // for each submited expense, display the percentage Of that expense out of the total income
        // expensePercentageTotalIncomeArray  Array instance  array with the expense percentages out of the total income for each expense
        pbldisplayPercentageOfExpenseOutOfTotalIncomeForAllExpenses: function(expensePercentageTotalIncomeArray) {

            var expensePercentageNodes;

            // select all the elements that have the item__percentage class
            expensePercentageNodes = document.querySelectorAll(prvDOMstrings.expensePercentageLabel);

            // display the expense percentage out of the total income in each NodeList with class prvDOMstrings.expensePercentageLabel
            // expensePercentageNode  NodeList instance  the DOM node that has the the class=prvDOMstrings.expensePercentageLabel
            // index                  Number             index of the current DOM node in the expensePercentageNodes
            var displayExpensePercentage = function(expensePercentageNode, index) {

                // if the expense percentage passed in as a parameter > 0
                if (expensePercentageTotalIncomeArray[index] > 0) {
                    expensePercentageNode.textContent = expensePercentageTotalIncomeArray[index] + "%";
                }
                else {
                    expensePercentageNode.textContent = "---";
                }
            }

            // if we found at least one element with HTML class prvDOMstrings.expensePercentageLabel in the DOM
            if (expensePercentageNodes.length > 0) {

                for(var i = 0; i < expensePercentageNodes.length; i++) {
                    displayExpensePercentage(expensePercentageNodes[i], i);
                }
            }
            // if no element with this class was found in the DOM
            else {
                console.log("The user did not submit any expenses yet, or there are no nodes, in the DOM,  with the attribute class=%s yet.\n" +
                             "Can't display expense percentage out of total income label.", prvDOMstrings.expensePercentageLabel);
            }

        },

        // public method for deleting a submited transaction from the income or expense column based it's type
        // transId  string  id value of the 4-th ancestor of the event target DOM element
        pblDeleteListItem :function(transId) {

            console.log("trans id = %s", transId);

            var deleteNode, fatherNode;

            // select the node to delete
            deleteNode = document.getElementById(transId);
            console.log("deleteNode = %O", deleteNode);

            // select the father of the node to delete
            fatherNode = deleteNode.parentNode;
            console.log("fatherNode = %O", fatherNode);

            // remove the node from the DOM tree
            console.info(fatherNode.removeChild(deleteNode));
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
        },

        // display on the UI the total income, the total expenses, the budget and
        // how much of the total income the expenses represent in percentages
        pblDisplayTransactionOverview: function(budgetObj) {

            // select the budget label on the UI
            document.querySelector(prvDOMstrings.budgetLabel).textContent = budgetObj.budget;

            // select the green background total income label on the UI
            document.querySelector(prvDOMstrings.incomeLabel).textContent = budgetObj.totalIncome;

            // select the red background total expenses label on the UI
            document.querySelector(prvDOMstrings.expenseLabel).textContent = budgetObj.totalExpenses;

            // select the expenses percent label to the right of the total expenses label on the UI
            var expensePercentTotalIncElem =  document.querySelector(prvDOMstrings.expPercentTotalInc);

            // if at least one income transaction was submited
            if (budgetObj.expensesPercentageIncome > 0) {
                expensePercentTotalIncElem.textContent = budgetObj.expensesPercentageIncome + "%";
            }
            // if there are no expsense transactions submited
            else {
                // replace 0% with "---" in the ".budget__expenses__percentage" <div>
                expensePercentTotalIncElem.textContent = "---";
            }
        },

        // create and display a custom popup window
        // text    String  body text to be displayed in the popup
        // type    String  type of popup to be displayed
        // height  String  height of the modal window
        pblConstructPopupAndRegisterItsEvents: function(text, type, height) {

            var button, buttonId, popupColor, popupNode, popupContainerOpeningDivsStr, popupContainerClosingDivsStr;

            popupContainerOpeningDivsStr = '<div id="alertBox"><div id="alertBox_container"><div id="alertBox_titlebar"><span>myExpenses</span><input id="alert_box_x_button" type="button" value="X"></div><div id="alertBox_text">';

            popupContainerClosingDivsStr = '</div></div></div>';

            if (type === "err") {
                button = '<div id="' + prvDOMstrings.popupButtonDiv + '"><input id="' +
                         prvDOMstrings.errorPopupOKbutton + '" class="button" type="button" value="OK" alt="OK"></div>';

                popupColor = "#D1363A";
                buttonId = prvDOMstrings.errorPopupOKbutton;
            }

            popupNode = popupContainerOpeningDivsStr + text + button + popupContainerClosingDivsStr;

            document.querySelector(prvDOMstrings.transactionContainer).insertAdjacentHTML("beforeend", popupNode);

            if (height !== undefined) {document.getElementById(prvDOMstrings.popupMainDiv).style.height = height;}
            document.getElementById(prvDOMstrings.popupContainer).style.backgroundColor = popupColor;

            // hide the custom popup when it's X button is clicked
            document.getElementById(prvDOMstrings.errorPopupXbutton).addEventListener("click", function() {
                    document.getElementById(prvDOMstrings.popupMainDiv).style.visibility = "hidden";
            });

            // hide the custom popup when it's OK button is clicked
            document.getElementById(buttonId).addEventListener("click", function() {
                    document.getElementById(prvDOMstrings.popupMainDiv).style.visibility = "hidden";
            });
        }
    }
})();

console.log("UI controller has finished loading.");
