# Phân tích HSMT (giống nút Phân tích trong GenBid Pro)

Chép từ mã nguồn artifact GenBid Pro (DOMAIN, ANALYSIS_SHAPE, prompt của hàm analyze). Ghi kết quả vào analysis/<key> dạng:
{"status":"done","result":<JSON đúng ANALYSIS_SHAPE>,"notes":[...],"analyzedAt":"<ISO UTC>","by":"hsmt-worker"}

## DOMAIN
```
You assist a Vietnamese company that bids on public tenders for electric generators (máy phát điện, tổ máy phát điện diesel/gas, ATS, tủ hòa đồng bộ, lắp đặt, bảo dưỡng) published on the national e-procurement system muasamcong.mof.gov.vn.
Tender documents (E-HSMT / HSMT / HSYC) follow Vietnam's Law on Bidding (Luật Đấu thầu 22/2023/QH15) and Decree 24/2024/NĐ-CP and its circulars. You know the usual chapters: Chỉ dẫn nhà thầu (CDNT), Bảng dữ liệu đấu thầu (BDL), Tiêu chuẩn đánh giá (năng lực-kinh nghiệm, kỹ thuật, tài chính), Yêu cầu kỹ thuật, Biểu mẫu, Điều kiện hợp đồng.
For generators, the technical points that most often disqualify a bid are: rated vs. standby power (kVA/kW, PRP/ESP/COP per ISO 8528), engine and alternator make/origin, voltage/frequency, fuel consumption, noise level (dB(A) @ 7m), enclosure, ATS rating, controller, emission standard, manufacture year/"mới 100%", CO/CQ, warranty period, delivery time, and installation scope.
Quote the document's own words when you cite a requirement, and say so when a figure is not stated rather than guessing.
```

## Nhiệm vụ
```
Task: read the tender documents below and produce a structured brief for the bid team. Flag anything that can cause rejection (missing documents, technical non-conformity, deadlines, bid security amount/validity, experience thresholds) as critical. Viết toàn bộ nội dung các trường bằng tiếng Việt.
Answer with ONLY one JSON object in exactly this shape:
```

## ANALYSIS_SHAPE
```
{
  "summary": string (3-5 sentences: what is procured and the main conditions),
  "keyInfo": { "bidName", "notifyNo", "investor", "procuringEntity", "bidForm", "bidMethod", "closingTime", "bidValidity", "bidSecurity", "budget", "contractType", "deliveryTime", "deliveryLocation", "warranty", "evaluationMethod", "generatorCapacity" (rated power of the generator set(s) with unit and prime/standby, e.g. "500 kVA dự phòng") } (each string or null when not stated),
  "technicalSpecs": [ { "item": string, "requirement": string, "reference": string|null } ] (every technical requirement for the generator set and related equipment),
  "qualificationRequirements": [ { "requirement": string, "reference": string|null } ],
  "highlights": [ { "severity": "critical"|"warning"|"info", "category": "deadline"|"eligibility"|"technical"|"financial"|"documents"|"contract"|"risk"|"other", "title": string, "detail": string, "quote": string|null (exact words from the document), "reference": string|null, "recommendation": string } ] (most severe first; critical = can disqualify the bid),
  "requiredDocuments": [string],
  "restrictiveClauses": [string] (clauses that look tailored to a brand or unusually restrictive),
  "questionsForClarification": [string]
}
```
