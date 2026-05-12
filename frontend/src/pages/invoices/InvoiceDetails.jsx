import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvoiceById } from "../../api/invoiceApi";

const InvoiceDetails = () => {

  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!invoice) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">

      <div className="bg-slate-800 p-6 rounded-xl">
        <p>Total: ${invoice.totalAmount}</p>
      </div>

    </div>
  );
};

export default InvoiceDetails;