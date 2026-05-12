import { useEffect, useState } from "react";
import { getMyBookings } from "../../api/bookingApi";

const MyBookings = () => {

  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl mb-5">
        My Bookings
      </h1>

      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="bg-slate-800 p-4 rounded mb-4"
        >
          <p>Guests: {booking.numberOfGuests}</p>
          <p>Status: {booking.status}</p>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;