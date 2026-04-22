import Image from "next/image";

export const Modal = ({close}: { close: (v: boolean) => void }) => {
    return(
        <div className='absolute z-10'>
            <div className='w-full flex flex-col items-center justify-center'>
                <Image src='/cat.jpg' alt='냥냥펀치' width={500} height={700} />
                <button onClick={() => close(false)} className='mt-4 bg-amber-500 rounded-xl px-2 cursor-pointer'>닫기</button>
            </div>
        </div>
    )
}