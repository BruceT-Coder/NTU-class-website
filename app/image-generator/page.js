"use client";

import { useState, useEffect } from "react";
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    //設立一個新狀態 cardlist 預設值是空陣列[] useState 是設立一個新狀態
    const [cardlist, setCardlist] = useState([]); //新狀態是空陣列

    // 在組件加載時獲取歷史數據
    useEffect(() => {
        const fetchImageList = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/api/image-ai");
                console.log("成功獲取歷史數據", response.data);
                setCardlist(response.data);
                setError(null);
            } catch (error) {
                console.error("獲取歷史數據失敗", error);
                setError("獲取歷史數據失敗，請稍後再試");
            } finally {
                setIsLoading(false);
            }
        };

        fetchImageList();
    }, []);

    // 表單送出後會執行的流程
    const submitHandler = (e) => {
        e.preventDefault();
        console.log("================================================");
        //console.log("User Input: ", userInput);
        const body = { userInput };
        console.log("body:", body);

        // 設定isWaiting為true，表示正在等待回應
        setIsWaiting(true);
        //清空輸入框
        setUserInput("");
        setError(null);
        //將body POST到 /api/image-ai { userInput: "" } 送到後端
        axios.post("/api/image-ai", body)
            // 如果成功，顯示來自後端的回應資料 箭頭函式 =>
            .then((response) => {
                console.log("後端回傳的資料:", response.data);
                setCardlist([response.data, ...cardlist]); // 將新結果加入到列表最前面
            })
            // 發生任何錯誤（例如網路連線錯誤，語法有錯， 對接第三方服務有問題），都會進到catch區塊
            .catch((err) => {
                console.error("發生錯誤:", err);
                alert("發生錯誤，請稍後再試");
                setIsWaiting(false); //不用等待了
                setError("生成圖片失敗，請稍後再試");
            })
            .finally(() => {
                setIsWaiting(false);
            });
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
                <div className="container mx-auto">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div className="grid grid-cols-4 gap-4">
                        {isWaiting && <ImageGenPlaceholder />}
                        {isLoading ? (
                            <div className="col-span-4 text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                            </div>
                        ) : (
                            cardlist.map((result, index) => (
                                <ImageGenCard
                                    key={index}
                                    imageURL={result.imageURL}
                                    prompt={result.prompt}
                                    createdAt={result.createdAt}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}