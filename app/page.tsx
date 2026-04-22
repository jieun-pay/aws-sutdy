'use client'

import {Modal} from '@/components/modal';
import {useState} from "react";

export default function Home() {
    const [modal, setModal] = useState(false);
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
        {modal && <Modal close={setModal}/>}
        <button onClick={() => setModal(!modal)} className="bg-[#333] text-white p-4 btn-neon py-4 px-8 rounded-xl text-lg font-bold tracking-widest uppercase">냥냥펀치🎵</button>
    </div>
  );
}
