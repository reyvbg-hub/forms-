const fs = require('fs');
let code = fs.readFileSync('src/lib/AuthContext.tsx', 'utf8');

code = code.replace(
  "import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser, browserPopupRedirectResolver } from 'firebase/auth';",
  "import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser, browserPopupRedirectResolver, signInAnonymously as firebaseSignInAnonymously } from 'firebase/auth';"
);

code = code.replace(
  "signInWithGoogle: () => Promise<void>;\n  signOut: () => Promise<void>;",
  "signInWithGoogle: () => Promise<void>;\n  signInAnonymously: () => Promise<void>;\n  signOut: () => Promise<void>;"
);

code = code.replace(
  "const signOut = async () => {",
  "const signInAnonymously = async () => {\n    try {\n      await firebaseSignInAnonymously(auth);\n    } catch (error: any) {\n      console.error('Error signing in anonymously:', error);\n      throw error;\n    }\n  };\n\n  const signOut = async () => {"
);

code = code.replace(
  "value={{ user, loading, signInWithGoogle, signOut }}",
  "value={{ user, loading, signInWithGoogle, signInAnonymously, signOut }}"
);

fs.writeFileSync('src/lib/AuthContext.tsx', code);
