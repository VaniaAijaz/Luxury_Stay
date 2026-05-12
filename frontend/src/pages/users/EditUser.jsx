import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../api/userApi";

const EditUser = () => {

  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {

      const data = await getUserById(id);

      setFormData({
        name: data.name,
        email: data.email,
      });

    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await updateUser(id, formData);

      alert("User Updated");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-slate-700"
        />

        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-slate-700"
        />

        <button className="bg-green-600 px-6 py-3 rounded">
          Update User
        </button>

      </form>

    </div>
  );
};

export default EditUser;