import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../Toast/Toast';
import styles from './LoginPage.module.css';

function LoginPage() {
  const { login } = useAuth();
  const { toast, showToast } = useToast();

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      showToast('Google authentication failed. Please try again.', 'error');
      return;
    }

    try {
      await login(credential);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      showToast(message, 'error');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>ADHD</h1>
        <p className={styles.loginSubtitle}>Sign in with your institutional Google account</p>
        <div className={styles.googleButtonWrapper}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => showToast('Google authentication failed.', 'error')}
          />
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}

export default LoginPage;
