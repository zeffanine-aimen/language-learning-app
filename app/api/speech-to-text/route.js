import { NextResponse } from "next/server";
import * as fs from 'fs';
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export async function POST(request) {
    if(!configuration.apiKey){
        return NextResponse.json(
          {
          error: "يرجى التأكد من إضافتك ال API_KEY الخاص بك ومن صلاحيته!"
          },
          {
            status: 500
          }
        )
      }

      try {
      const formData = await request.formData();
      const audio_file = formData.get("file");
      const buffer = await convertToBuffer(audio_file);
      buffer.name = audio_file.originalname + '.mp3';
  
      const response = await openai.createTranscription(
          buffer,
          "whisper-1",
          undefined,
          'json',
          1,
          'en'
      )
  
  
      return NextResponse.json(response.data)
    } catch (error) {
        if(error.response.status == 401) {
            return NextResponse.json(
                {
                error: "يرجى التأكد من إضافتك ال API_KEY الخاص بك ومن صلاحيته!"
                },
                {
                status: 401
                }
                )
            } else if(error.response.status == 429) {
            return NextResponse.json(
            {
                error : "حدث خطأ في الاستجابة من الخادم بسبب أنك قمت بأكثر من طلب خلال فترة زمنية قصيرة، يرجى الانتظار قليلًا ومن ثم المحاولة مرة أخرى!"}, 
                {status: 429}
            ) 
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            return NextResponse.json({
                error : "هنالك مشكلة في الخادم، نرجو المحاولة لاحقًا!"
            }, {status: 500})
        }
    }


}

async function convertToBuffer(file) {
    const stream = file.stream()

    const chunks = [];

    for await (const chunk of stream){
        chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    return buffer;
}