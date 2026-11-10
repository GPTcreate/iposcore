/** Verify the scope of an article before its link or opinion enters a stock card. */

export const SINGLE_ISSUER_REVIEW_POLICY = 'single-issuer-analysis-v1';

type Issuer = { id: string; name: string };
type AliasMatch = (text: string, stockName: string) => string | null;

const roundupTitle = /주간(?=\s|공모|일정|$)|월간(?=\s|공모|일정|$)|[0-9]+\s*주차|(?:이번|다음)\s*주\s*(?:공모주|청약|일정)|(?:[0-9]+|여러)\s*종목|캘린더|청약\s*달력|공모주\s*모아보기|동시\s*(?:청약|분석)|(?:공모주|종목)\s*비교|맞대결|(?:^|[\s\p{P}])vs(?=[\s\p{P}]|$)/iu;
const analysisAxes = [
  /공모가|희망\s*(?:공모가|밴드)|공모\s*금액/u,
  /수요\s*예측|기관.{0,12}경쟁률|기관\s*경쟁률/u,
  /의무\s*보유|확약/u,
  /유통\s*(?:가능|물량|비율)|보호\s*예수|시가\s*총액|밸류에이션|기업가치|주가수익비율|\bPER\b/iu,
  /사업\s*(?:부문|모델|현황)|주력\s*(?:제품|사업)|매출|영업\s*이익|성장성|실적|적자|흑자|제품|고객사|사업위험/u,
  /상장\s*직후|청약\s*매력|투자\s*(?:위험|매력)|손실\s*위험|리스크/u,
];
const prose = /(?:습니다|입니다|했고|했으며|했다|한다|된다|있다|없다|해요|봐요|보여요|것으로|수준으로|가능성이|부담이|관건|변수|상회|하회|높아|낮아)/u;
const headingPrefix = /^(?:[\s#▶●■◆★※【\[<(]+|[0-9]+[.)]\s*|[①-⑳]\s*)*/u;
const issuerSection = /^(?:[은는의]\s*)?(?:공모주|공모\s*조건|청약|상장|수요\s*예측|기업\s*(?:분석|개요)|사업\s*개요|확정\s*공모가|공모가)/u;
const issuerIntroduction = /공모주|공모\s*조건|수요\s*예측|청약\s*(?:조건|분석)|알아보|살펴보|기업\s*(?:분석|개요)/u;
const auxiliary = /^(?:#[^\s#]+|관련\s*글|함께\s*보면|이전\s*글|다음\s*글)/u;

export function isSingleIssuerTitle(title: string, issuer: Issuer, known: Issuer[], aliasMatch: AliasMatch): boolean {
  const alias = aliasMatch(title, issuer.name);
  if (!alias || roundupTitle.test(title)) return false;
  const after = title.slice(title.indexOf(alias) + alias.length);
  if (/^\s*(?:과|와|및)(?=\s|$)/u.test(after)) return false;
  return !known.some(other => other.id !== issuer.id && aliasMatch(title, other.name));
}

export function isSingleIssuerAnalysis(paragraphs: string[], issuer: Issuer, known: Issuer[], aliasMatch: AliasMatch): boolean {
  // A feed title, search-result snippet, or one stray mention is insufficient.
  const body = paragraphs.filter(paragraph => !auxiliary.test(paragraph));
  const anchor = body.findIndex(paragraph => aliasMatch(paragraph, issuer.name));
  if (anchor < 0 || anchor > 6) return false;
  const others = known.filter(other => other.id !== issuer.id);
  const editorial: string[] = [];
  let targetSection = false;
  for (const paragraph of body.slice(anchor)) {
    const heading = paragraph.replace(headingPrefix, '');
    const leadingOther = others.some(other => {
      const alias = aliasMatch(heading.slice(0, 100), other.name);
      return alias && heading.startsWith(alias) && (!heading.slice(alias.length).trim() || issuerSection.test(heading.slice(alias.length).trim()));
    });
    const shortHeading = paragraph.length <= 100 && !prose.test(paragraph);
    if (leadingOther && shortHeading) return false;
    // Unregistered issuers can still form an obviously separate numbered section.
    const alias = aliasMatch(heading, issuer.name);
    if (shortHeading && /^(?:[0-9]+[.)]|[①-⑳])/u.test(paragraph) && !alias
      && /^[\p{L}\p{N}]{2,30}\s+(?:공모주|IPO)\s+(?:분석|청약|일정|수요예측)/iu.test(heading)) return false;
    if (leadingOther) continue;
    if (alias && (heading === alias || issuerIntroduction.test(paragraph) || analysisAxes.some(axis => axis.test(paragraph)))) targetSection = true;
    editorial.push(paragraph);
  }
  const axes = analysisAxes.filter(axis => editorial.some(paragraph => axis.test(paragraph)));
  return targetSection && axes.length >= 2 && editorial.some(paragraph => paragraph.length >= 26 && prose.test(paragraph) && axes.some(axis => axis.test(paragraph)));
}
