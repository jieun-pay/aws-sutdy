import Link from 'next/link'

export default function PaymentComplete() {
    // function formattedDate() {
    //     if (!raw) return '';
    //     const year = parseInt(raw.substring(0, 4)); // 2025
    //     const month = parseInt(raw.substring(4, 6)) - 1; // 09 (JS에서 월은 0부터 시작)
    //     const day = parseInt(raw.substring(6, 8)); // 01
    //     const hour = parseInt(raw.substring(8, 10)); // 14
    //     const minute = parseInt(raw.substring(10, 12)); // 44
    //     const second = parseInt(raw.substring(12, 14)); // 50
    //
    //     return new Date(year, month, day, hour, minute, second)?.toDateString();
    // }

    return (
        <div className="flex items-center mt-16">
            <div>
                <div>
                    <h2 className="mb-4 text-3xl font-bold">
                        결제 완료
                    </h2>
                </div>
                {/*{glob.result === '정상처리' && (*/}
                {/*    <>*/}
                {/*        /!*<div className="flex flex-row gap-2 mb-1">*!/*/}
                {/*        /!*    <p className="font-bold">{formattedDate()}</p>*!/*/}
                {/*        /!*    <p>주문 번호: {glob.ordNo}</p>*!/*/}
                {/*        /!*</div>*!/*/}
                {/*        <div className="w-[256] p-5 mb-4 rounded-md bg-white">*/}
                {/*            /!*<div className="flex flex-row">*!/*/}
                {/*            /!*    <p>상품명: </p>*!/*/}
                {/*            /!*    <p>{glob.goodsNm}</p>*!/*/}
                {/*            /!*</div>*!/*/}
                {/*            /!*<div className="border border-y-0.5 border-black my-2"></div>*!/*/}
                {/*            /!*<div className="flex flex-row items-center">*!/*/}
                {/*            /!*    <div className="font-bold">결제 금액: </div>*!/*/}
                {/*            /!*    <div className="font-bold">{Number(glob.goodsAmt).toLocaleString()}원</div>*!/*/}
                {/*            /!*</div>*!/*/}
                {/*        </div>*/}
                {/*    </>*/}
                {/*)}*/}
                <Link href='/' className='bg-[#333] text-white px-10 py-4 rounded-2xl cursor-pointer hover:bg-blue-400'>메인페이지로</Link>
            </div>
        </div>
    );
}
