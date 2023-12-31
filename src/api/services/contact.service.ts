import { Contact } from "../models";
import mailer from "../helpers/mailer";

const createContact = async (body: {
  name: string;
  subject: string;
  email: string;
  message: string;
}) => {
  const contact = new Contact(body);
  await mailer.sendContactEmail(body.email, body.subject, body.message);
  return await contact.save();
};

const getContactById = async (id: string) => {
  return Contact.findById(id).exec();
};

const getAllContacts = async () => {
  return Contact.find({}).exec();
};
const updateContact = (
  id: string,
  body: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    message: string;
  }>
) => {
  return Contact.findByIdAndUpdate(id, { ...body }, { new: true });
};

const deleteContact = async (id: string) => {
  await Contact.findByIdAndDelete(id, { deleted: true });
};
export default {
  getContactById,
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
};
