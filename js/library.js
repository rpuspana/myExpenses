/*
 * Developed by Radu Puspana
 * Date August 2017
 * Version 1.0
 */


// Round the n-th decimal of a float number
// number        Number  the floating point number to be rounded
// decimalIndex  Number  the decimal position to be rounded
//   E.g  decimalIndex = 1, the first decimal will be rounded
//   E.g  decimalIndex = 2, the second decimal will be rounded
// return        Number  a floating point number with the required decimal rounded
function roundDecimal(number, decimalIndex) {
    var multiplier = Math.pow(10, decimalIndex || 0);
    return Math.round(number * multiplier) / multiplier;
}

console.log("Library has finished loading.");
