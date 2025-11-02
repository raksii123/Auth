import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";

export async function register(req, res) {

    const { email, fullname: { firstname, lastname }, password } = req.body
 console.log(email, firstname, lastname, password);
    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
        return res.status(400).json({
            message: "User already exist"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({ email, fullname: { firstname, lastname }, password: hash });
    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, config.JWT_SECRET, { expiresIn: "2d" })

    await publishToQueue("user_created", {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role
    })

    res.cookie("token", token)
    res.status(201).json({
        message: "User created successfully",
        user: {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            role: user.role
        }
    })



}


export async function googleAuthCallback(req, res) {


    const user = req.user;


    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { email: user.emails[ 0 ].value },
            { googleId: user.id }
        ]
    })

    if (isUserAlreadyExists) {
        const token = jwt.sign({
            id: isUserAlreadyExists._id,
            role: isUserAlreadyExists.role,
        }, config.JWT_SECRET, { expiresIn: "2d" })

        res.cookie("token", token);
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: isUserAlreadyExists._id,
                email: isUserAlreadyExists.email,
                fullname: isUserAlreadyExists.fullname,
                role: isUserAlreadyExists.role
            }
        })
    }

    const newUser = await userModel.create({
        googleId: user.id,
        email: user.emails[0].value,
        fullname: {
            firstname: user.name.givenName,
            lastname: user.name.familyName
        }

    })


    await publishToQueue("user_created", {
        id: newUser._id,
        email: newUser.email,
        fullname: newUser.fullname,
        role: newUser.role
    })



    const token = jwt.sign({
        id: newUser._id,
        role: newUser.role,
        fullname: newUser.fullname
    }, config.JWT_SECRET, { expiresIn: "2d" })

    res.cookie("token", token)

    res.status(201).json({
        message: "User created successfully",
        user: {
            id: newUser._id,
            email: newUser.email,
            fullname: newUser.fullname,
            role: newUser.role
        }
    })
    res.send("Google Auth Callback");
}

