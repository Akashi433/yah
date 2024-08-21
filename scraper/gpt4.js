var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
/**
 * Scraped By Kaviaann
 * Protected By MIT LICENSE
 * Whoever caught removing wm will be sued
 * @description Any Request? Contact me : vielynian@gmail.com
 * @author Kaviaann 2024
 * @copyright https://whatsapp.com/channel/0029Vac0YNgAjPXNKPXCvE2e
 */
export function gpt4(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const token = Math.random().toString(32).substring(2);
                const d = process.hrtime();
                // ? REGISTER PROMPT
                yield axios.post("https://thobuiq-gpt-4o.hf.space/run/predict?__theme=light", {
                    data: [{ text: prompt, files: [] }],
                    event_data: null,
                    fn_index: 3,
                    session_hash: token,
                    trigger_id: 18,
                }, {
                    headers: {
                        Origin: "https://thobuiq-gpt-4o.hf.space",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                    },
                });
                // JOIN
                yield axios.post("https://thobuiq-gpt-4o.hf.space/queue/join?__theme=light", {
                    data: [null, null, "idefics2-8b-chatty", "Greedy", 0.7, 4096, 1, 0.9],
                    event_data: null,
                    fn_index: 5,
                    session_hash: token,
                    trigger_id: 18,
                }, {
                    headers: {
                        Origin: "https://thobuiq-gpt-4o.hf.space",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                    },
                });
                // ? HANDLE RESULT
                const stream = yield axios.get("https://thobuiq-gpt-4o.hf.space/queue/data?" +
                    new URLSearchParams({
                        session_hash: token,
                    }), {
                    headers: {
                        Accept: "text/event-stream",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                    },
                    responseType: "stream",
                });
                stream.data.on("data", (chunk) => {
                    const data = JSON.parse(chunk.toString().split("data: ")[1]);
                    if (data.msg === "process_completed") {
                        const stop = process.hrtime(d);
                        const r = data.output.data[0][0][1] || "";
                        if (!r)
                            return reject("Fail to get response");
                        resolve({
                            prompt,
                            response: r,
                            duration: stop[0] + " s",
                        });
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        }));
    });
}
