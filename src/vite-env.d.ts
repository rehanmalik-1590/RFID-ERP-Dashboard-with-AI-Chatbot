/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'react-toastify/dist/ReactToastify.css' {
  const content: string;
  export default content;
}