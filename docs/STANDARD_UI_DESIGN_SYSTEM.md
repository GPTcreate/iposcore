# 🎨 탈(脫) AI 프로페셔널 UI/UX 표준 디자인 가이드
> **목적**: AI가 찍어낸 듯한 어색한 클리셰(무분별한 이모지, 화려한 그라데이션, 전형적인 3단 카드 등)를 완전히 탈피하고, **토스(Toss), 당근(Karrot), 업비트(Upbit)** 수준의 절제되고 신뢰감 있는 인간적인 감성의 프로덕트 표준 UI를 구축하기 위한 설계 가이드입니다.

---

## 1. AI UI 특유의 6대 클리셰 (왜 AI 티가 나는가?)

사용자들은 무의식중에 "이거 AI가 대충 만든 사이트네"라고 느낍니다. 그 원인은 다음 6가지 패턴에 있습니다.

| AI 클리셰 패턴 | 왜 어색하고 저렴해 보이는가? | 프로 디자이너의 처방 (Human Standard) |
|---|---|---|
| **1. 헤딩마다 붙는 무지개 이모지**<br>(💡, 🚀, 🔥, ✨, 📈 남발) | 장난감 같고 금융/비즈니스 서비스의 신뢰도를 급격히 떨어뜨림 | 이모지를 전면 제거하고 **16~20px 단색 SVG 라인 아이콘** 또는 **볼드 텍스트 뱃지**만 절제하여 사용 |
| **2. 쨍한 무지개 그라데이션**<br>(`from-purple-500 to-indigo-600`) | 2020년 템플릿 느낌이며 콘텐츠 집중을 방해함 | **단색 플랫 컬러(Flat Solid)** 사용, 배경은 화이트(`bg-white`)와 미세한 회색(`bg-[#F2F4F6]`) 단 2단계로만 대비 |
| **3. 도장 찍듯 찍어낸 3단 카드**<br>(Icon + Title + Gray Desc x 3) | 랜딩페이지 템플릿의 전형적인 AI 양산형 레이아웃 | 카드 속에 또 카드를 넣는 중첩을 없애고, **선(Divider)과 여백(White space)**만으로 자연스럽게 정보 구루핑 |
| **4. 과도한 알약 라운딩**<br>(`rounded-2xl`, `rounded-3xl` 남발) | 모든 컨테이너가 둥글넓적해서 프로덕트가 둔탁해 보임 | 컨테이너는 `rounded-xl(12px)` 또는 `rounded-lg(8px)`로 정돈하고, 뱃지/버튼에만 한정적으로 라운딩 적용 |
| **5. 뭉개진 그림자 효과**<br>(`shadow-xl`, `shadow-2xl`) | 허공에 붕 뜬 느낌을 줘서 모바일 가독성 저하 | 그림자를 거의 쓰지 않거나(`shadow-none`), **1px의 아주 얇은 보더(`border-[#E5E8EB]`)**로 경계선만 단정하게 정의 |
| **6. 로봇 같은 AI 마이크로카피**<br>("혁신적인", "한눈에", "최고의 스마트") | 공허한 수식어로 가득 차서 실제 효용이 전달 안 됨 | **구체적인 행동과 숫자 중심의 직관적 구어체** ("3초 만에 확인", "놓치면 4일 대기") |

---

## 2. 디자인 시스템 파운데이션 (Foundation)

### 2.1 폰트 & 타이포그래피 (Typography)
한국어 UI는 **자간(Letter-spacing)**과 **행간(Line-height)**이 퀄리티의 80%를 결정합니다.

* **표준 서체**: `Pretendard`, `SUIT`, 또는 `Apple SD Gothic Neo`
* **한국어 특화 자간 규칙 (핵심)**:
  * 제목 (Heading): `tracking-[-0.03em]` (약간 조여야 단단하고 세련됨)
  * 본문 (Body): `tracking-[-0.01em]`
  * 숫자/영문 데이터: `font-variant-numeric: tabular-nums` (금액, 퍼센트 줄맞춤 필수)
* **텍스트 위계 4단계**:
  1. **Primary (`#191F28`)**: 완전한 블랙(`black`) 대신 눈이 편안한 짙은 차콜
  2. **Secondary (`#4E5968`)**: 부가 설명, 중간 서브텍스트
  3. **Tertiary (`#8B95A1`)**: 날짜, 힌트, 보조 라벨
  4. **Disabled (`#B0B8C1`)**: 비활성화, 플레이스홀더

```css
/* Tailwind 설정 가이드 */
.text-toss-title {
  font-size: 1.375rem; /* 22px */
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.03em;
  color: #191F28;
}

.text-toss-body {
  font-size: 0.9375rem; /* 15px */
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: #4E5968;
}
```

---

### 2.2 컬러 팔레트 (Color Palette)
색상은 **기능적 목적**이 있을 때만 사용합니다. 장식용 색상은 배제합니다.

* **Background Layer**:
  * 바닥(Base): `#F2F4F6` (Toss Gray 100)
  * 카드/서피스: `#FFFFFF` (White)
  * 활성 상태/포커스: `#F9FAFB`
* **Brand / Primary**:
  * 핀테크/신뢰형: `#0064FF` (Toss Blue) 또는 `#1B64DA`
  * 액션/CTA: `#0050D8` (Hover 시)
* **Semantic Status**:
  * 상승 / 주의 / 오류: `#E53E3E` (또는 주식 상승 빨간색 `#F04452`)
  * 하락 / 안정: `#3182CE` (또는 주식 하락 파란색 `#1F77F4`)
  * 성공 / 완료: `#059669` (Emerald 600)
* **Border Line**:
  * 기본 구분선: `#E5E8EB` (0.5~1px 실선)
  * 강조 보더: `#D1D6DB`

---

## 3. 탈(脫) AI 컴포넌트 실전 레시피

### 3.1 모바일 리스트 아이템 (토스 스타일 Edge-to-edge)
AI는 모든 항목을 박스 카드로 만드려고 하지만, 인간 프로덕트는 **경계선 없는 리스트**를 선호합니다.

```tsx
// ❌ AI 스타일: 테두리 둥글고 그림자 잔뜩 들어간 박스
<div className="rounded-2xl p-5 shadow-lg border border-purple-200 bg-gradient-to-r ...">

// ✅ 프로 스타일: 깔끔한 여백과 탭하기 편한 높이의 리스트 행
<div className="flex items-center justify-between py-3.5 px-4 bg-white active:bg-gray-50 transition-colors border-b border-[#F2F4F6]">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-[#F2F4F6] flex items-center justify-center text-sm font-bold text-[#191F28]">
      멜
    </div>
    <div>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-[#191F28] text-base tracking-tight">멜콘</span>
        <span className="text-xs text-[#8B95A1] font-mono">377480</span>
      </div>
      <p className="text-xs text-[#4E5968] mt-0.5">공모가 15,500원 · 경쟁률 1,136:1</p>
    </div>
  </div>
  <div className="text-right">
    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[#E8F3FF] text-[#0064FF]">
      청약 중
    </span>
  </div>
</div>
```

---

### 3.2 상태 뱃지 (Status Badge)
배경색과 글자색의 명도 대비를 철저히 지킵니다. (텍스트는 짙게, 배경은 은은한 파스텔톤)

* **진행 중**: `bg-[#FEECEE] text-[#F04452]` (은은한 레드)
* **예정 / 준비**: `bg-[#E8F3FF] text-[#0064FF]` (은은한 블루)
* **완료 / 취소**: `bg-[#F2F4F6] text-[#6B7684]` (소프트 그레이)

---

### 3.3 입력 폼 & 바텀 액션 버튼 (Mobile Thumb-Zone)
* 모바일에서는 화면 상단에 확인 버튼을 두지 않고, **스크린 하단 고정 바(Bottom Sticky CTA)**를 제공합니다.
* 인풋 필드는 회색 배경(`bg-[#F9FAFB]`)에서 클릭(Focus) 시 흰색 배경 + 얇은 파란색 아웃라인(`border-[#0064FF]`)으로 전환되는 토스 인터랙션을 적용합니다.

```tsx
<input 
  type="text"
  placeholder="이메일을 입력해 주세요"
  className="w-full px-4 py-3.5 rounded-xl bg-[#F2F4F6] focus:bg-white border border-transparent focus:border-[#0064FF] text-[#191F28] placeholder-[#8B95A1] text-base outline-none transition-all"
/>
```

---

## 4. 마이크로카피(문구) 가이드 (인간적인 톤앤매너)

| 상황 | AI 특유의 번역투 / 기계적 문구 | 사람이 쓴 신뢰감 있는 마이크로카피 |
|---|---|---|
| **입력 유도** | "귀하의 소중한 이메일을 기입하십시오." | "리포트를 받을 이메일을 입력해 주세요" |
| **청약 마감** | "금일 청약이 종료되오니 유의 바람." | "오늘 청약이 마감돼요 (오후 4시까지)" |
| **수신 동의** | "회원 가입 및 정보 제공에 동의함." | "동의하고 이번 주 리포트 받기" |
| **수신 취소** | "구독 취소 절차가 성공적으로 수행됨." | "수신 거부가 완료되었어요. 언제든 다시 신청할 수 있어요" |
| **경쟁률 안내** | "기관투자자 수요예측 경쟁률 1136:1 도달" | "기관 1,136곳이 몰렸어요 (흥행 성공)" |

---

## 5. 앞으로 만들 서비스에 바로 적용하는 체크리스트 (5-Point Audit)

새로운 화면이나 기능을 만들 때 아래 5가지만 점검하면 AI 티를 100% 지울 수 있습니다:

1. [ ] **이모지 점검**: `💡`, `🚀`, `🔥` 같은 이모지가 헤딩이나 설명에 들어가지 않았는가?
2. [ ] **색상 점검**: 보라색-인디고 그라데이션이 빠지고, 뚜렷한 단색 포인트 컬러 1개만 쓰였는가?
3. [ ] **카드 중첩 점검**: 큰 카드 안에 또 작은 카드를 넣지 않고, 선이나 간격으로 분리했는가?
4. [ ] **자간 점검**: 제목에 `tracking-tight`(-0.03em)가 적용되어 글자가 단단하게 묶였는가?
5. [ ] **모바일 엄지손가락 점검**: 중요한 버튼이 화면 하단(Thumb zone)에 큼직하게 자리 잡았는가?

---

*작성일자: 2026-10-01*  
*관리: 공모주 알리미 프로덕트 팀*
