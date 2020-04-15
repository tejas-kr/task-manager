const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const { sendWelcomeMail, sendGoodByeMail } = require('../emails/account');

const User = require('../models/user');

const auth = require('../middleware/auth');

const router = express.Router();

// USER ROUTES
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeMail(user.email, user.name);
        const token = await user.generateToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.post('/users/login', async (req, res) => {
    const _email = req.body.email;
    const _pass = req.body.password;
    try {
        const user = await User.findByCredentials(_email, _pass);
        const token = await user.generateToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.send({ msg: "Successfully logged out!" });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({ msg: "all sessions logged out successfully!" });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
    // const _id = req.user._id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'password', 'email'];
    const isValicUpdate = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValicUpdate) {
        return res.status(400).send({error: "Invalid updates"});
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.status(201).send(req.user);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// Upload Profile Picture

// Configuring file upload
const uploadAvatar = multer({
    // dest: 'images/avatar', // if we do not setup this property then multer won't save file inside directory instead we can access the files in the function...
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error ('Please upload an image file'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

// See the User-Avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error("Unable to process the request!");
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send(e.message);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    // const _id = req.user._id;
    try {
        // const user = await User.findByIdAndDelete(_id);
        // if (!user) {
        //     return res.status(404).send("Unable to delete the user!");
        // }
        await req.user.remove();
        sendGoodByeMail(req.user.email, req.user.name);
        res.status(201).send(req.user);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// To delete the avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send("deleted avatar");
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;