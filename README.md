# react-web-app-with-openai

# [https://bit.ly/ntu-ai-web-4](https://bit.ly/ntu-ai-web-4)

安裝所需套件 有node_modules就是有安裝過套件了
```
npm i
```

啟動開發伺服器
```
npm run dev
```

## 環境變數範例

.env
```
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
```

## 安裝Git

1. 至 [Git官方網站](https://www.git-scm.com/) 下載並且安裝 Git
2. 設定使用者名稱與Email

```
git config --global user.name "Bruce"
git config --global user.email brucetsao@gmail.com
```


## 更新至Github
```
git add .
git commit -m "這次所執行的變更"
git push origin main
```

## 第一次推送到Github 的指令

git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/BruceT-Coder/NTU-class-website.git
git push -u origin main