class HuggingFaceController {

  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req, res) {

    try {

      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).send({
          message: "Prompt is required"
        });
      }

      console.log("Received prompt:", prompt);
const imageUrl = await this.inventoryRepository.generateText({ prompt });

return res.send({
  message: "Image generated",
  data: imageUrl
});

    } catch (err) {

      console.log(err);

      return res.status(500).send({
        message: "Error generating text"
      });

    }
  }
}

module.exports = HuggingFaceController;