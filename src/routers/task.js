const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = express.Router();

// TASK ROUTES
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e.message);
    }
});


// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit), // when limit is not provided, mongoose will ignore it!
                skip: parseInt(req.query.skip), // skip does not means the page number... it meaning how many results you want to skip from starting
                sort
            }
        }).execPopulate(); // If no task is there, an empty array is shown

        res.status(201).send(req.user.tasks);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id });
        
        if (!task) {
            return res.status(404).send("Unable to find the task");
        }

        res.status(201).send(task);
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidUpdate) {
        return res.status(404).send({ error: "Invalid Update!" });
    }

    try {
        // const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send("Unable to find the task!");
        }

        updates.forEach((update) => task[update] = req.body[update]);

        await task.save();
        // const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });

        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e.message)
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send("Unable to find the task!");
        }
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

module.exports = router;