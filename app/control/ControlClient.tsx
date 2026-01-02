"use client";

import { useState, useEffect } from "react";


export default function ControlClient(){
  const [impulseType, setInpulseType] = useState<null|"alcohol"|"cheat"|"lust">(null)
  const [title, setTitle] = useState<string>("");
  const [nonce, setNonce] = useState(0);

  useEffect(()=>{
    if (!impulseType) return;

    async function load() {
      const res = await fetch(`/api/impulseImage?type=${impulseType}&n=${nonce}`);
      if (!res.ok) {
        console.error("API error", res.status);
        return;
      }

      const headerTitle = res.headers.get("X-Image-Title");
      setTitle(headerTitle ? decodeURIComponent(headerTitle) : "")
    }

    load();
  }, [impulseType, nonce])

  return (
    <>
      <div className="min-h-screen px-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center space-y-10">
          {/*
          <button onClick={()=>setInpulseType("alcohol")}>🍺 お酒</button>
          <button onClick={()=>setInpulseType("cheat")}>🤥 サボり</button>
          <button onClick={()=>setInpulseType("lust")}>❤️ 肉欲</button>
          */}
          <div className="flex gap-6">
            <button
              onClick={() => {
                setInpulseType("alcohol");
                setNonce(n=>n+1);
              }}
              className="
                px-6 py-4 rounded-xl text-lg
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
                hover:bg-yellow-100
              "
            >
              🍺 お酒
            </button>

            <button
              onClick={() => {
                setInpulseType("cheat");
                setNonce(n => n+1);
              }}
              className="
                px-6 py-4 rounded-xl text-lg
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
                hover:bg-blue-100
              "
            >
              🤥 サボり
            </button>

            <button
              onClick={() => {
                setInpulseType("lust");
                setNonce(n=>n+1);
              }}
              className="
                px-6 py-4 rounded-xl text-lg
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
                hover:bg-pink-100
              "
            >
              ❤️ 肉欲
            </button>
          </div>
          {impulseType && (
            <div className="flex flex-col items-center space-y-4">
              {/* impulse can be null from when you initiate useState so optional chain; ? is must. 
                  undefined returns when impulse is null
              */}
              <h2
                className="text-xl font-semibold text-center"
              > 
                {title}
              </h2>
              <img
                key={nonce}
                src={`/api/impulseImage?type=${impulseType}&n=${nonce}`} 
                className="max-w-md w-full rounded-xl shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}