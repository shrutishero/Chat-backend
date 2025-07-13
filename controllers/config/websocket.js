const onlineUsers = new Map();

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("user-online", (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit("update-user-status", Array.from(onlineUsers.keys()));
        });

        socket.on("send-message", ({ senderId, receiverId, message }) => {
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit("receive-message", { senderId, message });
            }
        });

        socket.on("disconnect", () => {
            for (const [userId, id] of onlineUsers.entries()) {
                if (id === socket.id) {
                    onlineUsers.delete(userId);
                    io.emit("update-user-status", Array.from(onlineUsers.keys()));
                    break;
                }
            }
        });
    });
};
