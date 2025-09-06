const jsonwebtoken = require("jsonwebtoken");
 
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.user = decoded.UserInfo.id;
        next();
    });
};

module.exports = verifyJWT;