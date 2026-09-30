import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

interface SendTicketEmailPayload {
  orderId: string;
  ticketCode?: string;
  ticketCategoryName?: string;
  totalPrice?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  customer?: {
    fullName: string;
    email: string;
    phone?: string;
    nim?: string;
    faculty?: string;
    studyProgram?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body: SendTicketEmailPayload = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Fetch latest data from Supabase to guarantee accurate, real-time data
    let txData: any = null;
    let partData: any = null;

    try {
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .limit(1)
        .single();
      txData = tx;
    } catch {
      // ignore
    }

    try {
      const { data: part } = await supabase
        .from('participants')
        .select('*')
        .eq('order_id', orderId)
        .limit(1)
        .single();
      partData = part;
    } catch {
      // ignore
    }

    // Determine final fields (prefer database values, fallback to payload)
    const recipientEmail =
      partData?.email || txData?.email || body.customer?.email;
    const recipientName =
      partData?.name || txData?.participant_name || body.customer?.fullName || 'Peserta Seminar';
    const nim = partData?.nim || txData?.nim || body.customer?.nim || '-';
    const faculty = partData?.faculty || txData?.faculty || body.customer?.faculty || '-';
    const prodi = partData?.prodi || txData?.study_program || body.customer?.studyProgram || '-';
    const ticketName =
      partData?.ticket_name || txData?.ticket_name || body.ticketCategoryName || 'Seminar Pass';
    const ticketCode =
      body.ticketCode || 'SEM-' + (orderId.replace(/^ORD-/, '') || orderId);
    const totalPrice = Number(
      txData?.amount || partData?.price || body.totalPrice || 0
    );
    const paymentStatus =
      txData?.payment_status ||
      partData?.payment_status ||
      body.paymentStatus ||
      'Menunggu Konfirmasi Admin';

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: 'Alamat email peserta tidak ditemukan.' },
        { status: 400 }
      );
    }

    // 2. Check Brevo configuration
    const rawBrevoKey =
      process.env.BREVO_API_KEY ||
      process.env.BREVO_SMTP_KEY ||
      '';
    const brevoApiKey = rawBrevoKey.trim();
    const senderEmail = (process.env.BREVO_SENDER_EMAIL || 'hipmicollabexpo@gmail.com').trim();
    const senderName = (process.env.BREVO_SENDER_NAME || 'HIPMI Collab Expo 2026').trim();

    if (!brevoApiKey) {
      console.warn(
        '[Brevo Service] BREVO_API_KEY / BREVO_SMTP_KEY is not set in environment variables. Email simulation logged.'
      );
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Email disimulasikan (BREVO_API_KEY belum dikonfigurasi di .env.local).',
        orderId,
        recipient: recipientEmail,
      });
    }

    // 3. Generate high-compatibility HTTPS QR Code image (Gmail & Webmail Friendly)
    // Gmail and webmail clients block inline data:image base64 URIs, so we use a public HTTPS QR URL
    const publicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=2&color=16-42-67&data=${encodeURIComponent(ticketCode)}`;

    let qrBuffer: Buffer | null = null;
    try {
      qrBuffer = await QRCode.toBuffer(ticketCode, {
        width: 260,
        margin: 1,
        color: {
          dark: '#102A43',
          light: '#FFFFFF',
        },
      });
    } catch (qrErr) {
      console.warn('QR buffer generation notice:', qrErr);
    }

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(val);
    };

    const statusBadgeBg =
      paymentStatus === 'Paid' || paymentStatus === 'Pembayaran Berhasil'
        ? '#dcfce7'
        : '#fef3c7';
    const statusBadgeColor =
      paymentStatus === 'Paid' || paymentStatus === 'Pembayaran Berhasil'
        ? '#166534'
        : '#92400e';
    const statusText =
      paymentStatus === 'Paid' || paymentStatus === 'Pembayaran Berhasil'
        ? 'Pembayaran Berhasil (Terverifikasi)'
        : 'Menunggu Konfirmasi Admin';

    const certificateStatus = 'Tersedia Setelah Acara Selesai (SKP Resmi)';

    // 4. Construct Responsive & Rich HTML Email Template
    const htmlEmailContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Ticket Seminar HIPMI Collab Expo 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #102A43 0%, #1A5E61 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #ffffff; color: #1A5E61; font-weight: 900; font-size: 14px; letter-spacing: 2px; padding: 6px 14px; border-radius: 30px; margin-bottom: 12px; text-transform: uppercase;">
                      OFFICIAL SEMINAR PASS
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      HIPMI COLLAB EXPO 2026
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1; font-weight: 500;">
                      &ldquo;Membangun Ekosistem Bisnis Mahasiswa Tangguh &amp; Berkelanjutan&rdquo;
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting & Status Notice -->
          <tr>
            <td style="padding: 28px 30px 10px 30px;">
              <p style="margin: 0 0 14px 0; font-size: 15px; color: #334155; line-height: 1.5;">
                Halo <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13.5px; color: #64748b; line-height: 1.6;">
                Terima kasih telah melakukan pendaftaran tiket seminar resmi <strong>HIPMI Collab Expo 2026</strong>. Berikut adalah rincian tiket elektronik (E-Ticket) dan QR Code Check-In Anda:
              </p>

              <!-- Payment Status Table (Clean 2-Column for Mobile & Desktop) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${statusBadgeBg}; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 12px 18px;" valign="middle">
                    <span style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${statusBadgeColor}; margin-bottom: 2px;">
                      Status Pembayaran
                    </span>
                    <strong style="font-size: 13px; color: ${statusBadgeColor};">
                      ${statusText}
                    </strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket Pass Section (Navy/Teal Accent Box) -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 22px;">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <!-- QR Code Column (Direct HTTPS Image compatible with Gmail) -->
                    <td width="150" align="center" valign="top" style="padding-right: 20px; border-right: 1px solid #e2e8f0;">
                      <img src="${publicQrUrl}" alt="QR Check-In: ${ticketCode}" width="130" height="130" style="display: block; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; padding: 4px; margin: 0 auto;" />
                      <span style="display: block; font-size: 9px; font-weight: 800; color: #64748b; margin-top: 8px; text-transform: uppercase;">
                        Kode Tiket
                      </span>
                      <strong style="display: block; font-family: monospace; font-size: 12px; color: #1A5E61;">
                        ${ticketCode}
                      </strong>
                    </td>

                    <!-- Participant & Order Info Column -->
                    <td valign="top" style="padding-left: 20px;">
                      <!-- Order ID -->
                      <div style="margin-bottom: 12px;">
                        <span style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">
                          Nomor Pesanan (Order ID)
                        </span>
                        <span style="font-family: monospace; font-size: 14px; font-weight: 800; color: #102A43;">
                          ${orderId}
                        </span>
                      </div>

                      <!-- Category -->
                      <div style="margin-bottom: 12px;">
                        <span style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">
                          Kategori Tiket
                        </span>
                        <strong style="font-size: 13px; color: #1A5E61;">
                          ${ticketName}
                        </strong>
                      </div>

                      <!-- Participant Name & NIM -->
                      <div style="margin-bottom: 12px;">
                        <span style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">
                          Nama Peserta / NIM
                        </span>
                        <strong style="font-size: 13px; color: #102A43; display: block;">
                          ${recipientName}
                        </strong>
                        <span style="font-size: 11px; color: #64748b; font-family: monospace;">
                          NIM: ${nim} &bull; ${prodi}
                        </span>
                      </div>

                      <!-- Total Price -->
                      <div>
                        <span style="display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8;">
                          Total Biaya
                        </span>
                        <strong style="font-size: 15px; color: #F26419;">
                          ${totalPrice === 0 ? 'GRATIS' : formatCurrency(totalPrice)}
                        </strong>
                      </div>
                    </td>
                  </tr>
                </table>

              </div>
            </td>
          </tr>

          <!-- Event Schedule & Location Details -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <strong style="font-size: 11px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">
                      📅 Tanggal &amp; Waktu
                    </strong>
                    <span style="font-size: 12.5px; font-weight: 700; color: #102A43; display: block;">
                      Sabtu, 24 Oktober 2026
                    </span>
                    <span style="font-size: 11.5px; color: #64748b;">
                      09.00 - 16.30 WIB (Open Gate 07.45)
                    </span>
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px; border-left: 1px solid #cbd5e1;">
                    <strong style="font-size: 11px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px;">
                      📍 Lokasi Acara
                    </strong>
                    <span style="font-size: 12.5px; font-weight: 700; color: #102A43; display: block;">
                      Telkom University Convention Hall
                    </span>
                    <span style="font-size: 11.5px; color: #64748b;">
                      (TUCH), Gd. Selaru, Bandung
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons (WA Group & Website) -->
          <tr>
            <td style="padding: 0 30px 24px 30px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://chat.whatsapp.com/sample-hce-group" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 10px; margin: 4px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);">
                      💬 Gabung Grup WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Instructions Box -->
          <tr>
            <td style="padding: 0 30px 28px 30px;">
              <div style="background-color: #fff8f0; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px 18px;">
                <strong style="font-size: 11px; color: #9a3412; display: block; margin-bottom: 6px;">📋 Ketentuan Check-In &amp; Kehadiran:</strong>
                <ol style="margin: 0; padding-left: 18px; font-size: 11px; color: #7c2d12; line-height: 1.5;">
                  <li>Simpan email ini atau unduh QR Code tiket untuk ditunjukkan saat registrasi ulang.</li>
                  <li>QR Code hanya berlaku untuk 1 kali pemindaian masuk di gate seminar.</li>
                  <li>Pintu gate dibuka pukul 07.45 WIB. Harap hadir tepat waktu.</li>
                  <li>E-Sertifikat resmi ber-SKP akan dikirimkan otomatis setelah Anda hadir dan selesai mengikuti acara.</li>
                </ol>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748b;">
                Panitia Pelaksana HIPMI Collab Expo 2026
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                Ada pertanyaan? Hubungi kami via Instagram: @hipmi.telkomuniv atau WhatsApp Panitia.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 9px; color: #cbd5e1;">
                &copy; 2026 HIPMI PT Telkom University. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 5. Send Email via Brevo (Dual Mode: SMTP or REST API)
    let emailResultDetails: any = null;
    let sendMethodUsed = '';

    const isSmtpKey = brevoApiKey.startsWith('xsmtpsib-');

    const smtpUser = (
      process.env.BREVO_SMTP_LOGIN ||
      process.env.BREVO_SMTP_USER ||
      process.env.BREVO_SENDER_EMAIL ||
      'hipmicollabexpo@gmail.com'
    ).trim();
    const smtpHost = (process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com').trim();
    const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);

    // Helper: Send via Brevo SMTP (Nodemailer) with optional attachments
    const sendViaSmtp = async () => {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: brevoApiKey,
        },
      });

      const attachments: any[] = [];
      if (qrBuffer) {
        attachments.push({
          filename: `ticket-${ticketCode}.png`,
          content: qrBuffer,
        });
      }

      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: `"${recipientName}" <${recipientEmail}>`,
        subject: `[E-TICKET] Seminar HCE 2026 - ${ticketCode} (${recipientName})`,
        html: htmlEmailContent,
        attachments,
      });

      return { success: true, messageId: info.messageId, info };
    };

    // Helper: Send via Brevo REST API v3
    const sendViaRestApi = async () => {
      const payload: any = {
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName,
          },
        ],
        subject: `[E-TICKET] Seminar HCE 2026 - ${ticketCode} (${recipientName})`,
        htmlContent: htmlEmailContent,
      };

      if (qrBuffer) {
        payload.attachment = [
          {
            name: `ticket-${ticketCode}.png`,
            content: qrBuffer.toString('base64'),
          },
        ];
      }

      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const brevoResult = await brevoResponse.json();
      if (!brevoResponse.ok) {
        throw new Error(brevoResult.message || 'Brevo REST API error');
      }
      return { success: true, messageId: brevoResult.messageId, brevoResult };
    };

    if (isSmtpKey) {
      try {
        emailResultDetails = await sendViaSmtp();
        sendMethodUsed = 'Brevo SMTP (Nodemailer)';
      } catch (smtpErr: any) {
        console.warn('Brevo SMTP attempt notice:', smtpErr?.message || smtpErr);
        try {
          emailResultDetails = await sendViaRestApi();
          sendMethodUsed = 'Brevo REST API';
        } catch (apiErr: any) {
          console.error('Brevo REST API fallback error:', apiErr?.message || apiErr);
          return NextResponse.json(
            {
              success: false,
              error: `Gagal mengirim email melalui Brevo. (SMTP Error: ${smtpErr?.message})`,
              details: { smtp: smtpErr?.message, api: apiErr?.message },
            },
            { status: 401 }
          );
        }
      }
    } else {
      try {
        emailResultDetails = await sendViaRestApi();
        sendMethodUsed = 'Brevo REST API';
      } catch (apiErr: any) {
        console.warn('Brevo REST API attempt notice:', apiErr?.message || apiErr);
        try {
          emailResultDetails = await sendViaSmtp();
          sendMethodUsed = 'Brevo SMTP (Nodemailer)';
        } catch (smtpErr: any) {
          console.error('Brevo SMTP fallback error:', smtpErr?.message || smtpErr);
          return NextResponse.json(
            {
              success: false,
              error: `Gagal mengirim email melalui Brevo: ${apiErr?.message || 'Unauthorized'}.`,
              details: { api: apiErr?.message, smtp: smtpErr?.message },
            },
            { status: 401 }
          );
        }
      }
    }

    // 6. Update database record with email sent timestamp
    const nowIso = new Date().toISOString();
    try {
      await supabase
        .from('transactions')
        .update({
          email_status: 'Sent',
          email_sent_at: nowIso,
          certificate_status: certificateStatus,
        })
        .eq('order_id', orderId);

      await supabase
        .from('participants')
        .update({
          email_status: 'Sent',
          email_sent_at: nowIso,
          certificate_status: certificateStatus,
        })
        .eq('order_id', orderId);
    } catch (dbUpdateErr) {
      console.warn('Could not update email_status in Supabase:', dbUpdateErr);
    }

    return NextResponse.json({
      success: true,
      message: `Email E-Ticket berhasil dikirim melalui ${sendMethodUsed}!`,
      messageId: emailResultDetails?.messageId,
      recipient: recipientEmail,
      orderId,
    });
  } catch (error: any) {
    console.error('Send ticket email exception:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Terjadi kesalahan sistem saat mengirim email.',
      },
      { status: 500 }
    );
  }
}
