const router = require("express").Router();
const { check, validationResult } = require("express-validator")
const { users } = require("../db")
const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")

router.post('/signup', [
    check("email", "Please provide a valid email")
        .isEmail(),
    check("password", "Please provide a passs word greater than 5 characters")
        .isLength({
            min: 6
        })

], async (req, res) => {
    const { password, email } = req.body;

    // console.log(password,email);

    //validate the input

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    //validate if user dosent already exist

    let user = users.find((user) => {
        return user.email === email
    });

    if (user) {
        return res.status(400).json({
            "errorss": [
                {
                    "msg": "User already exists!"
                },
            ],
        });

    }

    const hashedPassword = await bcrypt.hash(password, 10)

    users.push({
        email,
        password: hashedPassword,
    });

    //Access token
    const accesstoken = await JWT.sign({
        email
    }, "jidscn23njdss45bhk87", {
        expiresIn: "20s"
    }
    )

    //console.log(hashedpPassword)
    res.json({
        accesstoken
    })
})

router.post('/login', async (req, res) => {
    const { password, email } = req.body;

    let user = users.find((user) => {
        return user.email === email
    });
    if (!user) {
        return res.status(400).json({
            "errors": [
                {
                    "msg": "Invalid Credentials",
                }
            ]
        })
    };

    //compare hashed pw with user pw 
    let isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return res.status(400).json({
            "errors": [
                {
                    "msg": "Invalid Credentials",
                }
            ]
        })
    };

    //send jwt access token
    const accesstoken = await JWT.sign(
        { email },
        "jidscn23njdss45bhk87", {
        expiresIn: "20s"
    }
    );

    //refresh token
    const refreshToken = await JWT.sign(
        { email },
        "gnfg23uifdsif", {
        expiresIn: "1m"
    }
    );

    //console.log(hashedpPassword)

    //refresh token in refrseshtoken array
    refreshTokens.push(refreshToken);


    res.json({
        accesstoken,
        refreshToken,
    });
});

let refreshTokens = [];

//create new access token from refresh token
router.post("/token", async (req, res) => {
    const refreshToken = req.header("x-auth-token");


    //if token is not provided . send error
    if (!refreshToken) {
        res.status(401).json({
            errors: [
                {
                    "msg": "Token not found",
                },
            ],
        });
    }
    //if token does not exist send error
    if (!refreshTokens.includes(refreshToken)) {
        res.status(403).json({
            errors: [
                {
                    msg: "Invalid refresh token",
                },
            ]
        });
    }
    try {
        const user = JWT.verify(
            refreshToken, "gnfg23uifdsif");

        const { email } = user;
        const accesstoken = await JWT.sign(
            { email },
            "jidscn23njdss45bhk87",
            {
                expiresIn: "20s"
            }

        );
        res.json({ accesstoken });

    }
    catch (error) {
        res.status(403).json({
            errors: [
                {
                    msg: "Invalid Token ",
                },
            ]

        });
    }


});


router.get("/all", (req, res) => {
    res.json(users);
});


module.exports = router