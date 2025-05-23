const MessageFriendly = require('../models/MessageFriendly');
const MessageProfessional = require('../models/MessageProfessional');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ A user connected:', socket.userId);

    socket.join(socket.userId);

    // 🔁 Get previous messages
    socket.on('get previous messages', async ({ contactId, chatMode }) => {
      try {
        console.log(`📨 Fetching ${chatMode} messages between ${socket.userId} and ${contactId}`);

        const MessageModel = (chatMode?.toLowerCase() === 'professional') 
          ? MessageProfessional 
          : MessageFriendly;

        const messages = await MessageModel.find({
          $or: [
            { senderId: socket.userId, receiverId: contactId },
            { senderId: contactId, receiverId: socket.userId },
          ],
        })
          .sort({ createdAt: 1 })
          .limit(20)
          .populate('senderId', 'username');

        const formattedMessages = messages.map(msg => ({
          _id: msg._id,
          senderId: msg.senderId._id.toString(),
          senderName: msg.senderId.username,
          receiverId: msg.receiverId.toString(),
          text: msg.text,
          file: msg.file || null,
          timestamp: msg.createdAt,
        }));

        socket.emit('previous messages', formattedMessages);
      } catch (err) {
        console.error('❌ Error retrieving messages:', err);
        socket.emit('error', 'Error retrieving messages. Please try again.');
      }
    });

    // 📨 Handle new chat message
    socket.on('chat message', async (msgData) => {
      try {
        console.log('Received message data:', msgData); // Debugging line to check the full message data
    
        // Check if mode exists and log it
        console.log('Chat mode:', msgData.mode);
        
        // Dynamically select the appropriate model based on mode (case-insensitive)
        let MessageModel;
        const mode = (msgData.mode || 'friendly').toLowerCase();
        
        if (mode === 'professional') {
          MessageModel = MessageProfessional;
        } else {
          MessageModel = MessageFriendly;
        }
    
        console.log('Using MessageModel:', MessageModel.modelName); // Debugging the selected model
        console.log('Chat mode received:', msgData.mode);

        // Save the message in the appropriate model
        const newMessage = new MessageModel({
          senderId: socket.userId,
          receiverId: msgData.receiverId,
          text: msgData.text,
          file: msgData.file || null,
        });
    
        const savedMessage = await newMessage.save();
        const populatedMsg = await MessageModel.findById(savedMessage._id)
          .populate('senderId', 'username');
        
        const messageToSend = {
          _id: populatedMsg._id,
          text: populatedMsg.text,
          timestamp: populatedMsg.createdAt,
          senderId: populatedMsg.senderId._id.toString(),
          senderName: populatedMsg.senderId.username,
          receiverId: msgData.receiverId.toString(),
          file: populatedMsg.file || null,
        };
    
        io.to(messageToSend.receiverId).emit('chat message', messageToSend);
        socket.emit('chat message', messageToSend);
      } catch (err) {
        console.error('❌ Error saving message:', err);
        socket.emit('error', 'Error sending message. Please try again.');
      }
    });
    
    // 🟡 Typing indicators
    socket.on('typing', (receiverId) => {
      io.to(receiverId).emit('typing', { senderId: socket.userId });
    });

    socket.on('stop typing', (receiverId) => {
      io.to(receiverId).emit('stop typing', { senderId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log('⚠️ User disconnected:', socket.userId);
    });
  });
};
