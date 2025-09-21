import React, { useState, useEffect } from 'react';
import { technicianService } from '../../services/technicianService';
import { TechnicianTask } from '../../types/api';

const TechnicianTaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<TechnicianTask | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await technicianService.getTasks({
        status: 'assigned',
        page: 1,
        limit: 20
      });
      
      if (response.success && response.data) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start task
  const handleStartTask = async (taskId: string) => {
    try {
      const response = await technicianService.startTask(taskId);
      if (response.success && response.data) {
        setActiveTask(response.data);
        fetchTasks(); // Refresh list
        alert('Bắt đầu công việc thành công!');
      }
    } catch (error) {
      alert('Không thể bắt đầu công việc');
      console.error('Start task error:', error);
    }
  };

  // Complete task
  const handleCompleteTask = async (taskId: string) => {
    const notes = prompt('Ghi chú hoàn thành:');
    try {
      await technicianService.completeTask(taskId, notes || undefined);
      fetchTasks();
      setActiveTask(null);
      alert('Hoàn thành công việc!');
    } catch (error) {
      alert('Không thể hoàn thành công việc');
    }
  };

  // Request part
  const handleRequestPart = async (taskId: string) => {
    const partId = prompt('Part ID cần yêu cầu:');
    const quantity = prompt('Số lượng:');
    
    if (partId && quantity) {
      try {
        await technicianService.createPartRequest({
          taskId,
          partId,
          quantity: parseInt(quantity),
          urgency: 'medium',
          reason: 'Cần thiết cho công việc'
        });
        alert('Yêu cầu phụ tùng thành công!');
      } catch (error) {
        alert('Không thể yêu cầu phụ tùng');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Công việc của tôi</h2>

      {/* Active Task */}
      {activeTask && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800">Đang thực hiện:</h3>
          <p className="text-blue-700">{activeTask.title}</p>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleCompleteTask(activeTask.id)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Hoàn thành
            </button>
            <button
              onClick={() => handleRequestPart(activeTask.id)}
              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Yêu cầu phụ tùng
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 border rounded-lg hover:shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-gray-600 text-sm">{task.description}</p>
                <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                  <span>Ưu tiên: {task.priority}</span>
                  <span>Ước tính: {task.estimatedHours}h</span>
                </div>
              </div>
              
              <div className="space-x-2">
                {task.status === 'assigned' && (
                  <button
                    onClick={() => handleStartTask(task.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Bắt đầu
                  </button>
                )}
                
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Đang tải...</div>
        </div>
      )}
    </div>
  );
};

export default TechnicianTaskManagement;