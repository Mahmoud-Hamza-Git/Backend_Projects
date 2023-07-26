require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const colors = require('colors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const MyControllers = require('./utils/consumer');
const addSeedings = require('./utils/scriptAddSeedings');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');

connectDB();
addSeedings();
MyControllers.startConsumingMessages();

const app = express();

// app.use(
//   cors({
//     origin: '*',
//   })
// );

app.use(express.static('public'));
app.use(express.json()); // to accept JSON data from frontend

// Middlewares
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/notification', notificationRoutes);

const PORT = process.env.PORT || 6060;
const server = app.listen(PORT, console.log(`server is listening on port ${PORT}...`.yellow.bold));

// Error Handling
// app.all('*', notFound);
app.use(notFound);
app.use(errorHandler);

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    // origin: 'http://localhost:3000',
    origin: '*',
    // credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io SOCKET ID :: ', socket.id);

  //at creating a new chat or access it
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: CHAT_ID: ' + room);
  });

  socket.on('typing', (room) => {
    console.log('👉', 'typing: ', room);
    socket.to(room).emit('typing');
  });
  socket.on('stop typing', (room) => {
    console.log('👉', 'stop typing: ', room);
    socket.to(room).emit('stop typing');
  });

  socket.on('new message', (room) => {
    console.log('👉', 'user send a message !!!', room);
    socket.to(room).emit('message received');
  });

  socket.on('message readed', (room) => {
    console.log('👉', 'user read the latest message !!!', room);
    socket.to(room).emit('message readed');
  });

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED', socket.id);
  });
});
