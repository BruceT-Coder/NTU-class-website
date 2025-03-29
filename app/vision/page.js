"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import { faEye, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import VocabGenResultCard from "@/components/VocabGenResultCard";

export default function Vision() {
    const [isWaiting, setIsWaiting] = useState(false);
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    // 获取历史记录
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get("/api/vision-ai");
                console.log("歷史記錄:", response.data);
                setHistory(response.data);
            } catch (error) {
                console.error("獲取歷史記錄失敗:", error);
            }
        };

        fetchHistory();
    }, []);

    const changeHandler = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        console.log("file:", file);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target.result;
            console.log("base64:", base64String);

            try {
                setIsWaiting(true);
                const response = await axios.post("/api/vision-ai", {
                    base64: base64String
                });
                console.log("後端回應:", response.data);
                if (response.data.error) {
                    alert(response.data.error);
                    return;
                }
                setResult(response.data);
                setImage(base64String);
                // 更新历史记录
                setHistory([response.data, ...history]);
            } catch (error) {
                console.error("發送失敗:", error);
                alert(error.response?.data?.error || "圖片處理失敗，請稍後再試");
            } finally {
                setIsWaiting(false);
            }
        };

        reader.readAsDataURL(file);
    }

    return (
        <>
            <CurrentFileIndicator filePath="/app/vision/page.js" />
            <PageHeader title="AI Vision" icon={faEye} />
            <section>
                <div className="container mx-auto">
                    <label
                        htmlFor="imageUploader"
                        className="inline-block bg-indigo-300 hover:bg-indigo-200 p-3 rounded-lg"
                    >
                        上傳圖片
                    </label>
                    <input
                        className="hidden"
                        id="imageUploader"
                        type="file"
                        onChange={changeHandler}
                        accept=".jpg, .jpeg, .png"
                    />
                </div>
            </section>
            <section>
                <div className="container mx-auto">
                    {isWaiting && (
                        <div className="text-center py-4">
                            <div className="flex items-center justify-center space-x-2">
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin text-indigo-500 text-2xl"
                                />
                                <span className="text-gray-600">AI 正在分析圖片中...</span>
                            </div>
                        </div>
                    )}
                    {image && (
                        <div className="mt-4">
                            <img src={image} alt="上傳的圖片" className="max-w-md mx-auto rounded-lg shadow-lg" />
                        </div>
                    )}
                    {result && (
                        <div className="mt-4">
                            <div className="p-4 bg-white rounded-lg shadow mb-4">
                                <h3 className="text-lg font-semibold mb-2">圖片描述：</h3>
                                <p className="text-gray-700">{result.title}</p>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">相關單字：</h3>
                            {result.payload && result.payload.wordList && result.payload.wordList.length > 0 ? (
                                <VocabGenResultCard result={result} />
                            ) : (
                                <p className="text-gray-500">暫無相關單字</p>
                            )}
                        </div>
                    )}
                    {history.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold mb-4">歷史記錄</h2>
                            {history.map((item, index) => (
                                <div key={item.id || index} className="mb-6">
                                    <div className="p-4 bg-white rounded-lg shadow mb-4">
                                        <h3 className="text-lg font-semibold mb-2">圖片描述：</h3>
                                        <p className="text-gray-700">{item.title}</p>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">相關單字：</h3>
                                    {item.payload && item.payload.wordList && item.payload.wordList.length > 0 ? (
                                        <VocabGenResultCard result={item} />
                                    ) : (
                                        <p className="text-gray-500">暫無相關單字</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}