# SupaNote App

## アプリケーション概要

現在のアプリケーションは、Supabase、React、Vite、TypeScript、Tailwind CSS、MUI6 を使用したノートアプリです。
基本的な CRUD 機能（作成・読取・更新・削除）と認証機能が実装されています。Vercel にデプロイされており、ユーザーごとにノートを分離して管理できる状態です。

## 技術スタック

- **フロントエンド**：React、TypeScript
- **ビルドツール**：Vite
- **スタイリング**：Tailwind CSS、MUI6
- **バックエンド**：Supabase
- **デプロイ先**：Vercel
- **認証**：Supabase の認証機能（メール・パスワード認証）

## アプリケーション構造

```bash
supa-note/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Auth.tsx        // 認証コンテナコンポーネント
│   │   │   ├── SignIn.tsx      // ログインフォーム
│   │   │   └── SignUp.tsx      // 新規登録フォーム
│   │   ├── DeleteConfirmDialog.tsx // 削除確認ダイアログ
│   │   ├── Header.tsx          // ヘッダーコンポーネント
│   │   ├── Note.tsx            // 個別ノート表示コンポーネント
│   │   ├── NoteForm.tsx        // ノート作成・編集フォーム
│   │   ├── NotesList.tsx       // ノート一覧コンポーネント
│   │   └── Notification.tsx    // 通知コンポーネント
│   ├── contexts/
│   │   └── AuthContext.tsx     // 認証状態管理コンテキスト
│   ├── lib/
│   │   └── supabase.ts         // Supabaseクライアント設定
│   ├── App.tsx                 // メインアプリケーションコンポーネント
│   ├── main.tsx                // エントリーポイント
│   ├── theme.ts                // MUIテーマ設定
│   └── index.css               // グローバルスタイル
├── .env                        // 環境変数設定
├── tailwind.config.js          // Tailwind設定
├── tsconfig.json               // TypeScript設定
└── package.json                // プロジェクト依存関係
```

## データモデル

### ノートテーブル（Supabase）

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES auth.users(id)
);
```

### セキュリティポリシー（RLS）

```sql
-- テーブルのRLSを有効化
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のノートのみにアクセスできるポリシー
CREATE POLICY "Users can only access their own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);
```

## 主要コンポーネント

### 1. 認証関連

- **AuthContext**: ユーザーの認証状態を管理し、アプリ全体で共有
- **Auth**: 認証フォーム（ログイン/新規登録）の切り替えを管理
- **SignIn/SignUp**: ログインと新規登録のフォーム

### 2. ノート管理関連

- **Note**: 個別のノートカードを表示
- **NotesList**: すべてのノートを一覧表示
- **NoteForm**: ノートの作成と編集のためのフォーム
- **DeleteConfirmDialog**: ノート削除前の確認ダイアログ

### 3. UI 共通コンポーネント

- **Header**: アプリのヘッダー（ログアウトボタンなど）
- **Notification**: ユーザーへのフィードバック（成功/エラー通知）

## API 操作

### Supabase API ラッパー

```typescript
// ノートの取得（ユーザーに紐づく）
async getNotes(): Promise<Note[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ノートの作成
async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note, user_id: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ノートの更新
async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ノートの削除
async deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
```

## 認証フロー

1. **ユーザー登録**:

   - ユーザーがメールとパスワードを入力
   - Supabase の`auth.signUp`メソッドを呼び出し
   - 登録成功後、自動的にログイン状態になる

2. **ログイン**:

   - ユーザーがメールとパスワードを入力
   - Supabase の`auth.signInWithPassword`メソッドを呼び出し
   - 認証成功後、AuthContext がユーザー情報を保持

3. **ログアウト**:
   - ユーザーがログアウトボタンをクリック
   - Supabase の`auth.signOut`メソッドを呼び出し
   - AuthContext が更新され、認証画面にリダイレクト

## データフロー

1. **ノート取得**:

   - アプリ起動時に`useEffect`内で`fetchNotes`を呼び出し
   - Supabase から現在のユーザーに紐づくノートを取得
   - 取得したデータを React 状態（`useState`）で管理

2. **ノート作成**:

   - ユーザーがフォームに入力
   - 送信ボタンクリックで`handleSubmitNote`を実行
   - Supabase の insert 操作でデータを保存
   - 成功後、ノート一覧を再取得して表示を更新

3. **ノート更新**:

   - ユーザーが編集ボタンをクリック
   - 既存データがフォームにロード
   - 編集後、送信ボタンクリックで`handleSubmitNote`を実行
   - Supabase の update 操作でデータを更新
   - 成功後、ノート一覧を再取得

4. **ノート削除**:
   - ユーザーが削除ボタンをクリック
   - 確認ダイアログを表示
   - 確認後、Supabase の delete 操作を実行
   - 成功後、ノート一覧を再取得

## デプロイ設定（Vercel）

- **環境変数**:

  - `VITE_SUPABASE_URL`: Supabase プロジェクトの URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase の公開 API キー

- **ビルド設定**:

  - フレームワークプリセット: Vite
  - ビルドコマンド: `npm run build`
  - 出力ディレクトリ: `dist`

- **デプロイ後の設定**:
  - Supabase の認証設定で、Vercel のドメインを許可リストに追加

## 今後の拡張ポイント

1. **ソーシャルログインの追加**: Google、GitHub、Twitter などの認証プロバイダーを追加
2. **リアルタイム機能**: Supabase のリアルタイムサブスクリプションを使用
3. **オフラインサポート**: ローカルストレージを使用したオフライン対応
4. **タグ付け機能**: ノートの分類とフィルタリング
5. **テーマ切り替え**: ダークモード/ライトモードの実装
6. **ノート共有機能**: 他のユーザーとのノート共有
7. **リッチテキストエディタ**: より高度な編集機能

---

## Supa Note

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],****
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
