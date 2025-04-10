import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {authApi, UserInfo} from "../lib/supabase";

type AuthRequiredProps = {
  children: React.ReactNode;
};

export default function AuthRequired({children}: AuthRequiredProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
        if (!currentUser) {
          navigate("/login");
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return null; // ナビゲーションが実行されるため、何も表示しない
  }

  return <>{children}</>;
}
