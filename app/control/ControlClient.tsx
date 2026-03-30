"use client";

import { useState, useEffect } from "react";
import { AlcoholIcon, LazyIcon, DesireIcon } from "@/components/icons";

export default function ControlClient(){
  const [impulseType, setInpulseType] = useState<null|"alcohol"|"cheat"|"lust">(null)
  const impulseLabelMap: Record<"alcohol" | "cheat" | "lust", string> 
    = { "alcohol": "お酒", "cheat": "サボり", "lust": "その他"}
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
                  負けそうなときに表示したい画像とコメントを登録(jpeg, png, gif)
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
                  // accept="image/*"
                  // Do not accept HEIC
                  accept="image/jpeg, image/png, image/webp, image/gif"
                  // when file selection happens (an file is chosen), function is executed.
                  // e.target is input element here.
                  onChange={async (e) => {
                    const file = e.target.files?.[0] ?? null;
                    
                    if (file) {
                      const allowedTypes = ["image/jpeg","image/png","image/webp","image/gif"];

                      if (!allowedTypes.includes(file.type)) {
                        alert("JPG, PNG, WebP形式の画像をご指定ください")
                        e.target.value="";
                        setSelectedFile(null)
                        return;
                      }
                  }

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