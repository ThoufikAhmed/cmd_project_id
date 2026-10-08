class GetBreakdownAttendTicketController {



  constructor(inventoryRepository){
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req, res){

    try{

      const tickets = await this.inventoryRepository.getBreakdownAttendTicket();

      return res.send(tickets.map(ticket => ({
        ticket_id: ticket.id,
        ticket_no: ticket.ticket_no,
        status: ticket.status,
        raised_at: ticket.raised_at,
        raised_by: ticket.raised_by_name,
        location: ticket.location_name,
        batch: ticket.batch_id,
        machine_type: ticket.mc_type,
        machine_model: ticket.mc_model,
        machine_make: ticket.mc_make,
        machine_barcode: ticket.mc_qr,
        reason: ticket.issue_type,
        specialization: ticket.specialization
      })));

    } catch(err){
      console.log(err);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
}



module.exports = GetBreakdownAttendTicketController;