import axios from 'axios';
import { getUserProfile } from '../database/db';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_VERSION = '2023-06-01';

export const analyzeJobPosting = async (jobData) => {
  try {
    const profile = await getUserProfile();
    const apiKey = profile?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add it in Settings.');
    }

    const prompt = `Analyze this job posting and provide:
1. Overall fit score (0-100)
2. Key requirements match
3. Missing qualifications
4. Red flags (if any)
5. Growth opportunities
6. Salary competitiveness

Job Details:
Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Salary: ${jobData.salaryMin ? `$${jobData.salaryMin}` : 'Not specified'} - ${jobData.salaryMax ? `$${jobData.salaryMax}` : 'Not specified'}

Description:
${jobData.description}

Please provide a concise analysis in JSON format with the following structure:
{
  "fitScore": <number 0-100>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "missingQualifications": ["<qualification 1>", ...],
  "recommendations": ["<recommendation 1>", ...],
  "salaryAssessment": "<assessment of salary competitiveness>"
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const analysisText = response.data.content[0].text;

    // Try to parse JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        analysis: {
          fitScore: analysis.fitScore,
          fullAnalysis: analysisText,
          ...analysis
        }
      };
    }

    // Fallback if JSON parsing fails
    return {
      success: true,
      analysis: {
        fitScore: 50,
        fullAnalysis: analysisText,
        summary: analysisText.substring(0, 200) + '...'
      }
    };
  } catch (error) {
    console.error('Error analyzing job posting:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze job posting'
    };
  }
};

export const generateResume = async (jobData, masterResume) => {
  try {
    const profile = await getUserProfile();
    const apiKey = profile?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add it in Settings.');
    }

    const prompt = `Generate a tailored resume for this job posting based on the master resume provided.

Job Posting:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}

Master Resume:
${masterResume.content}

Skills: ${masterResume.skills}
Experience: ${masterResume.experience}
Education: ${masterResume.education}
Certifications: ${masterResume.certifications}

Please generate:
1. A tailored resume that emphasizes relevant experience and skills
2. A compelling cover letter
3. Key talking points for interviews

Format the response as JSON:
{
  "tailoredResume": "<formatted resume text>",
  "coverLetter": "<personalized cover letter>",
  "interviewTalkingPoints": ["<point 1>", "<point 2>", ...]
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;

    // Try to parse JSON from the response
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        ...result
      };
    }

    return {
      success: true,
      tailoredResume: contentText,
      coverLetter: '',
      interviewTalkingPoints: []
    };
  } catch (error) {
    console.error('Error generating resume:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate resume'
    };
  }
};

export const generateCoverLetter = async (jobData, resumeData) => {
  try {
    const profile = await getUserProfile();
    const apiKey = profile?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add it in Settings.');
    }

    const prompt = `Generate a compelling cover letter for this job application.

Job Details:
Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Description: ${jobData.description}

Applicant Background:
${resumeData.experience}

Skills: ${resumeData.skills}

Please write a professional, engaging cover letter that:
1. Expresses genuine interest in the role
2. Highlights relevant experience and skills
3. Shows knowledge of the company
4. Explains why the candidate is a great fit
5. Includes a strong closing

Keep it concise (3-4 paragraphs, under 400 words).`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    return {
      success: true,
      coverLetter: response.data.content[0].text
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate cover letter'
    };
  }
};

export const getInterviewPrep = async (jobData) => {
  try {
    const profile = await getUserProfile();
    const apiKey = profile?.claude_api_key;

    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add it in Settings.');
    }

    const prompt = `Prepare interview guidance for this job:

Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}

Provide:
1. Likely interview questions (5-7)
2. Suggested answers framework
3. Questions to ask the interviewer (3-5)
4. Research topics about the company
5. Red flags to watch for

Format as JSON:
{
  "questions": [{"question": "...", "answerFramework": "..."}],
  "questionsToAsk": ["..."],
  "researchTopics": ["..."],
  "redFlags": ["..."]
}`;

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': CLAUDE_VERSION
        }
      }
    );

    const contentText = response.data.content[0].text;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return {
        success: true,
        ...JSON.parse(jsonMatch[0])
      };
    }

    return {
      success: true,
      content: contentText
    };
  } catch (error) {
    console.error('Error generating interview prep:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate interview preparation'
    };
  }
};
