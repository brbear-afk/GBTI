# 글BTI 평가 Rubric v1.0

## 1. 목적

이 문서는 글BTI의 문체 평가 기준을 정의한다.

글BTI는 사용자가 작성한 여러 개의 글을 바탕으로 다음 5개 축을 평가한다.

- S / L — Short / Long
- R / E — Repressed / Expressed
- P / O — Plain / Ornate
- C / A — Concrete / Abstract
- G / B — Gloomy / Bright

각 축의 평가는 Gemini가 수행하며, 백엔드는 Gemini가 반환한 점수를 바탕으로 가중평균, 안정성 계산, 최종 유형 판정을 담당한다.

---

## 2. 공통 평가 원칙

### 2.1 점수의 의미

0~100 점수는 확률이 아니라 양극 축에서의 상대적 위치를 의미한다.

```text
0 ---------------- 50 ---------------- 100
A쪽 극단            균형                B쪽 극단
```

예:

```text
Long Score 0   = 매우 강한 Short
Long Score 50  = Short / Long 균형
Long Score 100 = 매우 강한 Long
```

### 2.2 50점의 의미

50점은 **두 성향이 실제로 균형을 이루는 상태**다.

다음을 의미하지 않는다.

- 판단하기 어렵다.
- 근거가 부족하다.
- 잘 모르겠다.

근거가 부족한 경우에는 별도의 `observability`를 사용한다.

---

## 3. 점수 방향

| 축 | 0점 | 100점 | JSON 필드 |
|---|---|---|---|
| S/L | Short | Long | `long` |
| R/E | Expressed | Repressed | `repressed` |
| P/O | Plain | Ornate | `ornate` |
| C/A | Abstract | Concrete | `concrete` |
| G/B | Bright | Gloomy | `gloomy` |

---

# 4. S / L — Short ↔ Long

## 정의

단순한 문장 글자 수가 아니라 **서술과 사고의 호흡이 얼마나 오래 유지되는가**를 평가한다.

### 0 — 매우 강한 Short
- 생각·행동·묘사를 거의 항상 짧은 단위로 끊는다.
- 하나의 내용을 거의 확장하지 않고 빠르게 다음 정보로 이동한다.

### 25 — Short 우세
- 짧은 호흡이 명확하게 우세하다.
- 가끔 긴 문장이 있어도 전체 진행은 빠르고 단위별로 분명하게 끊긴다.

### 50 — 균형
- 짧게 끊는 부분과 길게 확장하는 부분이 비슷하다.
- 상황에 따라 두 방식을 모두 활용한다.

### 75 — Long 우세
- 하나의 사건·감정·생각을 여러 단계로 확장하는 경우가 많다.
- 상황 → 생각 → 이유 → 해석 등이 자주 이어진다.

### 100 — 매우 강한 Long
- 주요 장면 대부분에서 하나의 생각이나 감각을 오랫동안 발전시킨다.
- 중첩된 사고와 묘사가 문체의 핵심 리듬을 이룬다.

### 혼동 방지

긴 문장이라고 반드시 Long은 아니다.

```text
그는 문을 열고 들어가 가방을 내려놓은 뒤 창문을 열고 의자를 당겨 앉았다.
```

행동을 단순 연결한 것이므로 물리적으로 긴 문장이지만 반드시 긴 서술 호흡은 아니다.

반대로 개별 문장이 짧아도 하나의 사고가 계속 발전하면 Long 성향을 가질 수 있다.

### Gemini 필수 규칙

> 평균 문장 길이만으로 S/L을 결정하지 않는다. 문장과 문단을 가로질러 하나의 사고·행동·묘사가 얼마나 오래 확장되는지를 우선 평가한다.

---

# 5. R / E — Repressed ↔ Expressed

## 정의

**감정을 독자에게 얼마나 직접적으로 전달하는지**를 평가한다.

### 0 — 매우 강한 Expressed
- 감정을 지속적으로 직접 명명하고 설명한다.
- 독자가 인물의 감정을 추론할 필요가 거의 없다.

### 25 — Expressed 우세
- 직접적인 감정·심리 설명이 우세하다.
- 행동이나 대사를 통한 간접 표현도 일부 사용한다.

### 50 — 균형
- 직접 설명과 행동·대사·상징을 통한 간접 표현이 비슷하다.

### 75 — Repressed 우세
- 감정을 직접 이름 붙이는 것을 상당히 절제한다.
- 행동·대사·사물·분위기를 통해 전달한다.

### 100 — 매우 강한 Repressed
- 중요한 감정을 거의 직접 설명하지 않는다.
- 독자가 행동, 침묵, 상징, 맥락을 통해 감정을 적극적으로 추론해야 한다.

### 혼동 방지

**캐릭터가 감정을 억누르는 것 ≠ Repressed 문체**

```text
그는 울고 싶었지만 필사적으로 감정을 억눌렀다.
슬픔과 분노가 동시에 밀려왔다.
```

캐릭터는 감정을 억제하지만 서술자가 슬픔과 분노를 직접 알려주므로 Expressed 쪽이다.

반대로:

```text
그는 한동안 대답하지 않았다.
손에 들고 있던 종이를 반으로 접어 주머니에 넣었다.
```

감정이 직접 설명되지 않으므로 Repressed 쪽이다.

### Gemini 필수 규칙

> 인물이 감정을 숨기는지를 평가하지 않는다. 서술자가 독자에게 감정을 얼마나 직접적으로 공개하는지를 평가한다.

---

# 6. P / O — Plain ↔ Ornate

## 정의

문장의 난이도가 아니라 **표현의 장식성·이미지·감각 묘사의 밀도**를 평가한다.

### 0 — 매우 강한 Plain
- 필요한 정보와 행동만 담백하게 전달한다.
- 수식·감각 표현·비유·이미지가 거의 없다.

### 25 — Plain 우세
- 평이하고 기능적인 표현이 중심이다.
- 중요한 부분에만 제한적으로 묘사를 추가한다.

### 50 — 균형
- 담백한 표현과 장식적인 표현이 비슷하게 공존한다.

### 75 — Ornate 우세
- 감각 묘사·수식·비유·이미지가 자주 등장한다.
- 분위기 형성에 표현 자체가 중요한 역할을 한다.

### 100 — 매우 강한 Ornate
- 표현 자체가 글의 핵심적인 즐거움이 될 정도로 이미지·수식·비유·감각 묘사가 지속적으로 중첩된다.

### 혼동 방지

**어려운 어휘 ≠ Ornate**

```text
존재론적 인식의 불확정성을 인지했다.
```

어휘는 어렵지만 표현 장식은 적으므로 Plain일 수 있다.

반대로:

```text
빗방울이 유리창을 타고 가느다란 은빛 자국을 남겼다.
```

쉬운 어휘지만 감각적 이미지가 있으므로 Ornate 쪽이다.

또한 Long과 Ornate는 독립 축이다. 길고 복잡한 논리 문장은 Long + Plain일 수 있다.

### Gemini 필수 규칙

> P/O는 어휘 난도나 문장 길이가 아니라 표현 장식의 밀도를 평가한다.

---

# 7. C / A — Concrete ↔ Abstract

## 정의

글의 관심이 **구체적 현실을 향하는지, 개념과 해석을 향하는지** 평가한다.

### 0 — 매우 강한 Abstract
- 사건과 사물보다 의미·기억·관계·존재·가치·가능성 같은 관념이 중심이다.

### 25 — Abstract 우세
- 구체적 장면은 존재하지만 대부분 생각과 의미를 전개하기 위한 발판으로 사용된다.

### 50 — 균형
- 구체적 장면과 추상적 해석이 비슷한 중요도로 사용된다.

### 75 — Concrete 우세
- 행동·장소·사물·감각 등 실제 장면이 중심이다.
- 추상적 해석은 보조적으로 사용된다.

### 100 — 매우 강한 Concrete
- 거의 모든 서술이 물리적 행동·사물·감각·공간을 중심으로 이루어진다.
- 관념적 해석이 매우 적다.

### 경계 사례

```text
그는 낡은 시계를 책상 위에 내려놓았다.
```

→ Concrete

```text
멈춰버린 시계는 두 사람 사이에 남겨진 시간 같았다.
```

→ 구체적 사물을 사용하지만 의미·관념으로 이동하므로 Abstract 방향

### P/O와의 혼동 방지

Ornate + Concrete:

```text
붉은 노을이 유리창 위에서 황금빛으로 부서졌다.
```

Plain + Abstract:

```text
삶은 결국 우리가 붙잡을 수 없는 가능성의 연속이었다.
```

묘사가 많다는 이유만으로 Concrete 점수를 올리지 않는다.

### Gemini 필수 규칙

> 구체명사 숫자나 묘사량만으로 C/A를 결정하지 않는다. 표현이 사물과 행동에 머무르는지, 의미와 관념으로 확장되는지를 평가한다.

---

# 8. G / B — Gloomy ↔ Bright

## 정의

사건 자체가 아니라 **작가가 상황을 어떤 정서적 방향으로 해석하는지**를 평가한다.

### 0 — 매우 강한 Bright
- 어려움이 있어도 희망·유머·회복·온기·가능성 쪽으로 일관되게 해석한다.

### 25 — Bright 우세
- 전체적으로 긍정적인 방향이 우세하다.
- 어두운 요소는 일시적이거나 극복 가능한 것으로 제시된다.

### 50 — 균형
- 긍정과 부정의 정서가 비슷하다.
- 또는 의도적으로 열린 정서로 남는다.

### 75 — Gloomy 우세
- 상실·불안·후회·고독·허무 등의 방향이 우세하다.
- 다만 희망이나 회복 가능성이 일부 남을 수 있다.

### 100 — 매우 강한 Gloomy
- 사건과 관계를 지속적으로 절망·상실·허무·붕괴의 방향으로 해석한다.
- 정서적 출구가 거의 없다.

### 혼동 방지

**슬픈 사건 ≠ Gloomy 문체**

같은 상실 상황에서도:

```text
이제 다시는 만날 수 없다는 사실만 남았다.
```

→ Gloomy 방향

```text
슬펐지만 함께했던 시간까지 사라지는 것은 아니었다.
```

→ Bright 방향

### Gemini 필수 규칙

> 문제에서 강제로 주어진 사건의 정서를 작가 성향으로 그대로 계산하지 않는다. 사용자가 그 사건을 어떤 방향으로 해석하고 마무리하는지를 평가한다.

---

# 9. 축 간 혼동 방지 규칙

| 잘못된 판단 | 올바른 판단 |
|---|---|
| 문장이 길다 → L | 사고와 서술의 흐름이 오래 지속되는지 확인 |
| 문장이 짧다 → S | 짧은 문장이 하나의 사고를 계속 발전시킬 수 있음 |
| 캐릭터가 감정을 참는다 → R | 독자에게 감정이 직접 설명되는지 확인 |
| 감정이 강하다 → E | 강렬한 감정도 행동과 상징만으로 표현하면 R 가능 |
| 어려운 단어가 많다 → O | O는 어휘 난도가 아니라 표현 장식 밀도 |
| 묘사가 많다 → C | 묘사가 의미나 상징을 향하면 A 가능 |
| 추상적이다 → L | Abstract와 Long은 독립 축 |
| 우울한 사건이다 → G | 사건이 아니라 사용자의 해석 방향을 평가 |
| 해피엔딩이다 → B | 작품 전체의 정서 방향을 평가 |
| 대사가 많다 → S | 대화 사이 사고 흐름이 길면 L 가능 |
| Plain하다 → Concrete | Plain + Abstract 가능 |
| Ornate하다 → Abstract | Ornate + Concrete 가능 |

---

# 10. 프롬프트 영향 제거 규칙

문제 자체가 요구한 요소는 사용자 성향의 직접적인 증거로 간주하지 않는다.

예:

- 밤
- 이별
- 갈등
- 비
- 특정 장소
- 특정 행동
- 회상
- 특정 감정적 사건

Gemini는 **사용자가 주어진 조건을 어떻게 서술했는가**를 평가해야 한다.

---

# 11. 정확히 50점일 때의 처리

## 기본 원칙

50은 실제 균형이다.

UI에서는:

```text
50 · 균형형
```

으로 표시한다.

## 최종 코드 결정

반올림 전 최종 점수를 사용한다.

```text
score > 50 → 100점 방향 문자
score < 50 → 0점 방향 문자
```

예:

```text
Long 50.4 → L
Long 49.6 → S
```

## 정확히 50.000...일 경우

1. 문항별 방향성 투표
2. 그래도 동률이면 고정 fallback

방향성 투표:

```text
score > 50 → 100점 방향에 유효 가중치만큼 투표
score < 50 → 0점 방향에 유효 가중치만큼 투표
score = 50 → 투표 없음
```

완전 동률 fallback:

```text
S/L → L
R/E → R
P/O → O
C/A → C
G/B → G
```

이 경우 결과 객체에:

```json
{
  "borderline": true
}
```

를 기록한다.

---

# 12. 성향 강도

성향 강도는 50점에서의 거리를 기준으로 계산한다.

```text
strengthDistance = |score - 50|
```

| 거리 | 성향 강도 |
|---:|---|
| 0 | 균형 |
| 1~9 | 약한 성향 |
| 10~24 | 뚜렷한 성향 |
| 25~39 | 강한 성향 |
| 40~50 | 매우 강한 성향 |

예:

```text
Long 52 → 약한 Long
Long 68 → 뚜렷한 Long
Long 83 → 강한 Long
Long 94 → 매우 강한 Long
```

---

# 13. 안정성

안정성은 여러 답변에서 동일 축 점수가 얼마나 일정하게 유지되는지 나타낸다.

MVP에서는 **가중 표준편차**를 사용한다.

| 표준편차 | 안정성 |
|---:|---|
| 0~7 | 매우 높음 |
| 7 초과~12 | 높음 |
| 12 초과~20 | 보통 |
| 20 초과~30 | 낮음 |
| 30 초과 | 매우 낮음 |

검사 단계별 표현:

```text
4문항 → 잠정 안정성
7문항 → 안정성
10문항 → 문체 안정성
```

---

# 14. Observability

## 목적

`50 = 균형`과 `근거 부족`을 분리하기 위해 사용한다.

각 답변의 각 축에 대해 Gemini는 다음 값을 반환한다.

```text
high
medium
low
```

### high
- 해당 축의 특징이 충분히 드러난다.
- 신뢰도 높은 평가가 가능하다.

### medium
- 평가 근거가 존재하지만 강하지 않다.

### low
- 해당 답변만으로 이 축을 평가하기 어렵다.
- 점수는 참고용으로 사용한다.

## Backend 권장 가중치

```text
high   = 1.00
medium = 0.70
low    = 0.35
```

최종 유효 가중치:

```text
effectiveWeight
=
questionBankWeight × observabilityWeight
```

---

# 15. Gemini 역할

Gemini가 수행하는 작업:

1. 각 답변을 독립적으로 평가
2. 5축 점수 반환
3. 각 축의 observability 반환
4. 전체 답변을 바탕으로 축별 요약 및 실제 근거 문장 반환

Gemini가 수행하지 않는 작업:

- 최종 글BTI 코드 결정
- 문제별 가중평균 계산
- 안정성 계산
- 32개 유형명 결정
- 대표 작가 결정

이 작업은 Backend가 담당한다.

---

# 16. Gemini 반환 JSON 예시

```json
{
  "schemaVersion": "glbti-analysis-v1",
  "samples": [
    {
      "questionId": "DESC_001",
      "scores": {
        "long": 82,
        "repressed": 61,
        "ornate": 74,
        "concrete": 55,
        "gloomy": 68
      },
      "observability": {
        "long": "high",
        "repressed": "medium",
        "ornate": "high",
        "concrete": "high",
        "gloomy": "medium"
      }
    }
  ],
  "axisAnalysis": {
    "long": {
      "summary": "하나의 생각이나 행동을 여러 단계로 확장하며 긴 서술 흐름을 유지하는 경향이 있다.",
      "evidence": [
        {
          "questionId": "DESC_001",
          "excerpt": "..."
        }
      ]
    },
    "repressed": {
      "summary": "...",
      "evidence": []
    },
    "ornate": {
      "summary": "...",
      "evidence": []
    },
    "concrete": {
      "summary": "...",
      "evidence": []
    },
    "gloomy": {
      "summary": "...",
      "evidence": []
    }
  }
}
```

---

# 17. JSON Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "samples",
    "axisAnalysis"
  ],
  "properties": {
    "schemaVersion": {
      "type": "string",
      "const": "glbti-analysis-v1"
    },
    "samples": {
      "type": "array",
      "minItems": 1,
      "maxItems": 10,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "questionId",
          "scores",
          "observability"
        ],
        "properties": {
          "questionId": {
            "type": "string"
          },
          "scores": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "long",
              "repressed",
              "ornate",
              "concrete",
              "gloomy"
            ],
            "properties": {
              "long": { "type": "integer", "minimum": 0, "maximum": 100 },
              "repressed": { "type": "integer", "minimum": 0, "maximum": 100 },
              "ornate": { "type": "integer", "minimum": 0, "maximum": 100 },
              "concrete": { "type": "integer", "minimum": 0, "maximum": 100 },
              "gloomy": { "type": "integer", "minimum": 0, "maximum": 100 }
            }
          },
          "observability": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "long",
              "repressed",
              "ornate",
              "concrete",
              "gloomy"
            ],
            "properties": {
              "long": { "type": "string", "enum": ["low", "medium", "high"] },
              "repressed": { "type": "string", "enum": ["low", "medium", "high"] },
              "ornate": { "type": "string", "enum": ["low", "medium", "high"] },
              "concrete": { "type": "string", "enum": ["low", "medium", "high"] },
              "gloomy": { "type": "string", "enum": ["low", "medium", "high"] }
            }
          }
        }
      }
    },
    "axisAnalysis": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "long",
        "repressed",
        "ornate",
        "concrete",
        "gloomy"
      ],
      "properties": {
        "long": { "$ref": "#/$defs/analysis" },
        "repressed": { "$ref": "#/$defs/analysis" },
        "ornate": { "$ref": "#/$defs/analysis" },
        "concrete": { "$ref": "#/$defs/analysis" },
        "gloomy": { "$ref": "#/$defs/analysis" }
      }
    }
  },
  "$defs": {
    "analysis": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "summary",
        "evidence"
      ],
      "properties": {
        "summary": {
          "type": "string",
          "maxLength": 300
        },
        "evidence": {
          "type": "array",
          "maxItems": 2,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": [
              "questionId",
              "excerpt"
            ],
            "properties": {
              "questionId": {
                "type": "string"
              },
              "excerpt": {
                "type": "string",
                "maxLength": 150
              }
            }
          }
        }
      }
    }
  }
}
```

---

# 18. Backend 검증 규칙

Gemini 응답을 받은 뒤 Backend는 반드시 다음을 검증한다.

- `schemaVersion` 일치 여부
- 제출 문제 수와 `samples` 수 일치 여부
- `questionId`가 실제 제출된 문제인지 확인
- 모든 score가 0~100 integer인지 확인
- 모든 observability가 `low | medium | high`인지 확인
- 누락된 축이 없는지 확인
- 추가 필드가 없는지 확인
- `evidence.excerpt`가 실제 사용자 답변 안에 존재하는 문자열인지 확인
- Gemini가 최종 유형 코드나 임의의 추가 텍스트를 반환하지 않았는지 확인

---

# 19. Gemini System Prompt 필수 규칙

다음 규칙은 평가 프롬프트에 반드시 포함한다.

> 각 축은 서로 독립적으로 평가한다.

> 0, 25, 50, 75, 100은 대표적인 기준점이며 중간의 모든 정수 점수를 사용할 수 있다.

> 50은 판단 불가를 의미하지 않는다. 실제로 양극 특징이 균형을 이룰 때만 사용한다.

> 평가 근거가 부족한 경우 점수를 임의로 50으로 만들지 말고 observability를 낮춘다.

> 문제 자체가 강제한 소재, 분위기, 사건, 행동은 작가의 문체 성향으로 직접 간주하지 않는다.

> 한 문장이나 특정 표현 하나만으로 판단하지 않고 답변 전체에서 반복적으로 나타나는 경향을 평가한다.

> S/L, R/E, P/O, C/A, G/B를 서로 대리 지표로 사용하지 않는다.

> 문장의 물리적 길이를 S/L과 동일시하지 않는다.

> 등장인물의 감정 억제를 R/E와 동일시하지 않는다.

> 어휘 난도를 P/O와 동일시하지 않는다.

> 묘사의 양을 C/A와 동일시하지 않는다.

> 사건 자체의 긍정성 또는 부정성을 G/B와 동일시하지 않는다.

> 최종 글BTI 유형은 결정하지 않는다.

> 반드시 제공된 JSON Schema만 반환한다.

> Markdown, 코드블록, 부가 설명, 인사말 또는 JSON 외 텍스트를 출력하지 않는다.

---

# 20. MVP 확정값 요약

## 점수 방향

```text
0 Short      ↔ 100 Long
0 Expressed  ↔ 100 Repressed
0 Plain      ↔ 100 Ornate
0 Abstract   ↔ 100 Concrete
0 Bright     ↔ 100 Gloomy
```

## 성향 강도

```text
거리 0       → 균형
거리 1~9     → 약한
거리 10~24   → 뚜렷한
거리 25~39   → 강한
거리 40~50   → 매우 강한
```

## 안정성

```text
SD 0~7       → 매우 높음
SD >7~12     → 높음
SD >12~20    → 보통
SD >20~30    → 낮음
SD >30       → 매우 낮음
```

## Observability Weight

```text
high   = 1.00
medium = 0.70
low    = 0.35
```

## 완전 동률 fallback

```text
S/L → L
R/E → R
P/O → O
C/A → C
G/B → G
```

---

# 21. 버전 관리

```text
Rubric Version: glbti-rubric-v1.0
Analysis Schema: glbti-analysis-v1
```

향후 실제 사용자 데이터 및 Golden Sample 분석 결과를 바탕으로 다음 항목은 수정될 수 있다.

- 0~100 평가 앵커 세부 문구
- 문제별 가중치
- observability 가중치
- 성향 강도 구간
- 안정성 표준편차 구간
- tie-break 방식

축의 기본 정의를 수정하는 경우 기존 결과와 호환되지 않을 수 있으므로 Rubric 버전을 반드시 증가시킨다.
