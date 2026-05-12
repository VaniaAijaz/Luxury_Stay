import { useEffect, useState } from "react";
import { getFeedbacks } from "../../api/feedbackApi";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-5">Feedback</h1>

      {feedbacks.map((item) => (
        <div key={item._id} className="bg-slate-800 p-4 rounded mb-4">
          <p>Rating: {item.rating}</p>
          <p>{item.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default Feedback;