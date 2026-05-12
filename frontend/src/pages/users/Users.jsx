import { useEffect, useState } from "react";
import { getUsers } from "../../api/userApi";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-5">Users</h1>

      {users.map((user) => (
        <div key={user._id} className="bg-slate-800 p-4 rounded mb-4">
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

export default Users;