import { useState } from "react";
import { createMaintenanceRequest } from "../../api/maintenanceApi";

const CreateMaintenance = () => {

  const [issue, setIssue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await createMaintenanceRequest({ issue });

      alert("Request Created");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        <textarea
          placeholder="Issue"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className="w-full p-3 rounded bg-slate-700"
        />

        <button className="bg-red-600 px-6 py-3 rounded">
          Submit Request
        </button>

      </form>

    </div>
  );
};

export default CreateMaintenance;