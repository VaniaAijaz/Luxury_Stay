import { useState } from "react";
import { createBooking } from "../../api/bookingApi";

const CreateBooking = () => {
  const [formData, setFormData] = useState({
    room: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
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
      await createBooking(formData);
      alert("Booking Created");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input name="room" placeholder="Room ID" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input type="date" name="checkInDate" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input type="date" name="checkOutDate" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />
        <input type="number" name="numberOfGuests" onChange={handleChange} className="w-full p-3 bg-slate-700 rounded" />

        <button className="bg-blue-600 px-6 py-3 rounded">
          Create Booking
        </button>
      </form>
    </div>
  );
};

export default CreateBooking;