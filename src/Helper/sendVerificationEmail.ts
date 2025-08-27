import { getResendClient } from "@/lib/resend";
import VerificationEmail from "../../emails/Veificationemail";
import { Apiresponse } from "@/types/Apiresponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<Apiresponse> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystery Message | Verifaction Code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: " verification email send successfully" };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);
    return { success: false, message: "failed to send verification email" };
  }
}
