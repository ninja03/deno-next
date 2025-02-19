export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>ホームページ</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
          }
          body {
            background: linear-gradient(45deg, #ffcc00, #ff66cc);
            font-family: 'Comic Sans MS', cursive, sans-serif;
            color: #000;
            padding: 20px;
          }
          header {
            background-color: #ff69b4;
            padding: 10px;
            border: 3px dotted #000;
            margin-bottom: 20px;
          }
          nav ul {
            list-style: none;
            display: flex;
            gap: 10px;
          }
          nav a {
            color: #0000ff;
            text-decoration: underline;
          }
          main {
            background-color: #fff;
            padding: 20px;
            border: 2px solid #000;
          }
          footer {
            margin-top: 20px;
            padding: 10px;
            background-color: #ff69b4;
            border: 3px dotted #000;
            text-align: center;
          }
        `}</style>
      </head>
      <body>
        <header>
          <h1>ホームページ</h1>
          <nav>
            <ul>
              <li><a href="/">トップページ</a></li>
              <li><a href="/self-introduction">自己紹介</a></li>
              <li><a href="/tetris">テトリスを遊ぶ</a></li>
            </ul>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>&copy; Web</p>
        </footer>
      </body>
    </html>
  );
}
