// 이메일 유효성 검사 및 가짜/일회용 메일 필터링 유틸리티

// 1. 대표적인 일회용/임시 이메일(Burner/Disposable Email) 도메인 차단 목록
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'tempmail.com',
  'tempmail.net',
  'temp-mail.org',
  'temp-mail.io',
  'mailinator.com',
  'dispostable.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'getnada.com',
  'nada.ltd',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'generator.email',
  'mohmal.com',
  'crazymailing.com',
  'tmail.ws',
  'inboxkitten.com',
  'mytemp.email',
  'emailondeck.com',
  'dropmail.me',
  'tempail.com',
  'burnermail.io',
  'fakeinbox.com',
  'mailcatch.com',
  'mintemail.com',
  'discard.email',
  'spambog.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'nowmymail.com',
  'spam4.me',
  'maildrop.cc',
  'binkmail.com',
  'safetymail.info',
  'mailnesia.com',
]);

// 2. 명백한 장난/테스트 더미 이메일 패턴
const FAKE_LOCAL_PARTS = new Set([
  'test',
  'testing',
  'asdf',
  'asdfgh',
  'qwer',
  'qwerty',
  'aaa',
  'bbb',
  'ccc',
  '111',
  '123',
  '1234',
  '12345',
  '123456',
  'admin',
  'administrator',
  'root',
  'noreply',
  'no-reply',
  'null',
  'undefined',
  'fake',
  'sample',
  'example',
]);

// 3. 흔한 도메인 오타 교정 매핑 (국내 주요 포털 포함)
const DOMAIN_TYPO_MAP: Record<string, string> = {
  'naver.con': 'naver.com',
  'naver.co': 'naver.com',
  'naver.cm': 'naver.com',
  'navr.com': 'naver.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'daum.ne': 'daum.net',
  'daum.con': 'daum.net',
  'daum.com': 'daum.net',
  'hanmail.ne': 'hanmail.net',
  'hanmail.con': 'hanmail.net',
  'hanmail.com': 'hanmail.net',
  'kakao.con': 'kakao.com',
  'nate.con': 'nate.com',
};

export interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  normalizedEmail: string;
  suggestedCorrection?: string;
}

export function validateEmail(rawEmail: string): EmailValidationResult {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      isValid: false,
      reason: '이메일 주소를 입력해주세요.',
      normalizedEmail: '',
    };
  }

  const email = rawEmail.trim().toLowerCase();

  // 길이 체크 (RFC 5321 규격: 254자 이내)
  if (email.length > 254 || email.length < 5) {
    return {
      isValid: false,
      reason: '이메일 주소 길이가 올바르지 않습니다 (5~254자).',
      normalizedEmail: email,
    };
  }

  // RFC 표준 기본 이메일 정규식
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      reason: '올바른 이메일 형식이 아닙니다 (예: yourname@domain.com).',
      normalizedEmail: email,
    };
  }

  const [localPart, domain] = email.split('@');

  // 로컬 파트 단일 문자 또는 너무 짧은 더미 체크
  if (!localPart || !domain || localPart.length < 2) {
    return {
      isValid: false,
      reason: '이메일 아이디 부분이 너무 짧습니다.',
      normalizedEmail: email,
    };
  }

  // 도메인 오타 제안 및 차단 확인
  if (DOMAIN_TYPO_MAP[domain]) {
    const suggested = `${localPart}@${DOMAIN_TYPO_MAP[domain]}`;
    return {
      isValid: false,
      reason: `이메일 도메인(@${domain})에 오타가 있는 것 같습니다.`,
      normalizedEmail: email,
      suggestedCorrection: suggested,
    };
  }

  // 일회용 임시 메일 도메인 차단
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      reason: '일회용 또는 임시 이메일 주소로는 뉴스레터를 신청하실 수 없습니다. 정상적인 개인 이메일을 입력해주세요.',
      normalizedEmail: email,
    };
  }

  // 장난성 로컬 파트 차단 (예: test@, asdf@, 1234@ 등)
  if (FAKE_LOCAL_PARTS.has(localPart)) {
    return {
      isValid: false,
      reason: '테스트용 또는 허위 이메일 아이디로 감지되었습니다. 실제 사용하시는 이메일을 입력해주세요.',
      normalizedEmail: email,
    };
  }

  // 연속된 동일 문자 반복 차단 (예: aaaaaa@, 111111@)
  if (/^(.)\1{4,}$/.test(localPart)) {
    return {
      isValid: false,
      reason: '유효하지 않은 반복 문자 이메일입니다. 실제 이메일을 입력해주세요.',
      normalizedEmail: email,
    };
  }

  // 도메인 유효 TLD(최상위 도메인) 체크 (최소 2자리 이상)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {
      isValid: false,
      reason: '유효하지 않은 도메인 확장자입니다.',
      normalizedEmail: email,
    };
  }

  return {
    isValid: true,
    normalizedEmail: email,
  };
}
