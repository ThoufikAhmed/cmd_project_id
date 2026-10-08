const PostMachineTypeController = require("./postmachinetypeController");
const UpdateMachineTypeController = require("./UpdateMachineTypeController");
const DeleteMachineTypeController = require("./DeleteMachineTypeController"); 
const GetAllMachineTypesController = require("./getallmachinetypeController");
const PostMachineMakeController = require("./postmachinemakeController");
const UpdateMachineMakeController = require("./updatemachinemakeController");
const DeleteMachineMakeController = require("./deletemachinemakeController");
const PostOrganizationController = require("./postmachineorganizationController");
const UpdateOrganizationController = require("./updatemachineorganizationController");
const DeleteOrganizationController = require("./deletemachineorganizationController");     
const GetallorganzationController = require("./getallorganizationController");
const GetAllLocationsController = require("./getmachinelocationController");
const DeleteLocationByIdController = require("./deletemachinelocationController");
const UpdateLocationController = require("./updatemachinelocationController");      
const PostLocationController = require("./postmachinelocationController");
const PostSpecializationController = require("./postspecializationController");
const GetAllSpecializationsController = require("./getspecializationController");
const DeleteSpecializationByIdController = require("./deletespecializationController");     
const UpdateSpecializationController = require("./updatespecializationController");
const getAllMachineTMakeController = require("./getallmachinemakeController");
const PostaddMachineController = require("./postaddmachineController");
const GetAlladdMachinesController = require("./getalladdmachineController");
const PostgetmultipleMachinesController = require("./postgetmultiplemachineController");
const UpdateaddMachineController = require("./updateaddmachineController");
const DeleteaddMachineController = require("./deleteaddmachineController");
const GetmachinehistoryController = require("./gethistorymachinesController");
const GetwerahouseController = require("./getwerahouseController");
const GetReasonsController = require("./getreasonController");
const CreateReasonController = require("./postreasonController");
const UpdateReasonController = require("./updatedreasonController");
const DeleteReasonController = require("./deletereasonController");
const GetDetailsController = require("./getdetailsController");
const CreateDetailController = require("./postdetialsController");
const UpdateDetailController = require("./updatedetailsController");
const DeleteDetailController = require("./deletedetailsController");
const GetAllTasksController = require("./getalltasksController");
const UpdateTaskController = require("./updatetasksController");
const DeleteTaskController = require("./deletetasksController");
const PostTaskController = require("./posttasksController");    


const machinesdataRepository = require("../../../models/machinesdata/repository/data");


const postMachineTypeController = new PostMachineTypeController(machinesdataRepository);
const updateMachineTypeController = new UpdateMachineTypeController(  machinesdataRepository);
const deleteMachineTypeController = new DeleteMachineTypeController(machinesdataRepository);
const getAllMachineTypesController = new GetAllMachineTypesController(machinesdataRepository);
const postMachineMakeController = new PostMachineMakeController(machinesdataRepository);
const updateMachineMakeController = new UpdateMachineMakeController(machinesdataRepository);
const deleteMachineMakeController = new DeleteMachineMakeController(machinesdataRepository); 
const postOrganizationController = new PostOrganizationController(machinesdataRepository);
const updateOrganizationController = new UpdateOrganizationController(machinesdataRepository);
const deleteOrganizationController = new DeleteOrganizationController(machinesdataRepository);           
const getallorganzationController = new GetallorganzationController(machinesdataRepository);
const getAllLocationsController = new GetAllLocationsController(machinesdataRepository);
const deleteLocationByIdController = new DeleteLocationByIdController(machinesdataRepository);
const updateLocationController = new UpdateLocationController(machinesdataRepository);  
const postLocationController = new PostLocationController(machinesdataRepository);
const postSpecializationController = new PostSpecializationController(machinesdataRepository);
const getAllSpecializationsController = new GetAllSpecializationsController(machinesdataRepository);
const deleteSpecializationByIdController = new DeleteSpecializationByIdController(machinesdataRepository); 
const updateSpecializationController = new UpdateSpecializationController(machinesdataRepository);  
const getallmachinemakeController = new getAllMachineTMakeController(machinesdataRepository);
const postaddMachineController = new PostaddMachineController(machinesdataRepository);
const getAlladdMachinesController = new GetAlladdMachinesController(machinesdataRepository);
const getMachinesByIdsController = new PostgetmultipleMachinesController(machinesdataRepository);
const updateMachineController = new UpdateaddMachineController(machinesdataRepository);
const deleteMachineController = new DeleteaddMachineController(machinesdataRepository);
const getMachineHistoryController = new GetmachinehistoryController(machinesdataRepository);
const getwerahouseController = new GetwerahouseController(machinesdataRepository);
const getReasonsController = new GetReasonsController(machinesdataRepository);
const createReasonController = new CreateReasonController(machinesdataRepository);
const updateReasonController = new UpdateReasonController(machinesdataRepository);
const deleteReasonController = new DeleteReasonController(machinesdataRepository);
const getDetailsController = new GetDetailsController(machinesdataRepository);
const createDetailController = new CreateDetailController(machinesdataRepository);
const updateDetailController = new UpdateDetailController(machinesdataRepository);
const deleteDetailController = new DeleteDetailController(machinesdataRepository);
const getAllTasksController = new GetAllTasksController(machinesdataRepository);
const updateTaskController = new UpdateTaskController(machinesdataRepository);
const deleteTaskController = new DeleteTaskController(machinesdataRepository);
const postTaskController = new PostTaskController(machinesdataRepository);

module.exports = {
    postMachineTypeController,
    updateMachineTypeController,
    deleteMachineTypeController,
    getAllMachineTypesController,
    postMachineMakeController,
    updateMachineMakeController,
    deleteMachineMakeController,
    getallmachinemakeController,
    postOrganizationController,
    updateOrganizationController,
    deleteOrganizationController,
    getallorganzationController,
    getAllLocationsController,
    deleteLocationByIdController,
    updateLocationController,
    postLocationController,
    postSpecializationController,
    getAllSpecializationsController,
    deleteSpecializationByIdController,
    updateSpecializationController ,
    postaddMachineController,
    getAlladdMachinesController,
    getMachinesByIdsController,
    updateMachineController,
    deleteMachineController,
    getMachineHistoryController,
    getwerahouseController,
    getReasonsController,
    createReasonController,
    updateReasonController,
    deleteReasonController,
    getDetailsController,
    createDetailController,
    updateDetailController,
    deleteDetailController,
    getAllTasksController,
    updateTaskController,
    deleteTaskController,
    postTaskController

};