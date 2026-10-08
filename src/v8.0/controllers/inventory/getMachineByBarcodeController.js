class GetMachineByBarcodeController {

 constructor(inventoryRepository){
   this.inventoryRepository = inventoryRepository;
 }

 async execute(req,res){

   try{

     const { barcode } = req.params;

     const machine = await this.inventoryRepository.getMachineByBarcode(barcode);

     if(!machine.length){
       return res.status(404).send({ message:"Machine not found"});
     }

     return res.send(machine[0]);

   }catch(err){

     console.log(err);
     return res.status(500).send({message:"Internal Server Error"});
   }
 }
}

module.exports = GetMachineByBarcodeController;