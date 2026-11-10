import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { AccountConfig } from '../models/AccountConfig.js';
import { IProfile } from '../models/Profile.js';

export interface GenerateEmailParams {
  recruiterName?: string;
  recruiterEmail: string;
  companyName?: string;
  jobRole?: string;
  purpose: string;
  additionalNotes?: string;
  profile: IProfile;
}

export interface GeneratedEmailResult {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  provider: 'gemini' | 'smart-template';
  modelUsed?: string;
}

/**
 * Builds the professional signature with configured links only.
 */
export const buildSignature = (profile: IProfile): { text: string; html: string } => {
  const name = profile.fullName || 'Sourabh Sahu';
  const title = profile.professionalTitle || 'Full Stack Developer';

  const links: { label: string; textLabel: string; url: string }[] = [];

  if (profile.resumeUrl?.trim()) {
    links.push({ label: 'Resume', textLabel: 'View My Resume', url: profile.resumeUrl.trim() });
  }
  if (profile.portfolioUrl?.trim()) {
    links.push({ label: 'Portfolio', textLabel: 'Visit My Portfolio', url: profile.portfolioUrl.trim() });
  }
  if (profile.linkedInUrl?.trim()) {
    links.push({ label: 'LinkedIn', textLabel: 'Connect on LinkedIn', url: profile.linkedInUrl.trim() });
  }
  if (profile.gitHubUrl?.trim()) {
    links.push({ label: 'GitHub', textLabel: 'View GitHub Profile', url: profile.gitHubUrl.trim() });
  }

  // Plain text signature
  let textSig = `\n\nBest Regards,\n${name}\n${title}`;
  if (links.length > 0) {
    textSig += '\n\n' + links.map(l => `${l.label}: ${l.textLabel} (${l.url})`).join('\n');
  }

  // HTML signature
  let htmlSig = `<br><br><p style="margin:0;font-weight:600;color:#0f172a;">Best Regards,</p><p style="margin:2px 0 0 0;font-weight:600;color:#0f172a;">${escapeHtml(name)}</p><p style="margin:0 0 12px 0;color:#475569;font-size:14px;">${escapeHtml(title)}</p>`;
  if (links.length > 0) {
    htmlSig += `<div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:10px;font-size:13px;line-height:1.6;color:#64748b;">`;
    htmlSig += links
      .map(
        l =>
          `<div><strong style="color:#334155;">${escapeHtml(l.label)}:</strong> <a href="${escapeHtml(
            l.url
          )}" style="color:#2563eb;text-decoration:none;" target="_blank" rel="noopener noreferrer">${escapeHtml(
            l.textLabel
          )}</a></div>`
      )
      .join('');
    htmlSig += `</div>`;
  }

  return { text: textSig, html: htmlSig };
};

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Smart template fallback in case Gemini/OpenRouter API key is not configured or fails.
 */
const generateSmartTemplate = (params: GenerateEmailParams): GeneratedEmailResult => {
  const { recruiterName, companyName, jobRole, purpose, profile } = params;
  const greeting = recruiterName?.trim() ? `Hi ${recruiterName.trim()},` : 'Hi there,';
  const company = companyName?.trim() || 'your company';
  const role = jobRole?.trim() || 'Software Engineer';
  const candidateName = profile.fullName || 'Sourabh Sahu';
  const title = profile.professionalTitle || 'Full Stack Developer';

  let subject = '';
  let body = '';

  switch (purpose) {
    case 'Internship Application':
      subject = `Application: ${role} Internship at ${company} – ${candidateName}`;
      body = `${greeting}

I hope you are doing well.

I am reaching out to express my keen interest in an internship opportunity as a ${role} at ${company}. As a ${title}, I have been building full-stack web applications with modern architectures and responsive designs.

I have followed ${company}'s work and admire the impactful products your engineering team builds. I would love the opportunity to contribute my skills in frontend and backend development while learning from your experienced team.

My resume and portfolio are linked below for your review. If there is an open internship opportunity, I would be grateful for the chance to connect for a quick 10-minute conversation.

Thank you very much for your time and consideration.`;
      break;

    case 'Full-Time Job Application':
      subject = `Application for ${role} – ${candidateName} (${title})`;
      body = `${greeting}

I hope this email finds you well.

I am writing to express my strong interest in the ${role} opening at ${company}. With my background as a ${title}, I specialize in building performant, scalable, and user-centric web applications.

I have worked extensively with React, Node.js, TypeScript, and modern API architectures. I am particularly drawn to ${company} because of your focus on building high-quality, impactful software solutions.

I have attached my portfolio and resume below. I would welcome the opportunity to discuss how my technical skills and enthusiasm can benefit your engineering team.

Thank you for your time and consideration.`;
      break;

    case 'Referral Request':
      subject = `Inquiry regarding ${role} role at ${company} – Referral Request`;
      body = `${greeting}

I hope you're having a productive week.

I noticed your work at ${company} and wanted to reach out. I am currently exploring opportunities for a ${role} position and came across openings that strongly align with my background as a ${title}.

Given your experience at ${company}, I would deeply appreciate any advice you might have on navigating the hiring process, or if you would be open to referring my profile if you find it a good fit.

You can review my resume and projects linked below. I would be grateful for a brief chat whenever your schedule permits.

Thank you so much for your time!`;
      break;

    case 'Follow-up Email':
      subject = `Following Up: ${role} application at ${company} – ${candidateName}`;
      body = `${greeting}

I hope you are having a wonderful week.

I am writing to briefly follow up on my previous note regarding the ${role} position at ${company}. I remain very enthusiastic about the possibility of joining your team and contributing to ${company}'s continued growth.

Please let me know if you need any additional information from my side. My resume and project portfolio are referenced below for your convenience.

Thank you again for your time and consideration.`;
      break;

    default: // General Job Opportunity
      subject = `Exploring ${role} Opportunities at ${company} – ${candidateName}`;
      body = `${greeting}

I hope you are doing well.

I am reaching out to express my interest in potential ${role} opportunities at ${company}. As a passionate ${title}, I have hands-on experience building modern, full-stack applications with clean code, strong performance, and intuitive user experiences.

I really admire the products and culture at ${company} and would love to explore whether there might be a role where my skills could add value to your team.

My resume, portfolio, and code repositories are linked below. Would you be open to a brief chat sometime this week?

Thank you for your consideration.`;
      break;
  }

  const sig = buildSignature(profile);
  const fullText = body + sig.text;
  const fullHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 600px;">
      ${body
        .split('\n\n')
        .map(p => `<p style="margin: 0 0 16px 0;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('')}
      ${sig.html}
    </div>
  `;

  return {
    subject,
    bodyText: fullText,
    bodyHtml: fullHtml,
    provider: 'smart-template',
  };
};

/**
 * Generate email using Google Gemini API or OpenRouter API.
 */
export const generateEmailWithAI = async (params: GenerateEmailParams): Promise<GeneratedEmailResult> => {
  // Determine API key (check AccountConfig in DB first, then ENV)
  let apiKey = ENV.GEMINI_API_KEY;
  try {
    const config = await AccountConfig.findOne({ key: 'primary' });
    if (config?.geminiApiKey?.trim()) {
      apiKey = config.geminiApiKey.trim();
    }
  } catch {
    // Proceed with ENV
  }

  if (!apiKey) {
    console.log('[GeminiService] No API Key provided. Using smart template engine.');
    return generateSmartTemplate(params);
  }

  const { recruiterName, recruiterEmail, companyName, jobRole, purpose, additionalNotes, profile } = params;

  const prompt = `
You are an expert cold email copywriter and career coach assisting ${profile.fullName || 'Sourabh Sahu'}, who is a ${profile.professionalTitle || 'Full Stack Developer'}.

Write a personalized, concise, professional, recruiter-friendly cold email.

Target Information:
- Recruiter Name: ${recruiterName?.trim() || 'Not specified (use a professional greeting like Hi there, or Hello [Team/Recruiter])'}
- Recruiter Email: ${recruiterEmail}
- Company Name: ${companyName?.trim() || 'the company'}
- Target Job Role: ${jobRole?.trim() || 'Full Stack Developer / Software Engineer'}
- Email Purpose: ${purpose}
${additionalNotes?.trim() ? `- Additional Context/Job Description Snippet: ${additionalNotes.trim()}` : ''}

Candidate Details:
- Candidate Name: ${profile.fullName}
- Title: ${profile.professionalTitle}
- Key Skills: ${profile.skillsSummary || 'React, TypeScript, Node.js, MongoDB, REST APIs'}

CRITICAL GUIDELINES:
1. Tone: Human, humble yet confident, natural, authentic, and polite. NEVER sound robotic, generic, or excessively promotional.
2. Length: Concise! Recruiters have little time (around 100-160 words for the body).
3. Do NOT invent fake URLs or fake previous companies.
4. Do NOT output markdown code fences (like \`\`\`json). Output pure raw JSON only.
5. Provide a compelling subject line that gets high open rates.
6. The body should NOT include the signature links because the system appends the exact verified profile links. Only end with a professional closing sentence before the signature (e.g. "Looking forward to hearing from you," or "Thank you for your time and consideration,").

OUTPUT FORMAT:
Return a valid JSON object strictly matching this schema:
{
  "subject": "The email subject line",
  "body": "The complete email body text from greeting to the pre-signoff sentence, using newlines for paragraph breaks"
}
`;

  try {
    let rawResponse = '';
    let modelName = 'gemini-1.5-flash';

    // Check if user provided an OpenRouter key
    const isOpenRouter = apiKey.startsWith('sk-or-') || apiKey.startsWith('sk-');

    if (isOpenRouter) {
      modelName = 'google/gemini-2.5-flash (OpenRouter)';
      const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'ColdMail',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 1200,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!openRouterRes.ok) {
        const errText = await openRouterRes.text();
        throw new Error(`OpenRouter Error (${openRouterRes.status}): ${errText}`);
      }

      const openRouterData: any = await openRouterRes.json();
      rawResponse = openRouterData?.choices?.[0]?.message?.content?.trim() || '';
    } else {
      // Direct Google Gemini SDK
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
        },
      });
      const response = await model.generateContent(prompt);
      rawResponse = response.response.text().trim();
    }

    // Clean JSON response
    let cleanedText = rawResponse;
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);

    const sig = buildSignature(profile);
    const bodyText = parsed.body.trim() + sig.text;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 600px;">
        ${parsed.body
          .trim()
          .split('\n\n')
          .map((p: string) => `<p style="margin: 0 0 16px 0;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
          .join('')}
        ${sig.html}
      </div>
    `;

    return {
      subject: parsed.subject || `Inquiry regarding ${jobRole || 'opportunities'} at ${companyName || 'your team'}`,
      bodyText,
      bodyHtml,
      provider: 'gemini',
      modelUsed: modelName,
    };
  } catch (error) {
    console.error('[GeminiService] Error generating email with AI:', error);
    // Graceful fallback to smart template so user workflow is never interrupted
    return generateSmartTemplate(params);
  }
};
