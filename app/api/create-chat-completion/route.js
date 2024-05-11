import { NextResponse } from "next/server";

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
    const req = await request.json()

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: req.messages,
      });

      return NextResponse.json(response.data.choices[0].message)
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

