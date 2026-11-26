import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Lecture, Note, DailySchedule } from '../types';

class PdfExportService {
  async exportLectureToPdf(lecture: Lecture): Promise<void> {
    const revisionHtml = lecture.revisionData
      ? `
      <div class="section">
        <h2>AI Revision Package</h2>
        <div class="card">
          <h3>Summary</h3>
          <p>${lecture.revisionData.summary}</p>
        </div>

        <div class="card">
          <h3>Key Takeaways</h3>
          <ul>
            ${lecture.revisionData.keyPoints.map(kp => `<li>${kp}</li>`).join('')}
          </ul>
        </div>

        ${
          lecture.revisionData.definitions && lecture.revisionData.definitions.length > 0
            ? `
          <div class="card">
            <h3>Definitions & Terminology</h3>
            <dl>
              ${lecture.revisionData.definitions.map(d => `<dt><strong>${d.term}:</strong></dt><dd>${d.definition}</dd>`).join('')}
            </dl>
          </div>
        `
            : ''
        }

        ${
          lecture.revisionData.formulas && lecture.revisionData.formulas.length > 0
            ? `
          <div class="card">
            <h3>Key Formulas & Theorems</h3>
            ${lecture.revisionData.formulas.map(f => `<p><code>${f.formula}</code> &mdash; ${f.explanation}</p>`).join('')}
          </div>
        `
            : ''
        }

        ${
          lecture.revisionData.mcqs && lecture.revisionData.mcqs.length > 0
            ? `
          <div class="card">
            <h3>Practice MCQs</h3>
            ${lecture.revisionData.mcqs
              .map(
                (m, idx) => `
              <div style="margin-bottom: 12px;">
                <p><strong>Q${idx + 1}: ${m.question}</strong></p>
                <ol type="A">
                  ${m.options.map((opt, oIdx) => `<li style="${oIdx === m.correctIndex ? 'font-weight: bold; color: #10B981;' : ''}">${opt}</li>`).join('')}
                </ol>
                <p style="font-size: 12px; color: #64748B;"><em>Explanation: ${m.explanation}</em></p>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    `
      : '';

    const boardPhotosHtml =
      lecture.boardPhotos && lecture.boardPhotos.length > 0
        ? `
      <div class="section">
        <h2>Lecture Whiteboard Photos (${lecture.boardPhotos.length})</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${lecture.boardPhotos.map(uri => `<img src="${uri}" style="max-width: 100%; height: auto; max-height: 350px; border-radius: 8px; border: 1px solid #CBD5E1; margin-bottom: 10px;" />`).join('')}
        </div>
      </div>
    `
        : '';

    const ocrHtml = lecture.ocrText
      ? `
      <div class="section">
        <h2>Transcribed Board Text (AI OCR)</h2>
        <div class="card code-box">
          <pre style="white-space: pre-wrap; font-family: monospace; font-size: 13px;">${lecture.ocrText}</pre>
        </div>
      </div>
    `
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${lecture.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              line-height: 1.6;
              padding: 24px;
            }
            .header {
              border-bottom: 2px solid #4F46E5;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 26px;
              font-weight: bold;
              color: #1E1B4B;
              margin: 0 0 6px 0;
            }
            .meta {
              display: flex;
              gap: 15px;
              font-size: 14px;
              color: #64748B;
            }
            .badge {
              display: inline-block;
              background-color: #EEF2FF;
              color: #4F46E5;
              padding: 4px 10px;
              border-radius: 9999px;
              font-weight: 600;
              font-size: 13px;
            }
            .section {
              margin-bottom: 24px;
            }
            h2 {
              font-size: 18px;
              color: #3730A3;
              border-left: 4px solid #4F46E5;
              padding-left: 8px;
              margin-bottom: 10px;
            }
            .card {
              background-color: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 14px;
              margin-bottom: 14px;
            }
            code {
              background-color: #E2E8F0;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #94A3B8;
              border-top: 1px solid #E2E8F0;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">${lecture.subject}</span>
            <h1 class="title">${lecture.title}</h1>
            <div class="meta">
              <span>Date: ${lecture.date}</span>
            </div>
          </div>

          <div class="section">
            <h2>Lecture Description & Topics</h2>
            <p>${lecture.description || 'No description provided.'}</p>
          </div>

          <div class="section">
            <h2>Classwork & In-Class Notes</h2>
            <div class="card">
              <p>${lecture.classwork || 'No classwork recorded.'}</p>
            </div>
          </div>

          ${boardPhotosHtml}
          ${ocrHtml}
          ${revisionHtml}

          <div class="footer">
            Generated with EduPulse AI &bull; Smart Student Study Assistant
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  }

  async exportNoteToPdf(note: Note): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${note.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              line-height: 1.6;
              padding: 24px;
            }
            .badge {
              background-color: #EEF2FF;
              color: #4F46E5;
              padding: 4px 10px;
              border-radius: 9999px;
              font-weight: 600;
              font-size: 13px;
            }
            .content {
              white-space: pre-wrap;
              font-size: 15px;
              background-color: #F8FAFC;
              padding: 16px;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <span class="badge">${note.subject}</span>
          <h1 style="color: #1E1B4B; margin-top: 8px;">${note.title}</h1>
          <p style="color: #64748B; font-size: 13px;">Last updated: ${new Date(note.updatedAt).toLocaleDateString()}</p>
          <div class="content">${note.content}</div>
          ${
            note.tags && note.tags.length > 0
              ? `<p style="margin-top: 15px; font-size: 13px; color: #64748B;">Tags: ${note.tags.join(', ')}</p>`
              : ''
          }
          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94A3B8;">
            Generated with EduPulse AI Study Assistant
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  }

  async exportStudyPlanToPdf(schedule: DailySchedule, studentName: string, field: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Daily Study Plan - ${schedule.date}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              padding: 24px;
            }
            .timeline-item {
              border-left: 3px solid #4F46E5;
              padding-left: 14px;
              margin-bottom: 16px;
            }
            .time {
              font-weight: bold;
              color: #4F46E5;
              font-size: 14px;
            }
            .task-title {
              font-size: 16px;
              font-weight: 600;
              margin: 2px 0;
            }
          </style>
        </head>
        <body>
          <h1 style="color: #1E1B4B; margin-bottom: 4px;">Daily Study Schedule</h1>
          <p style="color: #64748B; margin-top: 0;">Date: ${schedule.date} &bull; ${studentName} (${field})</p>
          <hr style="border: 0; border-top: 1px solid #E2E8F0; margin-bottom: 20px;" />
          ${schedule.tasks
            .map(
              t => `
            <div class="timeline-item">
              <div class="time">${t.time} (${t.durationMinutes}m) [${t.type.toUpperCase()}]</div>
              <div class="task-title">${t.title}</div>
              <div style="font-size: 13px; color: #64748B;">Subject: ${t.subject} &bull; ${t.notes}</div>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  }
}

export const pdfExport = new PdfExportService();
