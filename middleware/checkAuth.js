const JWT = require("jsonwebtoken")

module.exports = async (req, res, next) => {
    const accesstoken = req.header('x-auth-token');
    if (!accesstoken) {
        res.status(400).json({
            "errors": [
                {
                    "msg": "no token found",
                }
            ]
        })
    }
    try {
        const user = JWT.verify(accesstoken, "jidscn23njdss45bhk87");
        req.user = user.email;
        next();
    } catch (error) {
        res.status(400).json({
            "errors": [
                {
                    "msg": "token invalid",
                }
            ]
        })

    }
}