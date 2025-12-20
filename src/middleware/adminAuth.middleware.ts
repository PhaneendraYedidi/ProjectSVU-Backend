import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AdminRequest extends Request {
  adminId?: string;
}

export const adminAuth = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
   if (!req.session || !req.session.admin) {
    return res.redirect("/admin/login");
  }

  next();
  // const token = req.cookies?.admin_token;
  // if (!token) return res.redirect("/admin/login");

  // try {
  //   const decoded = jwt.verify(
  //     token,
  //     process.env.JWT_SECRET as string
  //   ) as { userId: string };

  //   const user = await User.findById(decoded.userId);
  //   if (!user || user.subscription !== "admin") {
  //     return res.redirect("/admin/login");
  //   }

  //   req.adminId = user._id.toString();
  //   next();
  // } catch {
  //   res.redirect("/admin/login");
  // }
};
