"use client";

import { useState, useEffect } from "react";


function AlcoholIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12l-1 5H7L6 3z" />
      <path d="M8 8h8" />
      <path d="M12 8v10" />
      <path d="M9 21h6" />
    </svg>
  );
}

function LazyIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h16v4H4z" />
      <path d="M6 10h12v4H6z" />
    </svg>
  );
}

function DesireIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20s-6-4.5-8-8c-1.5-2.5.5-6 4-6 2 0 3 1.5 4 3 1-1.5 2-3 4-3 3.5 0 5.5 3.5 4 6-2 3.5-8 8-8 8z" />
    </svg>
  );
}


export default function ControlClient(){
  const [impulseType, setInpulseType] = useState<null|"alcohol"|"cheat"|"lust">(null)
  const impulseLabelMap: Record<"alcohol" | "cheat" | "lust", string> 
    = { "alcohol": "お酒", "cheat": "サボり", "lust": "肉欲"}
  const [title, setTitle] = useState<string>("");
  const [nonce, setNonce] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [inputTitle, setInputTitle] = useState("")
  

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
          <div className="flex items-center gap-1 text-sm text-gray-200">
            <button
              onClick={() => {
                setInpulseType("alcohol");
                setNonce(n=>n+1);
              }}
              className="
                flex items-center gap-1
                px-6 py-4 rounded-xl 
                text-lg
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
                hover:bg-yellow-100
              "
            >
              <AlcoholIcon />
              <span> お酒 </span>
            </button>

            <button
              onClick={() => {
                setInpulseType("cheat");
                setNonce(n => n+1);
              }}
              className="
                flex items-center gap-1
                px-6 py-4 rounded-xl 
                text-lg
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
                hover:bg-blue-100
              "
            >
              <LazyIcon />
              <span> サボり </span>
            </button>

            <button
              onClick={() => {
                setInpulseType("lust");
                setNonce(n=>n+1);
              }}
              className="
                flex items-center gap-1
                px-6 py-4 rounded-xl 
                text-lg
                transition-all duration-200
                hover:scale-105 hover:shadow-lg
                hover:bg-pink-100
              "
            >
              < DesireIcon />
              <span> その他の煩悩 </span>
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

          {impulseType &&(
            <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
              onClick={()=> setShowModal(true)}
            >
              画像を追加
            </button>
          )}

          {showModal && impulseType &&(
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  {impulseLabelMap[impulseType]}用の画像を追加
                </h3>
                <p className="text-sm text-gray-400">
                  負けそうなときに表示される画像とコメントを登録します
                </p>
                <input 
                  type="text" 
                  placeholder="喝なコメント"
                  value={inputTitle}
                  onChange={(e)=> {
                    setInputTitle(e.target.value);  
                  }}
                  className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  // when file selection happens (an file is chosen), function is executed.
                  // e.target is input element here.
                  onChange={async (e) => {
                   const file = e.target.files?.[0] ?? null;
                   setSelectedFile(file)
                  }}
                  className="block w-full text-sm text-gray-400
                             file:mr-4 file:py-2 file:px-4
                             file:rounded file:border-0
                             file:text-sm file:font-semibold
                             file:bg-gray-700 file:text-white
                             hover:file:bg-gray-600"
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={async ()=>{
                      const form = new FormData();
                      form.append("title", inputTitle)
                      form.append("impulseType", impulseType!);
                      if (!selectedFile) return;
                      form.append("image", selectedFile);

                      const res = await fetch("/api/uploadImage", {
                        method: "POST",
                        body: form,
                      });
                      if (!res.ok) { 
                        alert("upload failed") 
                      } else {
                        setShowModal(false);
                        setInputTitle("");
                        setNonce(n => n+1)
                      }
                    }}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                  >
                  送信
                  </button>
                  <button
                    onClick={()=>{
                      setInputTitle("");
                      setShowModal(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200"
                    >
                    キャンセル
                  </button>
                </div>
              </div>
            </div> 
          )}
        </div>
      </div>
    </>
  );
}