// class PostTpmMaintenanceTasksController {
//   constructor(inventoryRepository) {
//     this.inventoryRepository = inventoryRepository;
//   }

//   async execute(req, res) {
//     try {
//       const { maintenance_id, machine_id, tasks } = req.body;

//       if (!maintenance_id || !machine_id || !Array.isArray(tasks) || tasks.length === 0) {
//         return res.status(400).send({ message: 'maintenance_id, machine_id and tasks are required' });
//       }

//       const cleanedTasks = tasks
//         .filter(task => task?.task_name)
//         .map(task => ({
//           task_name: String(task.task_name).trim(),
//           estimated_seconds: task.estimated_seconds ? Number(task.estimated_seconds) : null,
//           actual_seconds: task.actual_seconds ? Number(task.actual_seconds) : null
//         }));

//       if (cleanedTasks.length === 0) {
//         return res.status(400).send({ message: 'No valid tasks provided' });
//       }

//       await this.inventoryRepository.submitTpmMaintenanceTasks(
//         Number(maintenance_id),
//         Number(machine_id),
//         cleanedTasks
//       );

//       return res.status(201).send({
//         message: 'TPM maintenance tasks saved successfully'
//       });
//     } catch (error) {
//       console.error('Error saving TPM maintenance tasks:', error);
//       return res.status(500).send({ message: 'Server error' });
//     }
//   }
// }

// module.exports = PostTpmMaintenanceTasksController;




class PostTpmMaintenanceTasksController {
  constructor(inventoryRepository) {
    this.inventoryRepository = inventoryRepository;
  }

  async execute(req, res) {
    try {
      const { maintenance_id, machine_id, tasks } = req.body;

      if (!maintenance_id || !machine_id || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).send({
          message: 'maintenance_id, machine_id and tasks are required'
        });
      }

      const cleanedTasks = tasks
        .filter(task => task?.task_name)
        .map(task => ({
          task_name: String(task.task_name).trim(),
          estimated_seconds:
            task.estimated_seconds !== undefined &&
            task.estimated_seconds !== null &&
            task.estimated_seconds !== ''
              ? Number(task.estimated_seconds)
              : null,
          actual_seconds:
            task.actual_seconds !== undefined &&
            task.actual_seconds !== null &&
            task.actual_seconds !== ''
              ? Number(task.actual_seconds)
              : null
        }));

      if (cleanedTasks.length === 0) {
        return res.status(400).send({ message: 'No valid tasks provided' });
      }

      await this.inventoryRepository.submitTpmMaintenanceTasks(
        Number(maintenance_id),
        Number(machine_id),
        cleanedTasks
      );

      return res.status(201).send({
        message: 'TPM maintenance tasks saved successfully'
      });
    } catch (error) {
      console.error('Error saving TPM maintenance tasks:', error);
      return res.status(500).send({
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = PostTpmMaintenanceTasksController;
