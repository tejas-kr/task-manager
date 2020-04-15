const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOOSE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});




// const task = new Task({
//     description: "drink     "
// });

// task.save().then( result => console.log(result) ).catch(e => console.log(e));