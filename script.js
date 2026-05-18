const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScvKkqPTDFCi1t5AUZiHIPvEMdBTa37Uj6yAkNSH4xkvyFCGw/viewform?usp=publish-editor";

const formLink = document.querySelector("#formLink");
const formNote = document.querySelector("#formNote");

if (FORM_URL && FORM_URL.startsWith("https://")) {
  formLink.href = FORM_URL;
  formLink.textContent = "구글 폼으로 무료 신청하기";
  formLink.target = "_blank";
  formLink.rel = "noopener";
  formNote.textContent = "신청 완료 후 자동 응답 메일이 발송됩니다.";
}
