import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("1. 클라이언트로부터 받은 승인 데이터:", body);

        const PG_APPROVAL_URL = 'https://testapi.remonpg.com/payment/v1/approval';

        // [교정 1] JSON이 아니라 Form Data(URLSearchParams) 형식으로 변환해야 합니다.
        const formData = new URLSearchParams();
        Object.entries(body).forEach(([k, v]) => {
            formData.append(k, v == null ? '' : String(v));
        });

        // [교정 2] 요청 헤더를 x-www-form-urlencoded로 변경
        const response = await fetch(PG_APPROVAL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(), // key=value&key=value 형식으로 전송
        });

        const resText = await response.text();
        console.log("2. PG사 승인 원본 응답:", resText);

        // [교정 3] 응답이 QueryString(a=b&c=d)으로 오므로 이를 JSON 객체로 변환
        const searchParams = new URLSearchParams(resText);
        const resultObj: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            resultObj[key] = value;
        });

        // 4. 변환된 객체를 클라이언트에 던져줍니다.
        return NextResponse.json(resultObj);

    } catch (error: any) {
        console.error("승인 처리 에러:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}