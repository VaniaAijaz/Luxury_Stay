import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById } from "../../api/userApi";

const UserDetails = () => {

  const { id } = useParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const data = await getUserById(id);
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">

      <div className="bg-slate-800 p-6 rounded-xl">
        <p>{user.name}</p>
        <p>{user.email}</p>
      </div>

    </div>
  );
};

export default UserDetails;