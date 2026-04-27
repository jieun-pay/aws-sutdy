'use client'

import PaymentModule from '@/components/paymentModule';
import {useState} from "react";

const PaymentPage = () => {
    const [paymentWindow, setPaymentWindow] = useState(false);
    return(
        <div className="flex flex-col flex-1 items-center justify-center">
            <button onClick={() => setPaymentWindow(!paymentWindow)} className='bg-blue-700 text-white px-10 py-4 rounded-2xl cursor-pointer hover:bg-blue-400'>결제하기</button>
            {paymentWindow && <PaymentModule/>}
        </div>
    )
}

export default PaymentPage;