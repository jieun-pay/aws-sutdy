'use client';

import { generateEncData, getFormattedDate } from '@/lib/pgHelper';
import { postToFrame, ensureIframeLayer } from '@/lib/postHtml';
import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

type ResultPayload = {
    goodsAmt: string;
    mid: string;
    pmCd: string;
    nonce: string;
    tid: string;
    mbsReserved: string;
    ediDate: string;
    payData: string;
    hashString: string;
};

type PaymentPayload = {
    payMethod: string;
    payType: string;
    mid: string;
    goodsNm: string;
    ordNo: string;
    goodsAmt: string;
    ordNm: string;
    ordTel: string;
    ordEmail: string;
    ordIp: string;
    returnUrl: string;
    mbsReserved: string;
    ediDate: string;
    hashString: string;
};

declare global {
    interface Window {
        __pgAsistantLoaded__?: boolean;
        __submitPGForm?: (payload: {
            frameName?: string;
            actionUrl: string;
            fields: Record<string, string | number | boolean | null | undefined>;
        }) => Promise<boolean>;
    }
}

export default function PaymentModule() {
    const isInitialized = useRef(false);

    // [수정] Hydration 오류 방지를 위한 마운트 상태 관리
    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = useState<string>('AUTH');
    const [resultData, setResultData] = useState<ResultPayload | null>(null);

    console.log(resultData);

    // [상수 설정]
    const SCRIPT_URL = 'https://testapi.remonpg.com/js/pgAsistant.js';
    const _merchantID = 'obtest001m';
    const _merchantKey = '1Mk0I4o35ctiZEGiIU6Z68l8ISJNBoekU01qDG90DqxOxRSC39+6XnD7gyfb1cyqdnUJKBCFdqKbuFCeCMlS9A==';
    const _goodsAmt = '1000';
    const requestUrl = `https://testapi.remonpg.com/payment/v1/view/request`;
    // const requestUrl = '/api/payment/request';
    // const approvalUrl = `https://testapi.remonpg.com/payment/v1/approval`;
    const approvalUrl = 'https://testapi.remonpg.com/api/payment/approval';

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        if (isInitialized.current) return;

        // [수정] 전역 함수 등록
        window.__submitPGForm = async (payload) => {
            console.log("__submitPGForm 호출됨!", payload);
            try {
                const frameName = payload?.frameName || 'pg_pay_frame';
                const actionUrl = payload?.actionUrl;
                const fields = payload?.fields || {};

                if (!actionUrl) return false;

                const iframe = ensureIframeLayer(frameName);
                const oldForm = document.getElementById('pg_temp_form');
                if (oldForm) oldForm.remove();

                const form = document.createElement('form');
                form.id = 'pg_temp_form';
                form.method = 'POST';
                form.action = actionUrl;
                form.target = frameName;

                Object.keys(fields).forEach((k) => {
                    const inp = document.createElement('input');
                    inp.type = 'hidden';
                    inp.name = k;
                    inp.value = fields[k] == null ? '' : String(fields[k]);
                    form.appendChild(inp);
                });

                document.body.appendChild(form);
                form.submit();
                return true;
            } catch (err) {
                console.error("결제 폼 제출 중 예외 발생:", err);
                return false;
            }
        };
        isInitialized.current = true;
    }, []);

    // [수정] 결제 완료 감지 (MutationObserver)
    // useEffect(() => {
    //     if (!mounted) return;
    //     const observer = new MutationObserver(async () => {
    //         const form = document.getElementById('pay_result_form') as HTMLFormElement | null;
    //         if (form) {
    //             observer.disconnect(); // 먼저 해제
    //             const formData = new FormData(form);
    //             const data = Object.fromEntries(formData.entries());
    //
    //             const _resHash = await generateEncData(
    //                 String(data.mid),
    //                 String(data.ediDate),
    //                 Number(data.goodsAmt),
    //                 _merchantKey
    //             );
    //
    //             const reservedData = {
    //                 "orderId": "OBP-1777014538320",
    //                 "userId": "test3204@hanmail.net",
    //                 "couponCode": "",
    //                 "couponDiscount": 0,
    //                 "usedPoints": 0,
    //                 "total": 2200,
    //                 "payable": 2200,
    //                 "serviceType": "MART"
    //             };
    //
    //             const mbsDatastringify = JSON.stringify(reservedData)
    //
    //             setResultData({
    //                 goodsAmt: Number(data.goodsAmt),
    //                 mid: data.mid as string,
    //                 pmCd: data.pmCd as string,
    //                 nonce: data.nonce as string,
    //                 tid: data.tid as string,
    //                 mbsReserved: mbsDatastringify,
    //                 ediDate: data.ediDate as string,
    //                 payData: data.payData as string,
    //                 hashString: _resHash,
    //             });
    //
    //         }
    //     });
    //
    //     observer.observe(document.body, { childList: true, subtree: true });
    //     return () => observer.disconnect();
    // }, [mounted, _merchantKey]);
    //
    // // [수정] 최종 승인 처리 (Form POST 방식)
    // useEffect(() => {
    //     if (!resultData) return;
    //
    //     const form = document.createElement('form');
    //     form.method = 'POST';
    //     form.action = approvalUrl;
    //
    //     Object.entries(resultData).forEach(([key, value]) => {
    //         const input = document.createElement('input');
    //         input.type = 'hidden';
    //         input.name = key;
    //         input.value = String(value);
    //         form.appendChild(input);
    //     });
    //
    //     document.body.appendChild(form);
    //     form.submit();
    // }, [resultData, approvalUrl]);

    // 넥스트 서버를 통해 요청
// 1. PG 인증 결과 감지 (MutationObserver)
    useEffect(() => {
        if (!mounted) return;

        const observer = new MutationObserver(async () => {
            // PG사가 인증 성공 후 동적으로 생성하는 result 폼을 찾습니다.
            const form = document.getElementById('pay_result_form') as HTMLFormElement | null;

            if (form && !resultData) { // 데이터가 없을 때만 실행
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                // 검증용 해시 생성
                const _resHash = await generateEncData(
                    String(data.mid),
                    String(data.ediDate),
                    String(data.goodsAmt),
                    _merchantKey
                );

                // [추가] 예약 데이터 구성 (필요시)
                const reservedData = {
                    "orderId": "OBP-1777014538320",
                    "userId": "test3204@hanmail.net",
                    "serviceType": "MART"
                };

                // 상태 업데이트 -> 아래의 useEffect(승인로직)를 트리거함
                setResultData({
                    goodsAmt: _goodsAmt,
                    mid: data.mid as string,
                    pmCd: data.pmCd as string,
                    nonce: data.nonce as string,
                    tid: data.tid as string,
                    mbsReserved: JSON.stringify(reservedData),
                    ediDate: data.ediDate as string,
                    payData: data.payData as string,
                    hashString: _resHash,
                });

                // 모달 레이어 제거 (선택 사항)
                const layer = document.getElementById('pg_layer');
                if (layer) layer.remove();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [mounted, _merchantKey, resultData]);


// 2. 최종 승인 처리 (Next 서버 우회 방식)
    useEffect(() => {
        if (!resultData) return;

        const requestApproval = async () => {
            try {
                const response = await fetch(approvalUrl, { // '/api/payment/approval'
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(resultData),
                });

                // 서버 응답이 "goodsAmt=1000..." 형태라면 .json()이 아닌 .text() 후 처리가 필요할 수 있음
                // 하지만 서버(route.ts)에서 이미 NextResponse.json()으로 바꿨다면 아래 코드가 맞습니다.
                const result = await response.json();
                console.log("승인 결과:", result);

                if (result.resultCode === '0000' || result.resultCd === '0000') {
                    window.location.href = '/payments/result/paymentComplete';
                } else {
                    alert(`결제 실패: ${result.resultMsg}`);
                    setResultData(null);
                }
            } catch (error) {
                console.error("승인 처리 중 오류:", error);
            }
        };

        requestApproval();
    }, [resultData, approvalUrl]);

    // [수정] 최종 승인 처리 (Form POST 방식)
    // useEffect(() => {
    //     if (!resultData) return;
    //
    //     const form = document.createElement('form');
    //     form.method = 'POST';
    //     form.action = approvalUrl;
    //
    //     Object.entries(resultData).forEach(([key, value]) => {
    //         const input = document.createElement('input');
    //         input.type = 'hidden';
    //         input.name = key;
    //         input.value = String(value);
    //         form.appendChild(input);
    //     });
    //
    //     document.body.appendChild(form);
    //     form.submit();
    // }, [resultData, approvalUrl]);


    // useEffect(() => {
    //     // resultData가 채워지면 승인 로직 실행
    //     if (!resultData) return;
    //
    //     const requestApproval = async () => {
    //         try {
    //             // 1. 우리 서버(/api/payment/approval)로 승인 요청을 보냅니다.
    //             const response = await fetch(approvalUrl, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({
    //                     ...resultData,
    //                 }),
    //             });
    //
    //             if (!response.ok) throw new Error('승인 서버 응답 실패');
    //
    //             const result = await response.json();
    //
    //             // 2. 승인 결과에 따른 후속 처리
    //             if (result.resultCode === '0000') {
    //                 // 성공 시 성공 페이지로 이동하거나 결과 데이터 처리
    //                 window.location.href = '/payments/result/paymentComplete';
    //             }
    //         } catch (error) {
    //             console.error("승인 처리 중 오류:", error);
    //             alert("결제 승인 중 문제가 발생했습니다.");
    //         }
    //     };
    //
    //     requestApproval();
    // }, [resultData, approvalUrl]);

    const handlePayment = async (paymentMethod: string) => {
        // [수정] 클릭 시점에만 동적인 데이터 생성 (Hydration 방지)
        const currentEdiDate = getFormattedDate();
        const containerUrl = `http://52.78.132.220/payments/result/paymentComplete`;

        const _encData = await generateEncData(_merchantID, currentEdiDate, _goodsAmt, _merchantKey);

        const payload: PaymentPayload = {
            payMethod: 'CARD',
            payType: paymentMethod,
            mid: _merchantID,
            goodsNm: '운영테스트',
            ordNo: '005', // 실제로는 고유 번호 생성 필요
            goodsAmt: _goodsAmt,
            ordNm: '황지은',
            ordTel: '01072472075',
            ordEmail: '',
            ordIp: '127.0.0.1',
            returnUrl: containerUrl,
            mbsReserved: 'MallReserved',
            ediDate: currentEdiDate,
            hashString: _encData,
        };

        ensureIframeLayer('pg_pay_frame');
        postToFrame(requestUrl, payload, 'pg_pay_frame');
    };

    // 마운트 전에는 아무것도 렌더링하지 않음 (Hydration Mismatch 완전 해결)
    if (!mounted) return null;

    return (
        <div className="flex-1 p-4">
            <Script
                src={SCRIPT_URL}
                strategy="afterInteractive"
                onLoad={() => { window.__pgAsistantLoaded__ = true; }}
            />
            <h2 className="mb-4 font-semibold text-lg">주문상품</h2>
            <div className="w-full rounded-md bg-white border p-4 mb-6">
                <p className="font-medium text-blue-600">상품명: 운영테스트</p>
                <p>결제금액: {_goodsAmt.toLocaleString()}원</p>
            </div>

            <div className="mt-8 mb-6">
                <p className="font-bold">신용카드 결제 방식 선택</p>
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="w-full mt-2 p-3 border rounded-lg outline-none"
                >
                    <option value="AUTH">앱카드</option>
                    <option value="KEYIN">수기결제(구인증)</option>
                    <option value="NONE">수기결제(비인증)</option>
                </select>
            </div>

            <button
                type="button"
                onClick={() => handlePayment(selected)}
                className="w-full py-4 rounded-md bg-blue-600 text-lg text-white font-bold"
            >
                {_goodsAmt.toLocaleString()}원 결제하기
            </button>
        </div>
    );
}



// 'use client';
//
// import {generateEncData, generateEncData2, getFormattedDate} from '@/lib/pgHelper';
// import {postToFrame, ensureIframeLayer} from '@/lib/postHtml';
// import {useEffect, useState, useRef} from 'react';
// import {useRouter} from 'next/navigation';
// import Script from 'next/script';
//
// // 타입 정의
// declare global {
//     interface Window {
//         __pgAsistantLoaded__?: boolean;
//         __submitPGForm?: (payload: any) => Promise<boolean>;
//     }
// }
//
// type PaymentPayload = {
//     payMethod: string;
//     payType: string;
//     mid: string;
//     goodsNm: string;
//     ordNo: string;
//     goodsAmt: number;
//     ordNm: string;
//     ordTel: string;
//     ordEmail: string;
//     ordIp: string;
//     returnUrl: string;
//     mbsReserved: string;
//     ediDate: string;
//     hashString: string;
//     cpCd?: string;
//     cardTypeCd?: string;
//     quotaMon?: string;
//     encData?: string;
// };
//
// type ResultPayload = {
//     goodsAmt: any;
//     mid: any;
//     pmCd: any;
//     nonce: any;
//     tid: any;
//     mbsReserved: any;
//     ediDate: any;
//     payData: any;
//     hashString: string;
// };
//
// export default function PaymentModule() {
//     const router = useRouter();
//
//     const isInitialized = useRef(false);
//
//     const SCRIPT_URL = 'https://testapi.remonpg.com/js/pgAsistant.js';
//     // const SCRIPT_URL = 'https://testapi.obepayments.com/js/pgAsistant.js';
//     // const SCRIPT_URL = 'http://localhost:8080/js/pgAsistant.js';
//     // const SCRIPT_URL = 'http://localhost:8082/js/pgAsistant.js';
//     // const SCRIPT_URL = 'http://192.168.0.111:9090/js/pgAsistant.js';
//
//     // 환경 변수 및 고정값 (예시)
//     const _merchantID = process.env.NEXT_PUBLIC_ID;
//     const _merchantKey = process.env.NEXT_PUBLIC_MERCHANTKEY;
//     const _ediDate = getFormattedDate(); // 실제로는 pgHelper의 getFormattedDate 사용 권장
//     const _goodsAmt = 1000;
//
//     const [paymentData, setPaymentData] = useState<PaymentPayload | null>(null);
//     const [resultData, setResultData] = useState<ResultPayload | null>(null);
//     const [selected, setSelected] = useState<string>('AUTH');
//
//     const requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/payment/v1/view/request`;
//     const approvalUrl = `${process.env.NEXT_PUBLIC_API_URL}/payment/v1/approval`;
//     const containerUrl = typeof window !== 'undefined' ? `${window.location.origin}/paymentComplete` : '';
//
//     // 1. iframe 레이어 생성 함수
//     // const ensureIframeLayer = (frameName: string) => {
//     //     let layer = document.getElementById('pg_layer');
//     //     if (!layer) {
//     //         const html = `
//     //     <div id="pg_layer">
//     //       <div id="pgPayMask" style="position:fixed;z-index:9000;background-color:#000;opacity:0.6;display:none;left:0;top:0;width:100%;height:100%;"></div>
//     //       <div id="pgPayWindow" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;">
//     //         <div style="width:100%;height:100%;">
//     //           <iframe id="${frameName}" name="${frameName}" style="width:100%;height:100%;border:none;" src="about:blank"></iframe>
//     //         </div>
//     //       </div>
//     //     </div>`;
//     //         document.body.insertAdjacentHTML('beforeend', html);
//     //     }
//     //
//     //     const mask = document.getElementById('pgPayMask');
//     //     const win = document.getElementById('pgPayWindow');
//     //     const iframe = document.getElementById(frameName) as HTMLIFrameElement;
//     //
//     //     if (mask) mask.style.display = 'block';
//     //     if (win) win.style.display = 'block';
//     //
//     //     return iframe;
//     // };
//
//     // 2. 전역 함수 등록 (초기 마운트 시)
//     useEffect(() => {
//         if (isInitialized.current) return;
//
//         window.__submitPGForm = async (payload) => {
//             console.log("__submitPGForm 호출됨!", payload); // 호출 여부 확인
//
//             try {
//                 const frameName = payload?.frameName || 'pg_pay_frame';
//                 const actionUrl = payload?.actionUrl;
//                 const fields = payload?.fields || {};
//
//                 if (!actionUrl) {
//                     console.error("에러: actionUrl이 없습니다.");
//                     return false;
//                 }
//
//                 // 1. iframe 확보
//                 const iframe = ensureIframeLayer(frameName);
//                 console.log("iframe 준비됨", iframe);
//
//                 // 2. 기존 폼 삭제 (중복 방지)
//                 const oldForm = document.getElementById('pg_temp_form');
//                 if (oldForm) oldForm.remove();
//
//                 // 3. 폼 생성
//                 const form = document.createElement('form');
//                 form.id = 'pg_temp_form';
//                 form.method = 'POST';
//                 form.action = actionUrl;
//                 form.target = frameName;
//
//                 Object.keys(fields).forEach((k) => {
//                     const inp = document.createElement('input');
//                     inp.type = 'hidden';
//                     inp.name = k;
//                     inp.value = fields[k] == null ? '' : String(fields[k]);
//                     form.appendChild(inp);
//                 });
//
//                 document.body.appendChild(form);
//                 console.log("Form 데이터:", fields);
//                 console.log("최종 요청 URL:", actionUrl);
//
//                 // 4. 전송
//                 form.submit();
//                 return true;
//             } catch (err) {
//                 console.error("결제 폼 제출 중 예외 발생:", err);
//                 return false;
//             }
//         };
//
//         isInitialized.current = true;
//     }, []);
//
//     // 2. 결제 요청 실행 (일반/수기 공통)
//     const handlePayment = async (paymentMethod: string) => {
//         const _encData = await generateEncData(_merchantID, _ediDate, _goodsAmt, _merchantKey);
//
//         const payload: PaymentPayload = {
//             payMethod: 'CARD',
//             payType: paymentMethod,
//             mid: _merchantID,
//             goodsNm: '운영테스트',
//             ordNo: '005',
//             goodsAmt: _goodsAmt,
//             ordNm: '황지은',
//             ordTel: '01072472075',
//             ordEmail: '',
//             ordIp: '127.0.0.1',
//             returnUrl: containerUrl,
//             mbsReserved: 'MallReserved',
//             ediDate: _ediDate,
//             hashString: _encData,
//         };
//
//         // if (isKeyin) {
//         //     const keyinData = generateEncData2();
//         //     payload = {
//         //         ...payload,
//         //         cpCd: '02',
//         //         cardTypeCd: '01',
//         //         quotaMon: '00',
//         //         encData: keyinData.dataBase64,
//         //     };
//         // }
//
//         setPaymentData(payload);
//         ensureIframeLayer();
//         postToFrame(requestUrl, payload, 'pg_pay_frame');
//     };
//
//     // 3. 결제 완료 감지 (MutationObserver)
//     useEffect(() => {
//         const observer = new MutationObserver(async (mutations) => {
//             const form = document.getElementById('pay_result_form') as HTMLFormElement | null;
//             if (form) {
//                 const formData = new FormData(form);
//                 const data = Object.fromEntries(formData.entries());
//
//                 // 결과 검증용 해시 생성
//                 const _resHash = await generateEncData(
//                     data.mid as string,
//                     data.ediDate as string,
//                     Number(data.goodsAmt),
//                     _merchantKey
//                 );
//
//                 setResultData({
//                     goodsAmt: data.goodsAmt,
//                     mid: data.mid,
//                     pmCd: data.pmCd,
//                     nonce: data.nonce,
//                     tid: data.tid,
//                     mbsReserved: data.mbsReserved,
//                     ediDate: data.ediDate,
//                     payData: data.payData,
//                     hashString: _resHash,
//                 });
//
//                 // 모달 제거 로직 (필요시)
//                 const layer = document.getElementById('pg_layer');
//                 if (layer) layer.remove();
//
//                 observer.disconnect();
//             }
//         });
//
//         observer.observe(document.body, {childList: true, subtree: true});
//         return () => observer.disconnect();
//     }, [_merchantKey]);
//
//     // 4. 최종 승인 처리 (resultData가 세팅되면 실행)
//     // useEffect(() => {
//     //     if (!resultData) return;
//     //
//     //     // 방식 A: API 호출 방식 (권장)
//     //     const approvePayment = async () => {
//     //         try {
//     //             const res = await axios.post(approvalUrl, resultData);
//     //             if (res.data.resultCd === '0000') {
//     //                 router.push(`/paymentResult?tid=${res.data.tid}`);
//     //             } else {
//     //                 alert(`결제 실패: ${res.data.resultMsg}`);
//     //             }
//     //         } catch (err) {
//     //             console.error('승인 요청 에러:', err);
//     //         }
//     //     };
//     //
//     //     approvePayment();
//
//     /* // 방식 B: Form 전송 방식 (페이지 전체 이동이 필요한 경우)
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = approvalUrl;
//     Object.entries(resultData).forEach(([key, value]) => {
//         const input = document.createElement('input');
//         input.type = 'hidden';
//         input.name = key;
//         input.value = String(value);
//         form.appendChild(input);
//     });
//     document.body.appendChild(form);
//     form.submit();
//     */
//     // }, [resultData, approvalUrl, router]);
//
//     return (
//         <div className="flex-1 p-4">
//             <Script
//                 src={SCRIPT_URL}
//                 strategy="afterInteractive"
//                 onLoad={() => {
//                     console.log('PG Assistant 스크립트 로드 완료');
//                     window.__pgAsistantLoaded__ = true;
//                 }}
//             />
//             <h2 className="mb-4 font-semibold text-lg">주문상품</h2>
//             <div className="w-full rounded-md bg-white border p-4 mb-6">
//                 <p className="font-medium text-blue-600">상품명: 운영테스트</p>
//                 <p>결제금액: {_goodsAmt.toLocaleString()}원</p>
//             </div>
//
//             <div className="mt-8 mb-6">
//                 <p className="font-bold">신용카드 결제 방식 선택</p>
//                 <select
//                     value={selected}
//                     onChange={(e) => setSelected(e.target.value)}
//                     className="w-full mt-2 p-3 border rounded-lg outline-none"
//                 >
//                     <option value="AUTH">앱카드</option>
//                     <option value="KEYIN">수기결제(구인증)</option>
//                     <option value="NONE">수기결제(비인증)</option>
//                 </select>
//             </div>
//
//             <button
//                 type="button"
//                 onClick={() => handlePayment(selected)}
//                 className="w-full py-4 rounded-md bg-blue-600 text-lg text-white font-bold hover:bg-blue-700 transition-colors"
//             >
//                 {_goodsAmt.toLocaleString()}원 결제하기
//             </button>
//         </div>
//     );
// }