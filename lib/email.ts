type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({to,subject,html,}: SendEmailParams) {
 
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing in environment variables");
  }
  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || "tilahuntareke8@gmail.com";
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "WDU Student Clearance System",
          email: senderEmail,
        },

        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("BREVO_ERROR:", data);
      throw new Error(
        data?.message ||
          data?.error ||
          `Brevo API failed with status ${response.status}`
      );
    }

    console.log("EMAIL_SENT:", data);
    return data;
  } catch (error) {
    console.error("SEND_EMAIL_ERROR:", error);
    throw error;
  }
}