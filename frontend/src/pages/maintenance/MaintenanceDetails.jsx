import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaintenanceRequestById } from "../../api/maintenanceApi";

const MaintenanceDetails = () => {

  const { id } = useParams();

  const [request, setRequest] = useState(null);

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    try {
      const data = await getMaintenanceRequestById(id);
      setRequest(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!request) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">

      <div className="bg-slate-800 p-6 rounded-xl">
        <p>{request.issue}</p>
      </div>

    </div>
  );
};

export default MaintenanceDetails;