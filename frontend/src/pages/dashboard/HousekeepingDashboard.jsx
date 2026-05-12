const HousekeepingDashboard = () => {

  return (

    <div className="grid grid-cols-3 gap-5">

      <div className="bg-slate-800 p-5 rounded-xl">
        Pending Tasks
      </div>

      <div className="bg-slate-800 p-5 rounded-xl">
        Completed Tasks
      </div>

      <div className="bg-slate-800 p-5 rounded-xl">
        Assigned Rooms
      </div>

    </div>

  );
};

export default HousekeepingDashboard;