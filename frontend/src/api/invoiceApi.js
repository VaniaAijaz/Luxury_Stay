import API from "./axios";

/* GET ALL INVOICES */
export const getInvoices = async () => {
  const res = await API.get("/invoices");
  return res.data?.invoices ?? res.data;
};

/* GET INVOICE BY ID */
export const getInvoiceById = async (id) => {
  const res = await API.get(`/invoices/${id}`);
  return res.data?.invoice ?? res.data;
};

/* GENERATE INVOICE */
export const generateInvoice = async (data) => {
  const res = await API.post("/invoices", data);
  return res.data?.invoice ?? res.data;
};

/* UPDATE PAYMENT STATUS */
export const updatePaymentStatus = async (id, data) => {
  const res = await API.patch(`/invoices/${id}/payment`, data);
  return res.data?.invoice ?? res.data;
};
