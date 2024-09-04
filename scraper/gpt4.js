const axios = require("axios");

/*  Created by https://github.com/ztrdiamond !  Source: https://whatsapp.com/channel/0029VagFeoY9cDDa9ulpwM0T  "Aku janji jika hapus watermark ini maka aku rela miskin hingga 7 turunan"*/

async function chatgpt(messages, prompt = "Be a helpful assistant") {
  try {
    return await new Promise((resolve, reject) => {
      if (!messages) return reject("failed reading undefined messages!");
      if (!Array.isArray(messages)) return reject("invalid array messages input");
      axios.post("https://chatbot-ji1z.onrender.com/chatbot-ji1z", {
        messages: [
          ...((messages[0].role === "system") ? [] : [{
            role: "system",
            content: prompt
          }]), ...messages
        ]
      }).then(res => {
        if (!res.data?.choices[0].message) return reject("failed to get ai response!");
        return resolve({
          success: true,
          answer: res.data.choices[0].message.content
        });
      });
    });
  } catch (e) {
    return {
      success: false,
      errors: [e]
    };
  }
}

module.exports = chatgpt;