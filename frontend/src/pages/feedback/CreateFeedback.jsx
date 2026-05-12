import { useState } from "react";
import { submitFeedback } from "../../api/feedbackApi";

const CreateFeedback = () => {

  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await submitFeedback(formData);

      alert("Feedback Submitted");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        <input
          type="number"
          min="1"
          max="5"
          value={formData.rating}
          onChange={(e) =>
            setFormData({
              ...formData,
              rating: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-slate-700"
        />

        <textarea
          placeholder="Comment"
          onChange={(e) =>
            setFormData({
              ...formData,
              comment: e.target.value,
            })
          }
          className="w-full p-3 rounded bg-slate-700"
        />

        <button className="bg-blue-600 px-6 py-3 rounded">
          Submit Feedback
        </button>

      </form>

    </div>
  );
};

export default CreateFeedback;