// VS Code TypeScript destek stubları (Node.js/npm gerektirmez)
// Bu dosya Vercel build sürecini ETKİLEMEZ

declare module 'react' {
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useContext: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useReducer: any;
  export const createContext: any;
  export const forwardRef: any;
  export const memo: any;
  export const Fragment: any;
  export const Suspense: any;
  export const lazy: any;
  export const cloneElement: any;
  export const createElement: any;
  export const Children: any;
  export const isValidElement: any;
  export type FC<P = Record<string, unknown>> = any;
  export type ReactNode = any;
  export type ReactElement = any;
  export type Ref<T = any> = any;
  export type RefObject<T = any> = { current: T | null };
  export type MutableRefObject<T = any> = { current: T };
  export type Dispatch<A = any> = (action: A) => void;
  export type SetStateAction<S = any> = S | ((prev: S) => S);
  export type ChangeEvent<T = any> = any;
  export type MouseEvent<T = any, E = any> = any;
  export type KeyboardEvent<T = any> = any;
  export type FormEvent<T = any> = any;
  export type FocusEvent<T = any> = any;
  export type DragEvent<T = any> = any;
  export type CSSProperties = any;
  export type HTMLAttributes<T = any> = any;
  export type ComponentProps<T = any> = any;
  export type PropsWithChildren<P = Record<string, unknown>> = P & { children?: any };
  export type Context<T = any> = any;
  export default any;
}

declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  type FC<P = Record<string, unknown>> = any;
  type ChangeEvent<T = any> = any;
  type MouseEvent<T = any> = any;
  type KeyboardEvent<T = any> = any;
  type FormEvent<T = any> = any;
  type FocusEvent<T = any> = any;
  type DragEvent<T = any> = any;
  type Ref<T = any> = any;
  type RefObject<T = any> = { current: T | null };
  type MutableRefObject<T = any> = { current: T };
  type CSSProperties = any;
  type Dispatch<A = any> = (action: A) => void;
  type SetStateAction<S = any> = S | ((prev: S) => S);
  type HTMLAttributes<T = any> = any;
  type Context<T = any> = any;
  type PropsWithChildren<P = Record<string, unknown>> = P & { children?: any };
  type ComponentProps<T = any> = any;
  type ComponentType<P = any> = any;
  const useState: any;
  const useEffect: any;
  const useRef: any;
  const useContext: any;
  const useCallback: any;
  const useMemo: any;
  const createContext: any;
  const memo: any;
  const Fragment: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export const jsxDEV: any;
  export const Fragment: any;
}

declare module 'react-dom' {
  export const render: any;
  export const createRoot: any;
  export default any;
}

declare module 'react-dom/client' {
  export const createRoot: any;
  export const hydrateRoot: any;
}

declare module 'lucide-react' {
  type IconProps = { className?: string; size?: number | string; color?: string; strokeWidth?: number | string; style?: any; [key: string]: any };
  type Icon = (props: IconProps) => any;
  export const Search: Icon; export const Filter: Icon; export const Heart: Icon;
  export const ExternalLink: Icon; export const Tag: Icon; export const Download: Icon;
  export const FileText: Icon; export const Plus: Icon; export const Video: Icon;
  export const X: Icon; export const Trash2: Icon; export const Upload: Icon;
  export const ChevronDown: Icon; export const ChevronUp: Icon; export const ChevronLeft: Icon;
  export const ChevronRight: Icon; export const Check: Icon; export const Star: Icon;
  export const User: Icon; export const Users: Icon; export const LogOut: Icon;
  export const LogIn: Icon; export const Settings: Icon; export const BookOpen: Icon;
  export const Book: Icon; export const Code: Icon; export const Code2: Icon;
  export const Menu: Icon; export const Bell: Icon; export const Home: Icon;
  export const Compass: Icon; export const Edit: Icon; export const Edit2: Icon;
  export const Edit3: Icon; export const Eye: Icon; export const EyeOff: Icon;
  export const Lock: Icon; export const Unlock: Icon; export const Mail: Icon;
  export const AlertCircle: Icon; export const AlertTriangle: Icon; export const Info: Icon;
  export const HelpCircle: Icon; export const Globe: Icon; export const Link: Icon;
  export const Link2: Icon; export const Share: Icon; export const Share2: Icon;
  export const Copy: Icon; export const Loader: Icon; export const Loader2: Icon;
  export const RefreshCw: Icon; export const RotateCcw: Icon; export const Save: Icon;
  export const List: Icon; export const Grid: Icon; export const Image: Icon;
  export const ArrowLeft: Icon; export const ArrowRight: Icon; export const ArrowUp: Icon;
  export const ArrowDown: Icon; export const MoreHorizontal: Icon; export const MoreVertical: Icon;
  export const Zap: Icon; export const Clock: Icon; export const Calendar: Icon;
  export const Flag: Icon; export const MessageSquare: Icon; export const Send: Icon;
  export const Play: Icon; export const Pause: Icon; export const Folder: Icon;
  export const Trophy: Icon; export const Award: Icon; export const Layers: Icon;
  export const Database: Icon; export const Server: Icon; export const Terminal: Icon;
  export const Package: Icon; export const Hash: Icon; export const Phone: Icon;
  export const Monitor: Icon; export const Laptop: Icon; export const Activity: Icon;
  export const BarChart: Icon; export const BarChart2: Icon; export const TrendingUp: Icon;
  export const Shield: Icon; export const Ban: Icon; export const Undo2: Icon;
  export const Type: Icon; export const Palette: Icon; export const ArrowLeft: Icon;
  export const CheckCircle: Icon; export const XCircle: Icon;
  export const GithubIcon: Icon; export const Github: Icon;
  // catch-all
  export const [key: string]: Icon;
}

declare module 'firebase/firestore' {
  export const collection: any; export const doc: any; export const addDoc: any;
  export const setDoc: any; export const updateDoc: any; export const deleteDoc: any;
  export const getDoc: any; export const getDocs: any; export const query: any;
  export const where: any; export const orderBy: any; export const limit: any;
  export const onSnapshot: any; export const serverTimestamp: any; export const Timestamp: any;
  export const arrayUnion: any; export const arrayRemove: any; export const increment: any;
  export const deleteField: any; export const writeBatch: any; export const runTransaction: any;
  export const getFirestore: any; export const initializeFirestore: any;
  export type DocumentReference<T = any> = any;
  export type CollectionReference<T = any> = any;
  export type DocumentSnapshot<T = any> = any;
  export type QuerySnapshot<T = any> = any;
  export type Query<T = any> = any;
  export type FieldValue = any;
  export type Unsubscribe = () => void;
  export type DocumentData = { [key: string]: any };
  export type Firestore = any;
}

declare module 'firebase/app' {
  export const initializeApp: any; export const getApp: any; export const getApps: any;
  export type FirebaseApp = any;
}

declare module 'firebase/auth' {
  export const getAuth: any; export const createUserWithEmailAndPassword: any;
  export const signInWithEmailAndPassword: any; export const signOut: any;
  export const onAuthStateChanged: any; export const updateProfile: any;
  export const sendPasswordResetEmail: any; export const GoogleAuthProvider: any;
  export const signInWithPopup: any;
  export type Auth = any; export type User = any; export type UserCredential = any;
  export type Unsubscribe = () => void;
}

declare module 'firebase/storage' {
  export const getStorage: any; export const ref: any; export const uploadBytes: any;
  export const uploadBytesResumable: any; export const getDownloadURL: any;
  export const deleteObject: any; export const listAll: any;
  export type Storage = any; export type StorageReference = any;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements { [elemName: string]: any; }
  interface IntrinsicAttributes { key?: any; }
}
