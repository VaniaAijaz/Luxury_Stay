import { useState } from "react";
import { createServiceRequest } from "../../api/serviceApi";

const CreateService = () => {

  const [formData, setFormData] = useState({
    bookingId: "",
    serviceType: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await createServiceRequest(formData);

      alert("Service Request Created");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl mb-5">
        Create Service Request
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md"
      >

        <input
          type="text"
          name="bookingId"
          placeholder="Booking ID"
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-700"
        />

        <select
          name="serviceType"
          onChange={handleChange}
          className="w-full p-3 rounded bg-slate-700"
        >
          <option value="">Select Service</option>
          <option value="RoomService">Room Service</option>
          <option value="WakeUpCall">Wake Up Call</option>
          <option value="Transportation">Transportation</option>
          <option value="Laundry">Laundry</option>
          <option value="Other">Other</option>
        </select>

        <button className="bg-blue-600 px-6 py-3 rounded">
          Create Service
        </button>

      </form>
    </div>
  );
};

export default CreateService;