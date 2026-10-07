/* eslint-disable */
/**
 * ============================================================================
 * [공모주 알리미] 구글 스프레드시트 실시간 자동 동기화 & 영속 저장소 Apps Script 코드
 * ============================================================================
 * 
 * [간편 설정 3단계 (약 1분 소요)]
 * 1. 구글 스프레드시트(새 문서) 생성
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 3. 기본 내용을 모두 지우고 아래 코드를 그대로 붙여넣은 뒤 [배포] -> [새 배포] 클릭
 *    - 종류: 웹 앱 (Web app)
 *    - 실행 권한: 나 (내 계정)
 *    - 액세스 권한: 모든 사용자 (Anyone)  <-- 중요! (서버리스 웹훅 수신용)
 * 4. 생성된 [웹 앱 URL] 복사 후 Vercel 환경변수 또는 .env.local에 등록:
 *    GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 * 
 * [동작 기능]
 * - 신규 구독 신청 시: 시트에 자동으로 행 추가 (상태: '인증대기' 또는 '구독중', 인증/해지 토큰 보존)
 * - 메일 동의 완료 시: 해당 이메일 행을 찾아 상태를 '구독중(ACTIVE)'으로 변경 및 배경색 녹색 변경
 * - 수신 거부(취소) 시: 해당 이메일 행을 찾아 상태를 '수신취소(CANCELLED)'로 변경 및 배경색 회색 변경
 * - 서버리스 복원(GET): 서버리스 콜드 스타트 시 시트 데이터를 JSON으로 반환하여 영속 복원 지원
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 첫 실행 시 헤더 자동 생성 (10개 열)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "이메일 (Email)",
        "구독 상태 (Status)",
        "수신 주기 (Frequency)",
        "신청 일시 (Subscribed At)",
        "인증/동의 일시 (Verified At)",
        "수신취소 일시 (Unsubscribed At)",
        "최종 업데이트 (Updated At)",
        "구독 ID",
        "인증 토큰 (Verification Token)",
        "수신거부 토큰 (Unsubscribe Token)"
      ]);
      
      // 헤더 스타일링
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setBackground("#1d4ed8");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var contents = JSON.parse(e.postData.contents);
    var action = contents.action || "SUBSCRIBE";
    var email = (contents.email || "").toLowerCase().trim();
    var status = contents.status || "PENDING";
    var statusLabel = contents.statusLabel || (status === "ACTIVE" ? "구독중" : status === "PENDING" ? "인증대기" : "수신취소");
    var frequency = contents.frequency || "모든 청약 실시간";
    var subscribedAt = contents.subscribedAt || new Date().toISOString();
    var verifiedAt = contents.verifiedAt || "";
    var unsubscribedAt = contents.unsubscribedAt || "";
    var nowFormatted = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var subId = contents.id || "";
    var verificationToken = contents.verificationToken || "";
    var unsubscribeToken = contents.unsubscribeToken || "";

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;

    // 기존 등록된 이메일 행 검색 (2번째 행부터)
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase().trim() === email) {
        rowIndex = i + 1; // 1-indexed
        break;
      }
    }

    if (rowIndex > 0) {
      // 1. 기존 행 업데이트 (상태 변경 등)
      sheet.getRange(rowIndex, 2).setValue(statusLabel);
      if (frequency) sheet.getRange(rowIndex, 3).setValue(frequency);
      if (verifiedAt) sheet.getRange(rowIndex, 5).setValue(verifiedAt);
      if (unsubscribedAt) sheet.getRange(rowIndex, 6).setValue(unsubscribedAt);
      sheet.getRange(rowIndex, 7).setValue(nowFormatted);
      if (verificationToken) sheet.getRange(rowIndex, 9).setValue(verificationToken);
      if (unsubscribeToken) sheet.getRange(rowIndex, 10).setValue(unsubscribeToken);

      // 상태별 행 배경색 하이라이트
      var statusCell = sheet.getRange(rowIndex, 2);
      if (status === "ACTIVE") {
        statusCell.setBackground("#d1fae5").setFontColor("#065f46"); // 초록
      } else if (status === "CANCELLED") {
        statusCell.setBackground("#f3f4f6").setFontColor("#6b7280"); // 회색
      } else {
        statusCell.setBackground("#fef3c7").setFontColor("#92400e"); // 노랑
      }
    } else {
      // 2. 신규 행 추가
      sheet.appendRow([
        email,
        statusLabel,
        frequency,
        subscribedAt,
        verifiedAt,
        unsubscribedAt,
        nowFormatted,
        subId,
        verificationToken,
        unsubscribeToken
      ]);

      var newRow = sheet.getLastRow();
      var newStatusCell = sheet.getRange(newRow, 2);
      if (status === "ACTIVE") {
        newStatusCell.setBackground("#d1fae5").setFontColor("#065f46");
      } else if (status === "CANCELLED") {
        newStatusCell.setBackground("#f3f4f6").setFontColor("#6b7280");
      } else {
        newStatusCell.setBackground("#fef3c7").setFontColor("#92400e");
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", action: action, email: email }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var subscribers = [];

    // 헤더 제외 데이터 행 파싱
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var email = String(row[0] || "").toLowerCase().trim();
      if (!email) continue;

      var statusLabel = String(row[1] || "");
      var status = "PENDING";
      if (statusLabel === "구독중" || statusLabel === "ACTIVE") {
        status = "ACTIVE";
      } else if (statusLabel === "수신취소" || statusLabel === "CANCELLED") {
        status = "CANCELLED";
      }

      var frequencyLabel = String(row[2] || "");
      var frequency = frequencyLabel.indexOf("월요일") !== -1 || frequencyLabel === "WEEKLY" ? "WEEKLY" : "ALL";

      subscribers.push({
        email: email,
        status: status,
        frequency: frequency,
        subscribedAt: row[3] ? String(row[3]) : new Date().toISOString(),
        verifiedAt: row[4] ? String(row[4]) : undefined,
        unsubscribedAt: row[5] ? String(row[5]) : undefined,
        id: row[7] ? String(row[7]) : ("sub_" + i),
        verificationToken: row[8] ? String(row[8]) : "",
        unsubscribeToken: row[9] ? String(row[9]) : ""
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", count: subscribers.length, subscribers: subscribers }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: err.toString(), subscribers: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
