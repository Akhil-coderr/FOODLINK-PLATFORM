const ContactMessage = require('../models/ContactMessage');
const { notifyRole } = require('../sockets/socketHandler');

exports.sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = await ContactMessage.create({
      name,
      email: email.toLowerCase(),
      subject,
      message,
      status: 'unread',
    });

    notifyRole('admin', 'notification:new', {
      title: 'New Public Contact Inquiry',
      message: `${name}: ${subject}`,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received. Our team will contact you soon.',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
