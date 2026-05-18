const FORM_ID = '1m4wDWCItM1ih0w-ou76QVYTcLkCimnJrXh5zNQ7_M9A';

function setupAutoReplyTrigger() {
  const form = FormApp.openById(FORM_ID);

  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'sendAutoReply')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger('sendAutoReply')
    .forForm(form)
    .onFormSubmit()
    .create();
}

function setupFormEligibilityFields() {
  const form = FormApp.openById(FORM_ID);
  form.setDescription(
    '2026년 6월 21일 일요일 오후 3시, 온라인으로 진행되는 무료 3시간 특강입니다. ' +
    'ChatGPT 유료 계정 사용과 로컬 Codex 앱 설치 완료를 기본 수강 기준으로 합니다. ' +
    '신청 완료 후 자동 응답 메일이 발송되며, 온라인 접속 링크는 강의 전 별도 안내됩니다.'
  );

  ensureRequiredMultipleChoiceItem(form, 'ChatGPT 유료 계정을 사용 중인가요?', ['예', '아니오']);
  ensureRequiredMultipleChoiceItem(form, '로컬 Codex 앱을 설치했나요?', ['설치 완료', '아직 설치 전']);
}

function sendAutoReply(e) {
  const namedValues = e.namedValues || {};
  const response = e.response;
  const email = getRespondentEmail(response, namedValues);
  const name = getAnswer(namedValues, ['이름']) || '신청자';

  if (!email) {
    throw new Error('신청자 이메일을 찾을 수 없습니다. Google Form의 이메일 수집 설정을 확인하세요.');
  }

  const subject = '[신청 완료] Codex 입문 3시간 온라인 특강';
  const plainBody = createPlainBody(name);
  const htmlBody = createHtmlBody(name);

  MailApp.sendEmail({
    to: email,
    subject,
    body: plainBody,
    htmlBody,
    name: '위브앤'
  });
}

function getRespondentEmail(response, namedValues) {
  if (response && typeof response.getRespondentEmail === 'function') {
    const collectedEmail = response.getRespondentEmail();
    if (collectedEmail) return collectedEmail;
  }

  return getAnswer(namedValues, ['이메일', '이메일 주소', 'Email', 'Email Address']);
}

function getAnswer(namedValues, keys) {
  for (const key of keys) {
    const value = namedValues[key];
    if (Array.isArray(value) && value[0]) return value[0];
    if (typeof value === 'string' && value) return value;
  }
  return '';
}

function ensureRequiredMultipleChoiceItem(form, title, choices) {
  const exists = form.getItems().some(item => item.getTitle() === title);
  if (exists) return;

  form.addMultipleChoiceItem()
    .setTitle(title)
    .setChoiceValues(choices)
    .setRequired(true);
}

function createPlainBody(name) {
  return `
${name}님, 안녕하세요.

Codex를 처음 사용하는 사람들을 위한 가이드 특강 신청이 완료되었습니다.

- 일시: 2026년 6월 21일 일요일 오후 3시
- 진행: 온라인
- 시간: 3시간
- 참가비: 무료
- 강사: 위브앤 파트너 그룹

기본 수강 기준
- ChatGPT 유료 계정 사용
- 로컬 Codex 앱 설치 완료
- 실습할 프로젝트 폴더 준비 권장

온라인 접속 링크는 강의 전 별도 안내드리겠습니다.

문의: ceo@wilab.co.kr

감사합니다.
위브앤 드림
`.trim();
}

function createHtmlBody(name) {
  return `
<div style="font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.7;color:#17212b;max-width:640px">
  <h2 style="margin:0 0 16px;font-size:22px">신청이 완료되었습니다</h2>
  <p>${escapeHtml(name)}님, 안녕하세요.</p>
  <p><strong>Codex를 처음 사용하는 사람들을 위한 가이드</strong> 특강 신청이 완료되었습니다.</p>
  <ul style="padding-left:20px">
    <li>일시: 2026년 6월 21일 일요일 오후 3시</li>
    <li>진행: 온라인</li>
    <li>시간: 3시간</li>
    <li>참가비: 무료</li>
    <li>강사: 위브앤 파트너 그룹</li>
  </ul>
  <p><strong>기본 수강 기준</strong></p>
  <ul style="padding-left:20px">
    <li>ChatGPT 유료 계정 사용</li>
    <li>로컬 Codex 앱 설치 완료</li>
    <li>실습할 프로젝트 폴더 준비 권장</li>
  </ul>
  <p>온라인 접속 링크는 강의 전 별도 안내드리겠습니다.</p>
  <p>문의: <a href="mailto:ceo@wilab.co.kr">ceo@wilab.co.kr</a></p>
  <p style="margin-top:28px">감사합니다.<br />위브앤 드림</p>
</div>
`.trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
