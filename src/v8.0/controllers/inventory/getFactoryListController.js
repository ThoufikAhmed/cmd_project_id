class GetFactoryListController {

  constructor(inventoryRepository){
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req,res){

    try{

      const { location_name } = req.params;

      if(!location_name){
        return res.status(400).send({
          message:"location_name is required"
        });
      }

      const factoryList =
        await this.inventoryRepository.getFactoryList(location_name);

      if(!factoryList.length){
        return res.status(404).send({
          message:"No factory movements found"
        });
      }

      return res.send(factoryList);

    }catch(err){

      console.log(err);

      return res.status(500).send({
        message:"Internal Server Error"
      });
    }
  }
}

module.exports = GetFactoryListController;