class FactoryMovementController {

 constructor(inventoryRepository){
   this.inventoryRepository = inventoryRepository;
 }

 async execute(req,res){

   try{
    const createdBy = req.user?.id
    if (!createdBy) {
      return res.status(401).send({ message: 'Unauthorized' })
    }

    const payload = {
      ...req.body,
      created_by: createdBy
    }

    console.log('Received factory movement request with body:', payload);

     const result = await this.inventoryRepository.createFactoryMovement(payload);
     console.log('Factory movement creation result:', result);
     if (!result || result.affectedRows === 0) {
       return res.status(400).send({
         message: "Invalid factory movement. OUT requires latest machine movement OUTWARD at same location, and factory flow must alternate IN/OUT.",
          details: "Ensure that for an OUT movement, there is a corresponding IN movement at the same location, and that the factory flow alternates between IN and OUT movements."
       });
     }

     return res.send({ message:"Factory movement saved"});

   }catch(err){

     console.log(err);
     return res.status(500).send({message:"Error"});
     
   }
}
}

module.exports = FactoryMovementController;
