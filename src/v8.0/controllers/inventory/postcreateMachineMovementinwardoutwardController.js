class MachineMovementController {

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

     const result = await this.inventoryRepository.createMachineMovement(payload);
     if (!result || result.affectedRows === 0) {
       return res.status(400).send({
         message: "Invalid machine movement. INWARD requires latest factory movement IN at same location; OUTWARD must follow INWARD at same location."
       });
     }

     return res.send({ message:"Machine movement saved"});

   }catch(err){

     console.log(err);
     return res.status(500).send({message:"Error"});
   }

 }
}

module.exports = MachineMovementController;
