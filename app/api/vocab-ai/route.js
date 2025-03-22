import openai from "@/services/openai";
// 引入firebase 的 db
import db from "@/services/db";

// get 通常用於讀取資料
export async function GET() {
    // 預設是空陣列
    const vocabList = [];
    // 取得vocab-ai集合的所有文件，並按照createdAt降序排序
    const querySnapshot = await db.collection('vocab-ai').orderBy('createdAt', 'desc').get();

    // 遍歷每個文件並將資料加入vocabList陣列
    querySnapshot.forEach((doc) => {
        // doc.data()取得文件内容
        // 將文件id和内容一起加入陣列
        vocabList.push({
            id: doc.id,
            ...doc.data()
        });
    });

    // 將vocabList物件回傳給前端，所以前端也要對接傳來的資料
    return Response.json(vocabList);

}

// post 通常用於創建資料
export async function POST(req) {
    // 取得前端的資料
    const body = await req.json();
    console.log("body:", body);
    //分別取出body物件内的userInput以及language
    const { userInput, language } = body;


    // TODO: 透過gpt-4o-mini模型讓AI回傳相關單字
    // 文件連結：https://platform.openai.com/docs/guides/text-generation/chat-completions-api?lang=node.js
    // JSON Mode: https://platform.openai.com/docs/guides/text-generation/json-mode?lang=node.js
    const systemPrompt = `
    請作為一個單字聯想，根據所提供的單字聯想5個相關單字
    例如：

    聯想主題：水果
    語言： English

    輸出JSON格式
    {
        wordList: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
        zhWordList: ["蘋果", "香蕉", "櫻桃", "棗子", "接骨木"],
    }
    
    `;
    const propmpt = `聯想單字：${userInput}，語言：${language}`;

    const openAIReqBody = {
        messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": propmpt }
        ],
        model: "gpt-4o-mini",
        //開啓JSON模式
        response_format: { type: "json_object" },
    };
    //將物件丟給openai產生内容
    const completion = await openai.chat.completions.create(openAIReqBody);
    //取得openai回傳的内容
    const payload = completion.choices[0].message.content;
    //印出openai回傳的内容
    console.log("payload:", payload);
    //幫我填入result物件應該有的欄位：
    const result = {
        title: userInput,
        language: language,
        payload: JSON.parse(payload),
        createdAt: Date.now()
    }

    //等待 將result物件存入firebase的vocab-ai集合
    await db.collection("vocab-ai").add(result);
    // 上述任務完成後， 才會做以下的工作

    //要回傳給前端的資料 return Response.json(result);
    return Response.json(result);
}