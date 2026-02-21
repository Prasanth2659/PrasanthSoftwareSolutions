const Message = require('./Message');
const uid = (req) => req.headers['x-user-id'];

// GET /api/messages/conversations — list all unique conversation partners
exports.getConversations = async (req, res) => {
  try {
    const me = uid(req);
    const messages = await Message.find({
      $or: [{ sender: me }, { receiver: me }],
    }).sort({ createdAt: -1 });

    const partnersMap = new Map();
    for (const msg of messages) {
      const partnerId = String(msg.sender) === me ? String(msg.receiver) : String(msg.sender);
      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastAt: msg.createdAt,
          unread: !msg.read && String(msg.receiver) === me ? 1 : 0,
        });
      }
    }
    res.json([...partnersMap.values()]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/messages/:userId — get thread between me and other user
exports.getThread = async (req, res) => {
  try {
    const me = uid(req);
    const other = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    }).sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany({ sender: other, receiver: me, read: false }, { read: true });

    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// POST /api/messages — send message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = uid(req);
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ message: 'receiverId and content required' });

    // Save to DB
    const msg = await Message.create({ sender: senderId, receiver: receiverId, content });
    
    // Real-Time Socket Emissions
    try {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const receiverSocketId = connectedUsers.get(receiverId);
      
      console.log('--- DEBUG messageController ---');
      console.log('receiverId:', receiverId);
      console.log('receiverSocketId found:', receiverSocketId);
      
      if (receiverSocketId) {
        // Emit the actual message to the chat view
        io.to(receiverSocketId).emit('receive_message', msg);
        
        // Extract sender name from the gateway/middleware token headers
        const senderName = req.headers['x-user-name'] || 'someone';

        // Emit a globally catchable notification event for the Bell Icon
        console.log('Emitting notification string:', `New message from ${senderName}`);
        io.to(receiverSocketId).emit('notification', {
          id: msg._id,
          type: 'new_message',
          message: `New message from ${senderName}`, 
          senderId: senderId,
          createdAt: msg.createdAt
        });
      }
    } catch (socketErr) {
      console.error('[Socket emit error]', socketErr);
    }

    res.status(201).json(msg);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

