import openai from "@/services/openai";
import axios from "axios";
// import firebase 的 database
import db from "@/services/firebase"; //db.collect.add的方式來儲存

export async function GET() {
    const cardList = [];

    // 從 Firebase 的 images-ai 集合獲取資料
    const snapshot = await db.collection("images-ai")
        .orderBy("createdAt", "desc") // 按 createdAt 降序排序
        .get();

    // 遍歷每個文件並將資料加入cardList陣列
    snapshot.forEach((doc) => {
        cardList.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return Response.json(cardList);
}

export async function POST(req) {
    const body = await req.json();
    console.log("body:", body); //後端的console.log會印在終端機裏面
    const { userInput } = body; //從body裏面解構出userInput, const 是創建變數的方法
    console.log("userInput:", userInput);
    // 透過dall-e-3模型讓AI產生圖片
    // 文件連結: https://platform.openai.com/docs/guides/images/usage

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: userInput,
        n: 1,
        size: "1024x1024",
    });// openai 的images.generate 方法
    //openai 產生圖片的網址（暫時性的網址）
    const openAIImageURL = response.data[0].url;
    console.log("openAIImageURL:", openAIImageURL);

    //將openai 產生圖片的網址利用axios上傳到imgur
    const imgurResponse = await axios.post("https://api.imgur.com/3/image", {
        image: openAIImageURL,
        title: userInput,
    }, {
        headers: {
            "Authorization": `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        }
    });

    const imageURL = imgurResponse.data.data.link;
    console.log("imgurURL：", imageURL);

    const data = {
        imageURL: imageURL, // 使用 Imgur 的永久 URL
        prompt: userInput,
        createdAt: new Date().getTime(),//取得當前時間的時間戳記
    }//大刮號就是物件

    // 使用 Admin SDK 的方式添加数据
    try {
        const docRef = await db.collection("images-ai").add(data);
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }

    return Response.json(data);
}