import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const formData = new URLSearchParams(body);

    const response = await fetch('https://testapi.remonpg.com/payment/v1/view/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    });

    const htmlRaw = await response.text();
    console.log("======= PG사 응답 시작 =======");
    console.log(htmlRaw);
    console.log("======= PG사 응답 끝 =======");

    return NextResponse.json({ htmlData: htmlRaw });
}

// export async function POST(request: Request) {
//     try {
//         const body = await request.json();
//         const formData = new URLSearchParams(body); // 폼 데이터 변환
//         const requestUrl = `https://testapi.remonpg.com/payment/v1/view/request`;
//
//         const response = await fetch(requestUrl, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: formData.toString(),
//         });
//
//         // [핵심] 응답을 JSON이 아닌 텍스트(HTML)로 읽습니다.
//         const htmlContent = await response.text();
//
//         // 클라이언트에게 "이건 HTML 문자열이야"라고 보내줍니다.
//         return NextResponse.json({
//             isHtml: true,
//             data: htmlContent
//         });
//     } catch (error) {
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

// export async function POST(request: Request) {
//     try {
//         const body = await request.json();
//
//         // 1. 목적지 URL (클라이언트가 준 게 없으면 기본값이라도 사용)
//         const targetUrl = body.originActionUrl || body.actionUrl || 'https://testapi.remonpg.com/payment/v1/view/request';
//
//         // 2. 폼 데이터 조립 (안전하게!)
//         const formData = new URLSearchParams();
//
//         if (body) {
//             Object.entries(body).forEach(([key, value]) => {
//                 if (key !== 'originActionUrl' && key !== 'actionUrl') {
//                     // [중요] value가 undefined면 빈 문자열로 대체 (toString 에러 원천 차단)
//                     const safeValue = (value === null || value === undefined) ? '' : String(value);
//                     formData.append(key, safeValue);
//                 }
//             });
//         }
//
//         // 3. PG사로 폼 전송
//         const response = await fetch(targetUrl, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//             body: formData.toString(),
//         });
//
//         // 4. 응답 받기 (폼 데이터 형태의 문자열로 옴)
//         const responseText = await response.text();
//
//         // 5. [중요] 응답받은 폼 데이터(a=b&c=d)를 JSON 객체로 다시 변환
//         const responseParams = new URLSearchParams(responseText);
//         const resultFields: Record<string, string> = {};
//
//         responseParams.forEach((val, key) => {
//             resultFields[key] = val;
//         });
//
//         // 만약 HTML 에러 페이지가 왔을 경우 처리
//         if (responseText.includes('<!DOCTYPE')) {
//             console.error("PG사 에러 HTML 수신됨");
//             return NextResponse.json({ error: 'PG_HTML_ERROR', raw: responseText.substring(0, 100) }, { status: 500 });
//         }
//
//         // 6. 클라이언트가 바로 쓸 수 있게 필드들을 담아 보냄
//         return NextResponse.json({
//             actionUrl: targetUrl,
//             fields: resultFields
//         });
//
//     } catch (error: any) {
//         console.error("서버 최종 에러:", error.message);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }