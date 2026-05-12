import { useState } from "react";
import { createRoom } from "../../api/roomApi";

const CreateRoom = () => {
  const [formData, setFormData] = useState({
    roomNumber: "",
    type: "",
    floor: "",
    pricePerNight: "",
    capacity: "",
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
      await createRoom(formData);
      alert("Room Created");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input name="roomNumber" placeholder="Room Number" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input name="type" placeholder="Type" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input name="floor" placeholder="Floor" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input name="pricePerNight" placeholder="Price" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input name="capacity" placeholder="Capacity" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />

        <button className="bg-green-600 px-6 py-3 rounded">
          Create Room
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;