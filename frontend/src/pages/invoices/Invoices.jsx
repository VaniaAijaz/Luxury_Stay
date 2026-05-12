import { useEffect, useState } from "react";
import { getInvoices } from "../../api/invoiceApi";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-5">Invoices</h1>

      {invoices.map((invoice) => (
        <div key={invoice._id} className="bg-slate-800 p-4 rounded mb-4">
          <p>Total: ${invoice.totalAmount}</p>
        </div>
      ))}
    </div>
  );
};

export default Invoices;