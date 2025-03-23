"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { faEarthAmericas } from "@fortawesome/free-solid-svg-icons";
import CurrentFileIndicator from "@/components/CurrentFileIndicator";
import PageHeader from "@/components/PageHeader";
import GeneratorButton from "@/components/GenerateButton";
import VocabGenResultCard from "@/components/VocabGenResultCard";
import VocabGenResultPlaceholder from "@/components/VocabGenResultPlaceholder";
import ImageGenCard from "@/components/ImageGenCard";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("English");
  // 所有的單字生成結果清單
  const [vocabList, setVocabList] = useState([]);
  // 所有的圖片生成結果清單
  const [cardList, setCardList] = useState([]);
  // 是否在等待回應
  const [isWaiting, setIsWaiting] = useState(false);

  // 在組件加載時獲取歷史數據
  useEffect(() => {
    const fetchVocabList = async () => {
      try {
        const response = await axios.get("/api/vocab-ai");
        console.log("成功獲取歷史數據", response.data);
        setVocabList(response.data);
      } catch (error) {
        console.error("獲取歷史數據失敗", error);
      }
    };

    fetchVocabList();
  }, []);

  const languageList = ["English", "Japanese", "Korean", "Spanish", "French", "German", "Italian", "Norweigan", "Arabic"];

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("User Input: ", userInput);
    console.log("Language: ", language);
    const body = { userInput, language };
    console.log("body:", body);
    setIsWaiting(true);
    setUserInput(""); // 立即清空輸入框
    axios
      .post("/api/vocab-ai", body)
      .then((response) => {
        console.log("成功收到後端回應", response.data);
        setVocabList([response.data, ...vocabList]);
      })
      .catch((error) => {
        console.error("出了錯誤", error);
        alert("發生錯誤，請稍後再試");
      })
      .finally(() => {
        setIsWaiting(false);
      });
  }

  const imageSubmitHandler = (e) => {
    e.preventDefault();
    console.log("Image Input: ", userInput);
    const body = { userInput };
    setIsWaiting(true);
    setUserInput(""); // 立即清空輸入框
    axios
      .post("/api/image-ai", body)
      .then((response) => {
        console.log("成功收到後端回應", response.data);
        setCardList([response.data, ...cardList]);
      })
      .catch((error) => {
        console.error("出了錯誤", error);
        alert("發生錯誤，請稍後再試");
      })
      .finally(() => {
        setIsWaiting(false);
      });
  }

  return (
    <>
      <CurrentFileIndicator filePath="/app/page.js" />
      <PageHeader title="AI Vocabulary Generator" icon={faEarthAmericas} />
      <section>
        <div className="container mx-auto">
          <form onSubmit={submitHandler}>
            <div className="flex">
              <div className="w-3/5 px-2">
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  type="text"
                  className="border-2 focus:border-pink-500 w-full block p-3 rounded-lg"
                  placeholder="請輸入想要學習的關鍵字"
                  required
                />
              </div>
              <div className="w-1/5 px-2">
                <select
                  className="border-2 w-full block p-3 rounded-lg"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  {
                    languageList.map(language => <option key={language} value={language}>{language}</option>)
                  }
                </select>
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
          {/* 等待後端回應時要顯示的載入畫面 */}
          {isWaiting ? <VocabGenResultPlaceholder /> : null}

          {/* 渲染所有單字卡 */}
          {vocabList.map((result, index) => (
            <VocabGenResultCard
              key={index}
              result={result}
            />
          ))}

          {/* 渲染所有圖片生成卡 */}
          {cardList.map((result, index) => (
            <ImageGenCard
              key={index}
              result={result}
            />
          ))}
        </div>
      </section>
    </>
  );
}
