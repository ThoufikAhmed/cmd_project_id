/**
 * @module utils/epcDecoder
 */

/**
 * This method converts an EPC to its corresponding GTIN 14
 * @name convertEPCToGTIN
 * @function
 * @instance
 * @memberof module:utils/epcDecoder
 * @param {String} epc The electronic product code
 * @returns {String}
 */
const convertEPCToGTIN = (epc) => {
  // Converting the hexadecimal epc to binary format
  const epcInBinary = epc.split('').map(character => parseInt(character, 16).toString(2).padStart(4, '0')).join('')

  const partitionInBinary = epcInBinary.substring(11, 14)
  const partitionValue = parseInt(partitionInBinary, 2)

  // The partition value for SGTIN ranges from 0 to 6
  if (partitionValue < 0 || partitionValue > 6) {
    throw new Error(`Invalid EPC found: ${epc} - Partition value out of bounds`)
  }

  // The number of digits in the item reference is based on SGTIN Partition Values
  const numberOfDigitsInItemRef = partitionValue + 1

  const companyPrefixInBinary = epcInBinary.substring(14, 34)
  const itemReferenceInBinary = epcInBinary.substring(34, 58)

  const companyPrefix = parseInt(companyPrefixInBinary, 2)
  const itemReferenceValue = parseInt(itemReferenceInBinary, 2).toString().padStart(numberOfDigitsInItemRef, '0')

  const indicatorDigit = itemReferenceValue.substring(0, 1)
  const itemReference = itemReferenceValue.substring(1)

  const gtinWithoutCheckDigit = `${indicatorDigit}${companyPrefix}${itemReference}`

  const checkDigit = calculateCheckDigitForGTIN(gtinWithoutCheckDigit)
  const gtin = `${gtinWithoutCheckDigit}${checkDigit}`

  return gtin
}

/**
 * @name calculateCheckDigitForGTIN
 * @function
 * @instance
 * @memberof module:utils/epcDecoder
 * @param {String} gtin The GTIN without the check digit
 * @returns {Number}
 */
const calculateCheckDigitForGTIN = (gtin) => {
  const multiplicationValues = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3]
  let sumOfValues = 0
  for (var index in gtin) {
    const character = gtin[index]
    const digit = parseInt(character)
    const multipliedValue = digit * multiplicationValues[index]
    sumOfValues += multipliedValue
  }

  if (sumOfValues <= 10) {
    return 10 - sumOfValues
  }

  const roundToNearestTen = Math.round(sumOfValues / 10) * 10

  // The check digit is calculated by subtracting the sum of values from the nearest higher multiple of 10
  const checkDigit = roundToNearestTen < sumOfValues ? 10 - Math.abs(roundToNearestTen - sumOfValues) : Math.abs(roundToNearestTen - sumOfValues)
  return checkDigit
}

module.exports = {
  convertEPCToGTIN
}
