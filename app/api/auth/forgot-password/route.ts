import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same message to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists for that email, a reset link has been sent.",
      });
    }

    // Create a signed JWT reset token — no DB storage needed
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .setIssuedAt()
      .sign(secret);

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password — WDU Clearance",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background: #f1f5f9; padding: 32px;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <h2 style="color: #1e3a5f; margin-bottom: 8px;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 14px;">
                We received a request to reset the password for your WDU Clearance System account.
              </p>
              <p style="color: #475569; font-size: 14px;">
                Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}"
                   style="background: #1e3a8a; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 12px;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
                WDU Student Clearance System
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
