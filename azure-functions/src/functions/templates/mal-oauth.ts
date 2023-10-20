export const myAnimeListOAuthGrantedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAuth Permission Granted</title>
    <style>
        @import url('https://fonts.googleapis.com/css?family=Press+Start+2P&display=swap');

        body {
            font-family: 'Press Start 2P', sans-serif;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .container {
            max-width: 800px;
            background-color: #222;
            border: 2px solid #e6007a;
            border-radius: 10px;
            padding: 20px;
            color: #fff;
            text-align: center;
        }

        h1 {
            color: #e6007a;
            font-size: 36px;
            text-transform: uppercase;
        }

        .message {
            font-size: 20px;
            margin-top: 20px;
            white-space: nowrap;
            overflow: hidden;
            border-right: 1px solid #e6007a;
            animation: typing 4s steps(40), blink-caret 0.75s step-end infinite;
        }

        .images-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
        }

        .image {
            max-width: 100%;
            border-radius: 10px;
            margin-top: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .myanimelist-logo {
            max-width: 150px;
            margin-top: 20px;
        }

        @keyframes typing {
            0% { width: 0; }
            100% { width: 100%; }
        }

        @keyframes blink-caret {
            from, to { border-color: transparent; }
            50% { border-color: #e6007a; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Access Granted for Muu-chan</h1>
        <div class="images-container">
            <img class="image" src="https://i.imgur.com/3Z1Rr08.png" alt="Anime Girl">
            <img class="myanimelist-logo" src="https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png" alt="MyAnimeList Logo">
        </div>
        <div class="message">
            Thank you for granting permissions uwu
        </div>
    </div>
</body>
</html>
`;
