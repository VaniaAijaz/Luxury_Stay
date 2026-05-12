import { useEffect, useState } from "react";
import { getHouseKeepingTasks } from "../../api/housekeepingApi";

const HouseKeeping = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getHouseKeepingTasks();
      setTasks(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-5">Housekeeping</h1>

      {tasks.map((task) => (
        <div key={task._id} className="bg-slate-800 p-4 rounded mb-4">
          <p>{task.status}</p>
        </div>
      ))}
    </div>
  );
};

export default HouseKeeping;