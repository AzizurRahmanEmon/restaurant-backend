import UserModel from "../model/UserModel.js";
import { TokenEncode } from "../utility/tokenUtility.js";
import SendEmail from "../utility/emailUtility.js";

export const Registration = async (req, res) => {
  try {
    let reqBody = req.body;
    await UserModel.create(reqBody);
    return res.json({
      status: "success",
      message: "User Registration successfully",
    });
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};

export const Login = async (req, res) => {
  try {
    let reqBody = req.body;
    let data = await UserModel.findOne(reqBody);
    if (data === null) {
      return res.json({ status: "fail", Message: "User Not Found" });
    } else {
      let token = TokenEncode(data["email"], data["_id"]);
      return res.json({
        status: "success",
        Token: token,
        message: "User Login Successfully",
      });
    }

    return res.json({ status: "success", message: "User Login successfully" });
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};

export const ProfileDetails = async (req, res) => {
  try {
    let user_id = req.headers["user_id"];
    let data = await UserModel.findOne({ _id: user_id });
    return res.json({
      status: "success",
      Message: "User ProfileDetails successfully",
      data: data,
    });
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};
export const ProfileUpdate = async (req, res) => {
  try {
    let reqBody = req.body;
    let user_id = req.headers["user_id"];
    await UserModel.updateOne({ _id: user_id }, reqBody);
    return res.json({
      status: "success",
      Message: "User Profile Updated successfully",
    });
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};

export const EmailVerify = async (req, res) => {
  try {
    let email = req.params.email;
    let data = await UserModel.findOne({ email: email });
    if (data === null) {
      return res.json({ status: "fail", Message: err.toString() });
    } else {
      let code = Math.floor(100000 + Math.random() * 900000);
      let EmailTo = data["email"];
      let EmailText = "Your Code is " + code;
      let EmailSubject = "Task Manager Verification Code";
      await SendEmail(EmailTo, EmailSubject, EmailText);
      await UserModel.updateOne({ email: email }, { otp: code });
      return res.json({
        status: "success",
        message: "User Email Verify successfully, check email",
      });
    }
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};

export const CodeVerify = async (req, res) => {
  try {
    let email = req.params.email;
    let code = req.params.code;
    let data = await UserModel.findOne({ email: email, otp: code });
    if (data === null) {
      return res.json({ status: "fail", Message: "Wrong Verification Code" });
    } else {
      return res.json({
        status: "success",
        message: "User Code Verify successfully",
      });
    }
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    let reqBody = req.body;
    let data = await UserModel.findOne({
      email: reqBody["email"],
      otp: reqBody["code"],
    });
    if (data === null) {
      return res.json({ status: "fail", Message: "Wrong Verification Code" });
    } else {
      await UserModel.updateOne(
        { email: reqBody["email"] },
        { otp: "0", password: reqBody["password"] }
      );
      return res.json({
        status: "success",
        message: "User Reset Password successfully",
      });
    }
  } catch (err) {
    return res.json({ status: "fail", Message: err.toString() });
  }
};
