class BaseEntity {
  /**
   * This class is a super class that is to be inherited from
   * It will contain all common functionality for entities.
   */

  /**
   * Function that will get all enumerable properties of the inheriting class
   * and determine whether any of the properties are null or undefined.
   * If any such properties exist, it returns false
   * @returns {Boolean}
   */
  isValid () {
    const properties = Object.getOwnPropertyNames(this)
    const propertyValues = properties.map(property => this[property])
    return propertyValues.reduce((acc, curr) => {
      if (curr instanceof BaseEntity) {
        return acc && curr.isValid()
      }
      const isCurrentDefined = ((curr !== null) && (curr !== undefined))
      return acc && isCurrentDefined
    }, true)
  }

  /**
   * Function that must be implemented by all extending classes
   * If the method on the base class is called, it will throw an error
   */
  constructMock () {
    throw new Error('This method needs to be implemented on the extending class')
  }
}

module.exports = BaseEntity
