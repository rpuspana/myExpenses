/*
 * Developed by Radu Nicolae Puspana
 * Copyright Radu Nicolae Puspana
 * Developed in 2017
 * Version 1.0
 */


var rpJSframework = (function() {

    // get the first occurance of a substring of length 3 in a string
    // number  Number  a number in the Arabic number system of base 10
    // return  first occurance of substring in string or null if the parameters are not ok
    var prvGetIndexOfSubstrThatMatchesRegex = function(numberAsString, regexPattern) {

        numberAsString = numberAsString.trim();

        if (numberAsString !== undefined && numberAsString.length > 0 && regexPattern !== null) {
            // return -1 or the position of the position of the non-numertic character
            return numberAsString.search(regexPattern);
        }
        else {
            return null;
        }
    };

    // get thousand separator from the user's system locale
    // return the user's system locale thousand separator, if not found return null
    var prvGetThousandSeparatorSystemLocale = function() {
        var number = 1234;
        var numberStr = number.toLocaleString();
        var regexPattern = /\W/; // = assume the thousand operator is just one character from [^A-Za-z0-9_]
        var thousandSeparatorIndex = prvGetIndexOfSubstrThatMatchesRegex(numberStr, regexPattern);

        if (thousandSeparatorIndex !== null) {
            if (thousandSeparatorIndex !== -1) {
                return (numberStr.charAt(thousandSeparatorIndex));
            }
        }

        // return null if the thousand separator(a single character) could not be found
        return null;
    };

    // get decimal separator from the user's system locale
    // return the user's system locale decimal separator
    var prvGetSystemLocaleSettingDecimalChr = function(){

        // based on the fact tha it will return 0.8
        return (1 - 0.2).toString().charAt(1);
    }

    // return a string representation of a number, foramted with a symbol for the thousands separator
    var prvFormatNumIntegerPart = function(num) {

        var formatedNumerIntegerPart, thousandSeparator, thousandSeparatorIndex,
            thousandSeparatorPositions;

        var numIntegerPart = Math.floor(num);
        var numIntegerPartString = numIntegerPart.toString();

         if (numIntegerPart.toString().length > 3) {

                thousandSeparatorIndex = numIntegerPartString.length;
                thousandSeparatorPositions = [];

                // set the thousand separator
                thousandSeparator = prvGetThousandSeparatorSystemLocale();
                if (!thousandSeparator) {
                    console.info("Could not get the system locale for the number thousand separator. Falling on default separator \",\"");
                    thousandSeparator = ",";
                }

                // move 3 digits at a time from  right to left the integer part of the number to format
                while (numIntegerPart.toString().length > 3) {

                    thousandSeparatorIndex = thousandSeparatorIndex - 3;
                    thousandSeparatorPositions.push(thousandSeparatorIndex);

                    numIntegerPart = Math.floor(numIntegerPart / 1000);
                }

                // initilally, the formated number will receive the most left one, two or three digits
                formatedNumerIntegerPart = numIntegerPart.toString();

                // take groups of 3 characters from the number parameter from left to right,
                // append a thousand separator in front of them and add the resulting 4 characters to the formatedNumerIntegerPart
                for (var i = thousandSeparatorPositions.length - 1; i > 0; i--)
                    formatedNumerIntegerPart = formatedNumerIntegerPart + thousandSeparator +
                                        numIntegerPartString.substring( thousandSeparatorPositions[i], thousandSeparatorPositions[i - 1]);

                // append to the formatedNumString the last 3 digits of the number given as parameter
                formatedNumerIntegerPart = formatedNumerIntegerPart + thousandSeparator +
                                    numIntegerPartString.substring(thousandSeparatorPositions[0], numIntegerPartString.length);

        }
        // if num's integer part has three digits or less
        else {
            formatedNumerIntegerPart = numIntegerPartString;
        }

        return formatedNumerIntegerPart;
    };

    // return the last two decimals of a number with at least two decimals.
    // If the number has just one decimal, return numDecimal0
    // If the number has no decimals, return "00"
    var prvReturnTheFirstTwoDecimalsOfNum = function(num) {

        var numToString = num.toString();
        var systemLocaleDecimalChr = prvGetSystemLocaleSettingDecimalChr();
        var indexOfDecimalInNum = numToString.indexOf(systemLocaleDecimalChr);
        var inputNumDecimals;

        // if the number has at least one decimal
        if (indexOfDecimalInNum !== -1) {

            decimalsOfNumStr = numToString.substring(indexOfDecimalInNum + 1, numToString.length);
            decimalsOfNumCount = decimalsOfNumStr.length;

            switch (decimalsOfNumCount) {
                // number has 1 decimal
                case 1:
                    inputNumDecimals = decimalsOfNumStr + "0";
                    break;
                // number has 2 decimals
                case 2:
                    inputNumDecimals = decimalsOfNumStr;
                    break;
                // number has three decimals or more
                default:
                    inputNumDecimals =  numToString.substring(indexOfDecimalInNum + 1, indexOfDecimalInNum + 3);
            }
        }
        // if the number doesn't have a decimal
        else {
            inputNumDecimals = "00";
        }

        return inputNumDecimals;
    };

    return {

        // get tine and date of the local time to record the creation of a transaction
        // return dateAndTime String time and date formated as YYYY-MM-DD HH:MM:SS local time
        // return String HH:MM  DD-MM-YYYY local time
        pblGetLocalTimeAndDate: function() {

            var date = new Date();

            var hour = date.getHours();
            var minutes = date.getMinutes();
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            var seconds = date.getSeconds();

            var year = date.getFullYear();
            var monthNumber = date.getMonth();
            var monthsName = ["January", "February", "March", "April", "May", "June",
                             "July", "August", "September", "October", "November", "December"]
            var day = date.getDate();

            var str = "" + hour + ":" + minutes + ":" + seconds +
                              "  "  + day + "-" + (monthNumber + 1)+ "-" + year + "  ";

            return {
                timeDateCustomFormat: str,
                currentMonthName: monthsName[monthNumber],
                yearNumber: year
            };
        },

        // count the number's decimals
        // number  Number  the number on which we will count the decimals
        // return the number's decimal count or 0 if the number doesn't have decimals;
        pblNumberDecimalCount: function(number) {
            var numberToStr = number.toString();
            var numberDecimalChrIndex = numberToStr.indexOf(prvGetSystemLocaleSettingDecimalChr());

            if (numberDecimalChrIndex !== -1) {
                return (numberToStr.substring(numberDecimalChrIndex + 1, numberToStr.length).length);
            }
            else {
                return 0;
            }
        },

        // Round the n-th decimal and drop the ones at the right.By default the resulting number will have just two decimals
        // number   Number  the floating point number to be rounded
        // return   Number  a floating point number with N decimals or 2 by default
        pblCutNdecimalsFromFloatNum: function(number, lastDecimalPosition) {
            var multiplier = Math.pow(10, lastDecimalPosition || 2)

            // round up the second digit based on the third, Math.round(), and shrink the num to just two decimals
            return (Math.round(number * multiplier) / multiplier);
        },

        // Format a number using the system locale settings for the thousand and decimal separators
        // defaults to EN number format(thousand separator "," ; decimal separator "."), if the app can't get these separators.
        // num       Number  number to format
        // return    String  a string with the formated number
        pblFormatNumberUsingSystemLocale: function(num) {
            var formatedNumberIntegerPart, firstTwoDecimalsOfNum, formatedNumber;

            formatedNumberIntegerPart = prvFormatNumIntegerPart(num);

            firstTwoDecimalsOfNum = prvReturnTheFirstTwoDecimalsOfNum(num);

            formatedNumber = formatedNumberIntegerPart + prvGetSystemLocaleSettingDecimalChr() + firstTwoDecimalsOfNum;

            return formatedNumber;
        }
    }
})();

console.log("library.js has finished loading.");
