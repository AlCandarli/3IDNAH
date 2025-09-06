const express = require("express");
const router = express.Router();
const giftsController = require('../controllers/giftsController');
const verifyJWT = require("../middlewares/verifyJWT");

router.use(verifyJWT);

router.route("/")
    .post(giftsController.upload.single('file'), giftsController.sendGift)
    .get(giftsController.getReceivedGifts);

router.route("/:giftId/read")
    .patch(giftsController.markGiftAsRead);

module.exports = router;