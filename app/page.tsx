'use client'

import {Modal} from '@/components/modal';
import {useState} from "react";
import Link from 'next/link';

export default function Home() {
    const [modal, setModal] = useState(false);
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
        {modal && <Modal close={setModal}/>}
        <button onClick={() => setModal(!modal)} className="bg-[#333] text-white p-4 btn-neon py-4 px-8 rounded-xl text-lg font-bold tracking-widest uppercase">냥냥펀치🎵</button>
        <Link href='/payments' className='mt-4 bg-blue-700 text-white p-4 btn-neon py-4 px-8 rounded-xl text-lg font-bold tracking-widest uppercase'>결제하러가자</Link>
    </div>
  );
}
