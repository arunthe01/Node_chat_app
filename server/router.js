const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: 'hello',
        error: 'error'
      });
      
});

module.exports = router;
