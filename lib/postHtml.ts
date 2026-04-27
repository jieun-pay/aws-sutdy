export interface PaymentPop {
    id: number;
    paymentType: string;
    mid: string;
    productName: string;
    productPrice: number;
    productQuantity: number;
    customerName: string;
    customerPhoneNumber: string;
    mobileMode: string;
}

export interface PaymentPayload {
    payMethod: string;
    payType: string;
    mid: string;
    goodsNm: string;
    ordNo: string;
    goodsAmt: number;
    ordNm: string;
    ordTel: string;
    ordEmail: string;
    ordIp: string;
    returnUrl?: string;
    mbsReserved: string;
    ediDate: string;
    hashString: string;
}

function createIframeHtml(frameName = 'pg_pay_frame') {
    return `
  <div id="pg_layer">
    <div id="pgPayMask" style="position:fixed;z-index:9000;background-color:#000;display:none;left:0;top:0;width:100%;height:100%;"></div>
    <div id="pgPayWindow" style="display:none;position:fixed;top:0;width:100%;height:100%;z-index:10000;">
      <div style="width:100%;height:100%;">
        <iframe id="${frameName}" name="${frameName}" style="width:100%;height:100%;" src="" marginwidth="0" marginheight="0" frameborder="0" scrolling="no"></iframe>
      </div>
    </div>
  </div>`;
}

/** 모달 DOM 보장 + 표시 */
export function ensureIframeLayer(frameName = 'pg_pay_frame'): HTMLIFrameElement {
    let layer = document.getElementById('pg_layer');
    if (!layer) {
        document.body.insertAdjacentHTML('beforeend', createIframeHtml(frameName));
        layer = document.getElementById('pg_layer');
    }
    const mask = document.getElementById('pgPayMask') as HTMLDivElement | null;
    const win = document.getElementById('pgPayWindow') as HTMLDivElement | null;
    const iframe = document.getElementById(frameName) as HTMLIFrameElement | null;
    if (!mask || !win || !iframe) {
        throw new Error('모달 DOM 생성 실패');
    }

    // 모달 표시
    mask.style.display = 'block';
    mask.style.opacity = '0.6';
    win.style.display = 'block';

    return iframe;
}

export function postToFrame(actionUrl: string, payload: PaymentPayload, frameName: string) {
    const iframe = ensureIframeLayer(frameName);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.target = iframe.name || frameName;

    Object.entries(payload).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value == null ? '' : String(value);
        form.appendChild(input);
    });
    document.body.appendChild(form);

    form.submit();
    form.remove();
}

export function PostHtml(actionUrl: string, payload: any) {
    const createInputs = Object.entries(payload)
        .map(([k, v]) => {
            const val = v == null ? '' : String(v);
            return `<input type="hidden" name="${k}" value="${val}" />`;
        })
        .join('\n');

    return `
      <!doctype html>
      <html>
      <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Processing…</title>
          <style>
              body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0}
              .center{height:100vh;display:flex;align-items:center;justify-content:center}
          </style>
      </head>
      <body>
          <form id="pgForm" method="POST" action="${actionUrl}">
              ${createInputs && createInputs}
          </form>
          <div class="center">결제 페이지로 이동 중…</div>
          <script>
              // iOS에서 submit 직후 화면 깜박임을 줄이기 위해 setTimeout(0)
              setTimeout(function(){ document.getElementById('pgForm').submit(); }, 0);
          </script>
      </body>
      </html>`;
}
