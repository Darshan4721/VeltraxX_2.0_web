/**
 * Generates public/downloads/VELTRAXX_2.0_Rulebook.pdf and dist/downloads/VELTRAXX_2.0_Rulebook.pdf
 * aligned with the single-round 24-hour onsite hackathon format.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>VELTRAXX 2.0 - Official Rulebook & Guide</title>
<style>
  @page { size: A4 portrait; margin: 14mm 15mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #111116; margin: 0; line-height: 1.48; font-size: 9.5pt; }
  .banner { background: #111116; color: #FFE500; border: 2px solid #111116; border-radius: 12px; padding: 16px 20px; margin-bottom: 14px; }
  .banner h1 { margin: 0 0 4px 0; font-size: 20pt; letter-spacing: -0.4px; }
  .banner p { margin: 0; color: #FFFFFF; font-size: 9pt; }
  .card { border: 2px solid #111116; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; background: #FFFFFF; }
  .card h2 { margin: 0 0 6px 0; font-size: 11pt; text-transform: uppercase; border-bottom: 2px solid #FFE500; padding-bottom: 3px; }
  ul { margin: 4px 0 0 0; padding-left: 18px; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9pt; }
  th, td { border: 1.5px solid #111116; padding: 6px 8px; text-align: left; }
  th { background: #FFE500; font-weight: 800; }
  .footer { margin-top: 12px; font-size: 8.5pt; color: #44444F; text-align: center; border-top: 1px solid #CCC; padding-top: 8px; }
</style>
</head>
<body>
  <div class="banner">
    <h1>VELTRAXX 2.0 - OFFICIAL RULEBOOK &amp; GUIDE</h1>
    <p>Sri Shakthi Institute of Engineering and Technology (SIET), Coimbatore · Department of Electronics Engineering (VLSI Design and Technology)</p>
  </div>

  <div class="card">
    <h2>1. Event Overview &amp; Single-Round Format</h2>
    <table>
      <tr><th>Event Format</th><td>Single-round, 24-hour continuous onsite hackathon (No preliminary online round or PPT upload)</td></tr>
      <tr><th>Hackathon Dates</th><td>December 15-16, 2026 (24 Hours Non-Stop) at SIET Campus, Coimbatore</td></tr>
      <tr><th>Registration Closes</th><td>December 12, 2026 at 11:59 PM IST (or earlier once 60-team capacity is reached)</td></tr>
      <tr><th>Team Composition</th><td>Strictly 3 Members per team (1 Team Leader + 2 Team Members). No substitutions allowed post-registration.</td></tr>
      <tr><th>Maximum Capacity</th><td>60 Teams (180 Participants maximum)</td></tr>
      <tr><th>Registration Fee</th><td>₹500 per member (₹1,500 total per team)</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>2. Eligibility &amp; Registration Policies</h2>
    <ul>
      <li>Open to students across all academic disciplines (UG, PG, Research Scholars), subject to applicable institutional eligibility and minor-safety requirements.</li>
      <li>Each participant may belong to only one active registered team. Duplicate emails, mobile numbers, or multiple registrations result in disqualification.</li>
      <li>All teams must carry valid institutional Photo ID cards during onsite check-in.</li>
      <li>Registration and payment happen in one unified checkout process: enter all 3 member details, click <strong>Proceed to Payment</strong>, accept policies, transfer ₹1,500 via UPI, and submit your 12-digit UTR &amp; screenshot to click <strong>Complete Registration</strong>.</li>
      <li>Voluntary withdrawal, non-attendance, or disqualification due to duplicate/false UTR evidence is non-refundable.</li>
      <li>Team participation is confirmed ONLY after manual bank credit &amp; receipt verification and official confirmation email sent from <strong>vlsireseachlab@siet.ac.in</strong>.</li>
    </ul>
  </div>

  <div class="card">
    <h2>3. Onsite Conduct, Hospitality &amp; Equipment</h2>
    <ul>
      <li><strong>Hospitality Included:</strong> Food (3 meals) and 2 refreshments are provided to all confirmed participants across the 24-hour sprint.</li>
      <li>Bring your own laptops, chargers, extension cords (if needed), microcontrollers/FPGAs, sensors, and debugging cables.</li>
      <li>Pre-built hardware assemblies or plagiarized code submitted as original 24-hour builds are strictly prohibited.</li>
      <li>Exact campus reporting timings, lab assignments, and judging details will be shared with confirmed teams prior to the event.</li>
    </ul>
  </div>

  <div class="card">
    <h2>4. Rewards &amp; Official Contact Desk</h2>
    <ul>
      <li><strong>Winning Rewards:</strong> Official VELTRAXX 2.0 Championship Trophy, Cash Prize (exact pool to be revealed later), and VLSI Internship opportunity (subject to approved arrangements).</li>
      <li><strong>Official Email Desk:</strong> vlsireseachlab@siet.ac.in (Manual confirmation emails) | dhilipkumarece@siet.ac.in</li>
      <li><strong>Faculty Convener:</strong> Dr. P. Dhilipkumar (+91-9629561731) · <strong>Student Coordinators:</strong> R.A. Darshan (+91-9751340838), L.Subiksha (+91-9344705387)</li>
    </ul>
  </div>

  <div class="footer">
    Sri Shakthi Institute of Engineering and Technology, L&amp;T Bypass Road, Chinniyampalayam Post, Coimbatore - 641062, Tamil Nadu, India.
  </div>
</body>
</html>`;

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  if (!fs.existsSync(edgePath)) {
    throw new Error(`Edge executable not found at: ${edgePath}`);
  }
  const publicOutDir = path.resolve(__dirname, '../public/downloads');
  const distOutDir = path.resolve(__dirname, '../dist/downloads');
  fs.mkdirSync(publicOutDir, { recursive: true });
  fs.mkdirSync(distOutDir, { recursive: true });

  const tempHtml = path.resolve(__dirname, 'temp_rulebook.html');
  const publicPdf = path.join(publicOutDir, 'VELTRAXX_2.0_Rulebook.pdf');
  const distPdf = path.join(distOutDir, 'VELTRAXX_2.0_Rulebook.pdf');

  fs.writeFileSync(tempHtml, html, 'utf8');
  execSync(`"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${publicPdf}" "${tempHtml}"`, { stdio: 'inherit' });
  fs.unlinkSync(tempHtml);
  fs.copyFileSync(publicPdf, distPdf);
  console.log(`Rulebook PDF generated cleanly: ${publicPdf}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
