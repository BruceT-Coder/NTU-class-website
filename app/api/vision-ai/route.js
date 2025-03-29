import openai from "@/services/openai";
import db from "@/services/db";

export async function GET() {
    try {
        // 从 Firebase 的 vision-ai 集合获取数据
        const snapshot = await db.collection("vision-ai")
            .orderBy("createdAt", "desc") // 按 createdAt 降序排序
            .get();

        const results = [];
        snapshot.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return Response.json(results);
    } catch (error) {
        console.error("獲取歷史記錄失敗:", error);
        return Response.json({ error: "獲取歷史記錄失敗" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("body:", body);
        const { base64 } = body;

        if (!base64) {
            return Response.json({
                error: "未提供圖片數據",
                title: "",
                payload: {
                    wordList: [],
                    zhWordList: []
                }
            }, { status: 400 });
        }

        // 确保 base64 字符串格式正确
        const base64Data = base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;

        // 调用 OpenAI Vision API
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",  // 使用 gpt-4o-mini 模型
            messages: [
                {
                    role: "system",
                    content: "你是一個專業的圖片分析師和英語教師。請分析圖片並提供相關的英文單字學習。請嚴格按照以下 JSON 格式回傳：\n{\n  \"aiText\": \"圖片的詳細描述\",\n  \"wordList\": [\"英文單字1\", \"英文單字2\", \"英文單字3\", \"英文單字4\", \"英文單字5\"],\n  \"zhWordList\": [\"中文解釋1\", \"中文解釋2\", \"中文解釋3\", \"中文解釋4\", \"中文解釋5\"]\n}\n注意：\n1. 必須是有效的 JSON 格式\n2. 必須包含所有三個欄位：aiText、wordList、zhWordList\n3. wordList 和 zhWordList 必須是陣列，且長度必須相同\n4. 描述和解釋必須使用繁體中文"
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "請分析這張圖片，用繁體中文描述內容，並提供5個相關的英文單字及其中文解釋。" },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Data
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        });

        console.log("OpenAI 响应:", response.choices[0].message.content);

        try {
            const aiResponse = JSON.parse(response.choices[0].message.content);
            const result = {
                title: aiResponse.aiText,
                language: "English",
                payload: {
                    wordList: aiResponse.wordList,
                    zhWordList: aiResponse.zhWordList
                },
                createdAt: Date.now()
            };

            // 保存到 Firebase
            const docRef = await db.collection("vision-ai").add(result);
            console.log("Document written with ID: ", docRef.id);

            return Response.json(result);
        } catch (parseError) {
            console.error("JSON 解析错误:", parseError);
            return Response.json({
                error: "AI 回應格式錯誤",
                title: response.choices[0].message.content,
                language: "English",
                payload: {
                    wordList: [],
                    zhWordList: []
                },
                createdAt: Date.now()
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Vision API 錯誤:", error);
        return Response.json({
            error: error.message || "圖片識別失敗",
            title: "",
            language: "English",
            payload: {
                wordList: [],
                zhWordList: []
            },
            createdAt: Date.now()
        }, { status: 500 });
    }
}