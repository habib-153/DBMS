"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Base64 from "base64-js";

import envConfig from "@/src/config/envConfig";

const generateImageDescription = async (imageURL: string, prompt: string) => {
  const imageBase64 = await fetch(imageURL)
  .then(res => res.arrayBuffer())
  .then(arrayBuffer => Base64.fromByteArray(new Uint8Array(arrayBuffer)));

  const contents = [{ role: "user", parts: [{
    inline_data: { mime_type: "image/jpeg", data: imageBase64 }
  }, { text: prompt }] }];

  const genAI = new GoogleGenerativeAI(envConfig.gemini_api_key as string);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   @ts-ignore
  const result = await model.generateContentStream({ contents });

  let resultText = "";

  for await (const content of result.stream){
    resultText += content.text();
  }

  return resultText;
};

export default generateImageDescription;