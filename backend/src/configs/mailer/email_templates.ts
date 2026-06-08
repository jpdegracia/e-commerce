export const getPasswordResetTemplate = (fullname: string, resetUrl: string): string => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Hello ${fullname},</h2>
            <p style="color: #555; line-height: 1.5;">You requested a password reset for your E-Commerce account.</p>
            <p style="color: #555; line-height: 1.5;">Please click the button below to reset your password. This link is valid for 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
    `;
};

export const getEmailVerificationTemplate = (fullname: string, verifyUrl: string): string => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">Welcome to our Store, ${fullname}!</h2>
            <p style="color: #555; line-height: 1.5;">Thank you for registering. Please verify your email address to activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #999; font-size: 12px;">If you didn't sign up for this account, please ignore this message.</p>
        </div>
    `;
};