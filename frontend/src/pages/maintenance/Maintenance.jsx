import { useEffect, useState } from "react";
import { getMaintenanceRequests } from "../../api/maintenanceApi";

const Maintenance = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getMaintenanceRequests();
      setRequests(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-5">Maintenance Requests</h1>

      {requests.map((item) => (
        <div key={item._id} className="bg-slate-800 p-4 rounded mb-4">
          <p>{item.issue}</p>
        </div>
      ))}
    </div>
  );
};

export default Maintenance;