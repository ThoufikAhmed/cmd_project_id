class PostAcceptTicketController {

  constructor(inventoryRepository){
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req,res){

    try{

      const { ticket_id } = req.body;

      const userId = req.user?.id;

      await this.inventoryRepository.acceptTicket(ticket_id, userId);

      return res.send({
        message: "Ticket accepted",
        status: "IN_PROGRESS"
      });

    }catch(err){

      console.log(err);
      return res.status(500).send({message:"Internal Server Error"});
    }

  }
}

module.exports = PostAcceptTicketController;