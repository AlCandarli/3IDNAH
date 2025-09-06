const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { username, email, password, dateOfBirth } = req.body;

    if (!username || !email || !password || !dateOfBirth) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const foundUser = await User.findOne({ email }).exec();
    if (foundUser) {
        return res.status(401).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let parsedDateOfBirth;
    if (dateOfBirth) {
        const [day, month, year] = dateOfBirth.split('/');
        parsedDateOfBirth = new Date(year, month - 1, day);
    }

    const user = await User.create({ username, email, password: hashedPassword, dateOfBirth: parsedDateOfBirth });
    const accessToken = jwt.sign({
        UserInfo:{
            id:user._id
        },
    }, process.env.ACCESS_TOKEN_SECRET , {expiresIn:"15m"});
    const refreshToken = jwt.sign({
        UserInfo:{
            id:user._id
        },
    }, process.env.REFRESH_TOKEN_SECRET , {expiresIn:"7d"});
    res.cookie("jwt",refreshToken,{httpOnly:true , secure:true , sameSite:"None" , maxAge: 7 * 24 * 60 * 60 * 1000});

    res.json({
        accessToken,
        email: user.email,
        username: user.username,
        dateOfBirth: user.dateOfBirth
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({
        UserInfo: {
            id: foundUser._id
        },
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({
        UserInfo: {
            id: foundUser._id
        },
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", refreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userResponse = foundUser.toObject();
    delete userResponse.password;

    res.status(200).json({ user: userResponse, accessToken });
};

const refresh = async (req, res) => {
 
    const cookies = req.cookies 
    if (!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const refreshToken = cookies.jwt;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const foundUser = User.findById(decoded.UserInfo.id).exec();
        if(!foundUser) return res.status(401).json({ message: 'Unauthorized' });
        const accessToken = jwt.sign({
            UserInfo: {
                id: foundUser._id
            },
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.json({ accessToken });
    });
    
};
const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(204);
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: 'Cookie cleared' });
};
  
    

module.exports = {
    register,
    login,
    refresh,
    logout
}