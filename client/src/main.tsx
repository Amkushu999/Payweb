import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill for TextEncoder/TextDecoder
if (typeof window.TextEncoder === 'undefined') {
  window.TextEncoder = function TextEncoder() {};
  TextEncoder.prototype.encode = function encode(str: string) {
    const utf8 = unescape(encodeURIComponent(str));
    const result = new Uint8Array(utf8.length);
    for (let i = 0; i < utf8.length; i++) {
      result[i] = utf8.charCodeAt(i);
    }
    return result;
  };
}

if (typeof window.TextDecoder === 'undefined') {
  window.TextDecoder = function TextDecoder() {};
  TextDecoder.prototype.decode = function decode(buffer: Uint8Array) {
    const utf8 = String.fromCharCode.apply(null, Array.from(buffer));
    return decodeURIComponent(escape(utf8));
  };
}

createRoot(document.getElementById("root")!).render(<App />);
