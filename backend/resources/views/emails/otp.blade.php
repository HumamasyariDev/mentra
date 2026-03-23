<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
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
                            <h1 style="color:#f1f5f9; font-size:22px; font-weight:600; margin:0 0 8px;">Verify your email</h1>
                            <p style="color:#94a3b8; font-size:14px; margin:0 0 32px; line-height:1.5;">
                                Enter this code to complete your Mentra registration. The code expires in 10 minutes.
                            </p>

                            <!-- OTP Code -->
                            <div style="background:#020617; border:2px solid rgba(139,92,246,0.3); border-radius:12px; padding:20px; text-align:center; margin-bottom:32px;">
                                <span style="color:#a78bfa; font-size:36px; font-weight:700; letter-spacing:12px; font-family:monospace;">{{ $code }}</span>
                            </div>

                            <!-- Footer note -->
                            <p style="color:#64748b; font-size:12px; margin:0; line-height:1.5;">
                                If you didn't request this code, you can safely ignore this email.
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
