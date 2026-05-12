import { useEffect, useState } from "react";
import { getServiceRequests } from "../../api/serviceApi";

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getServiceRequests();
      setServices(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-5">Services</h1>

      {services.map((service) => (
        <div key={service._id} className="bg-slate-800 p-4 rounded mb-4">
          <p>{service.serviceType}</p>
        </div>
      ))}
    </div>
  );
};

export default Services;