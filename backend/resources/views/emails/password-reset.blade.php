<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a; min-height:100vh;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#1e1b4b; border-radius:16px; border:1px solid rgba(139,92,246,0.2);">
                    <tr>
                        <td style="padding:40px 36px;">
                            <!-- Logo -->
                            <div style="width:48px; height:48px; background:linear-gradient(135deg,#a78bfa,#7c3aed); border-radius:12px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:28px;">
                                <span style="color:#fff; font-size:20px; font-weight:800; line-height:48px; display:block; text-align:center; width:48px;">M</span>
                            </div>

                            <!-- Heading -->
                            <h1 style="color:#f1f5f9; font-size:22px; font-weight:600; margin:0 0 8px;">Reset your password</h1>
                            <p style="color:#94a3b8; font-size:14px; margin:0 0 32px; line-height:1.5;">
                                We received a request to reset your Mentra account password. Click the button below to set a new password. This link expires in 60 minutes.
                            </p>

                            <!-- Reset Button -->
                            <div style="text-align:center; margin-bottom:32px;">
                                <a href="{{ $resetUrl }}" style="display:inline-block; background:linear-gradient(135deg,#7c3aed,#6d28d9); color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; padding:14px 40px; border-radius:8px; letter-spacing:0.02em;">
                                    Reset Password
                                </a>
                            </div>

                            <!-- Fallback link -->
                            <p style="color:#64748b; font-size:12px; margin:0 0 8px; line-height:1.5;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="color:#a78bfa; font-size:12px; margin:0 0 24px; line-height:1.5; word-break:break-all;">
                                {{ $resetUrl }}
                            </p>

                            <!-- Footer note -->
                            <p style="color:#64748b; font-size:12px; margin:0; line-height:1.5;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Brand footer -->
                <p style="color:#475569; font-size:11px; margin-top:24px; letter-spacing:0.05em;">
                    MENTRA &mdash; YOUR PRODUCTIVITY UNIVERSE
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
