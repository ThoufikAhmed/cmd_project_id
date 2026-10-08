const GetbeakdownDetails = require("../../controllers/breakdowndetials/getbreakdownraiseddetailsController");
const GetcompletdandattendedticketsController = require("../../controllers/breakdowndetials/getcompletdandattendedticketsController");
const GetNotAttendedTicketsController = require("../../controllers/breakdowndetials/GetNotAttendedTicketsController");
const GetPendingTicketsController = require("../../controllers/breakdowndetials/GetPendingTicketsController");      
const GetUserDeviceTokensController = require("../../controllers/breakdowndetials/GetUserDeviceTokensWithNameController");
const PostAssignTicketController = require("../../controllers/breakdowndetials/PostAssignTicketController");

const breakdowndataRepository = require("../../../models/breakdowndetails/repository/breakdown");
const notificationService = require("../../../services/notification.service");



const getBreakdownTicketDetailsController = new GetbeakdownDetails(breakdowndataRepository);
const getcompletdandattendedticketsController = new GetcompletdandattendedticketsController(breakdowndataRepository);
const getNotAttendedTicketsController = new GetNotAttendedTicketsController(breakdowndataRepository);
const getPendingTicketsController = new GetPendingTicketsController(breakdowndataRepository);
const getUserDeviceTokensController = new GetUserDeviceTokensController(breakdowndataRepository);   
const postAssignTicketController = new PostAssignTicketController(breakdowndataRepository,notificationService);

module.exports = {
    getBreakdownTicketDetailsController,
    getcompletdandattendedticketsController,
    getNotAttendedTicketsController,
    getPendingTicketsController,
    getUserDeviceTokensController,
    postAssignTicketController
};