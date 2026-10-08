class GetSpecializationsController {

  constructor(inventoryRepository){
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req,res){

    try{

      const result =
        await this.inventoryRepository.getSpecializations();

      if(!result.length){
        return res.status(404).send({
          message: "No specializations found"
        });
      }

      return res.send(result);

    }catch(err){

      console.log(err);
      return res.status(500).send({
        message:"Internal Server Error"
      });
    }
  }
}

module.exports = GetSpecializationsController;