import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRoomById } from "../../api/roomApi";

const RoomDetails = () => {

  const { id } = useParams();

  const [room, setRoom] = useState(null);

  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async () => {
    try {
      const data = await getRoomById(id);
      setRoom(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!room) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">
      <h1 className="text-4xl font-bold mb-5">
        Room {room.roomNumber}
      </h1>

      <div className="bg-slate-800 p-6 rounded-xl">
        <p>Type: {room.type}</p>
        <p>Floor: {room.floor}</p>
        <p>Capacity: {room.capacity}</p>
        <p>Price: ${room.pricePerNight}</p>
      </div>
    </div>
  );
};

export default RoomDetails;