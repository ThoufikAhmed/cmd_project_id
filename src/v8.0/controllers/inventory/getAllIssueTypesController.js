class GetAllIssueTypesController {
  constructor (inventoryRepository) {
    this.inventoryRepository = inventoryRepository
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async execute (req, res) {
    try {
        console.log('Fetching all issue types')
      const issueTypes = await this.inventoryRepository.getAllIssueTypes()
      return res.status(200).json(issueTypes)
    } catch (error) {
      console.error('Error fetching issue types:', error)
      return res.status(500).json({ message: 'An unexpected error occurred.' })
    }
  }
}

module.exports = GetAllIssueTypesController
