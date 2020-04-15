const express = require('express');

require('./db/mongoose.js');
const User = require('./models/user.js');
const Task = require('./models/task.js');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json()); // This will allow us to automatically parse the incomming json data

// ROUTES
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server started in " + port);
});