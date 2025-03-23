"use client";

import { useState } from "react";
import axios from "axios";
import { faImage } from "@fortawesome/free-solid-svg-icons"
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import GeneratorButton from "@/components/GenerateButton";
import ImageGenCard from "@/components/ImageGenCard";
//用來呈現圖像生成結果的卡片
import ImageGenPlaceholder from "@/components/ImageGenPlaceholder";
//圖像生成過程中，呈現loading效果的卡片
export default function ImgGen() {
    const [userInput, setUserInput] = useState("");
    // 是否在等待回應
    const [isWaiting, setIsWaiting] = useState(false);

    // 表單送出後會執行的流程
    const submitHandler = (e) => {
        e.preventDefault();
        console.log("User Input: ", userInput);
        const body = { userInput };
        console.log("body:", body);

        // 設定isWaiting為true，表示正在等待回應
        setIsWaiting(true);
        // TODO: 將body POST到 /api/image-ai { userInput: "" }
        axios.post("/api/image-ai", body)
            // 如果成功，顯示來自後端的回應資料 箭頭函式 =>
            .then((response) => {

                console.log("後端回傳的資料:", response);
            })
            // 發生任何錯誤（例如網路連線錯誤，語法有錯， 對接第三方服務有問題），都會進到catch區塊
            .catch((err) => {
                console.log("發生錯誤:", err);
            })
            .finally(() => {
                setIsWaiting(false);
            })
    }

    return (
        <>
            <CurrentFileIndicator filePath="/app/image-generator/page.js" />
            <PageHeader title="AI圖像生成器" icon={faImage} />
            <section>
                <div className="container mx-auto">
                    <form onSubmit={submitHandler}>
                        <div className="flex">
                            <div className="w-4/5 px-2">
                                <input
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    type="text"
                                    className="border-2 focus:border-pink-500 w-full block p-3 rounded-lg"
                                    placeholder="Enter a word or phrase"
                                    required
                                />
                            </div>
                            <div className="w-1/5 px-2">
                                <GeneratorButton />
                            </div>
                        </div>
                    </form>
                </div>
            </section>
            <section>
                <div className="container mx-auto grid grid-cols-4">
                    {/* TODO: 顯示AI輸出結果 */}
                    {/* 如果isWaiting為true，顯示ImageGenPlaceholder */}
                    {isWaiting && <ImageGenPlaceholder />}

                </div>
            </section>
        </>
    )
}